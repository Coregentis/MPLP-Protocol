"""
Path utilities for Golden Harness - Protocol-level path resolution with wildcard support.

This module provides path parsing and value extraction capabilities that are semantically
aligned with the TypeScript implementation (tests/golden/harness/ts/path-utils.ts).

Supports:
- Property access: foo.bar
- Array indexing: items[0].id
- Wildcard iteration: items[*].id (expands to items[0].id, items[1].id, ...)
- Nested wildcards: root_span.children[*].tags[*]
"""

from typing import List, Any, Union, NamedTuple
from dataclasses import dataclass


@dataclass
class PropToken:
    """Property access token (e.g., 'foo' in 'foo.bar')."""
    name: str
    type: str = "prop"


@dataclass
class IndexToken:
    """Array index token (e.g., '[0]' in 'items[0]')."""
    index: int
    type: str = "index"


@dataclass
class WildcardToken:
    """Array wildcard token (e.g., '[*]' in 'items[*]')."""
    type: str = "wildcard"


PathToken = Union[PropToken, IndexToken, WildcardToken]


class Node(NamedTuple):
    """A node in the path traversal result."""
    path: str
    value: Any


def parse_path(path: str) -> List[PathToken]:
    """
    Parse a path string into a sequence of tokens.
    
    Supports:
    - Dot notation: foo.bar.baz
    - Array indexing: items[0]
    - Wildcards: items[*]
    - Mixed: root_span.children[*].tags[0]
    
    Args:
        path: Path string to parse
        
    Returns:
        List of path tokens
        
    Raises:
        ValueError: If path syntax is invalid
        
    Examples:
        >>> parse_path("steps[*].description")
        [PropToken(name='steps'), WildcardToken(), PropToken(name='description')]
        
        >>> parse_path("root_span.children[1].name")
        [PropToken(name='root_span'), PropToken(name='children'), 
         IndexToken(index=1), PropToken(name='name')]
    """
    tokens: List[PathToken] = []
    i = 0
    n = len(path)
    current = ""
    
    def push_prop():
        nonlocal current
        if current:
            tokens.append(PropToken(name=current))
            current = ""
    
    while i < n:
        ch = path[i]
        
        if ch == ".":
            # Segment separator
            push_prop()
            i += 1
            continue
        
        if ch == "[":
            # Flush property before bracket
            push_prop()
            end = path.find("]", i)
            if end == -1:
                raise ValueError(f"Invalid path, missing ] in: {path}")
            inside = path[i + 1:end].strip()
            if inside == "*":
                tokens.append(WildcardToken())
            else:
                try:
                    idx = int(inside)
                    tokens.append(IndexToken(index=idx))
                except ValueError:
                    raise ValueError(f"Invalid array index in path: {path}")
            i = end + 1
            continue
        
        # Normal char for property name
        current += ch
        i += 1
    
    push_prop()
    return tokens


def get_value_nodes_by_path(root: Any, path: str) -> List[Node]:
    """
    Traverse a path and return all matching nodes (with actual paths).
    
    Supports wildcard expansion: steps[*].description returns all step descriptions
    with their precise paths (steps[0].description, steps[1].description, ...).
    
    Args:
        root: Root object to traverse
        path: Path string (supports wildcards)
        
    Returns:
        List of Nodes with (path, value) pairs for all matches
        
    Examples:
        >>> obj = {"steps": [{"description": "A"}, {"description": "B"}]}
        >>> nodes = get_value_nodes_by_path(obj, "steps[*].description")
        >>> [(n.path, n.value) for n in nodes]
        [('steps[0].description', 'A'), ('steps[1].description', 'B')]
    """
    tokens = parse_path(path)
    # Each step maintains a list of candidate nodes
    nodes: List[Node] = [Node(path="", value=root)]
    
    for token in tokens:
        next_nodes: List[Node] = []
        
        for node in nodes:
            value = node.value
            
            if value is None:
                continue
            
            if isinstance(token, PropToken):
                if isinstance(value, dict) and token.name in value:
                    new_path = f"{node.path}.{token.name}" if node.path else token.name
                    next_nodes.append(Node(path=new_path, value=value[token.name]))
                    
            elif isinstance(token, IndexToken):
                if isinstance(value, list) and len(value) > token.index:
                    new_path = f"{node.path}[{token.index}]"
                    next_nodes.append(Node(path=new_path, value=value[token.index]))
                    
            elif isinstance(token, WildcardToken):
                if isinstance(value, list):
                    for i, item in enumerate(value):
                        new_path = f"{node.path}[{i}]"
                        next_nodes.append(Node(path=new_path, value=item))
        
        nodes = next_nodes
    
    return nodes
