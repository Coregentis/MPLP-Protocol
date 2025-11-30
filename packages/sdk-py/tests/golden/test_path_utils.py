"""
Unit tests for path_utils - Protocol-level path parsing and wildcard expansion.

Tests semantic alignment with TypeScript path-utils.ts implementation.
"""

import pytest
from .harness.path_utils import (
    parse_path, get_value_nodes_by_path,
    PropToken, IndexToken, WildcardToken, Node
)


class TestParsePath:
    """Test path parsing into tokens."""
    
    def test_simple_property(self):
        """Parse simple property path."""
        tokens = parse_path("meta.protocol_version")
        assert len(tokens) == 2
        assert isinstance(tokens[0], PropToken)
        assert tokens[0].name == "meta"
        assert isinstance(tokens[1], PropToken)
        assert tokens[1].name == "protocol_version"
    
    def test_array_index(self):
        """Parse array index path."""
        tokens = parse_path("steps[0].description")
        assert len(tokens) == 3
        assert isinstance(tokens[0], PropToken)
        assert tokens[0].name == "steps"
        assert isinstance(tokens[1], IndexToken)
        assert tokens[1].index == 0
        assert isinstance(tokens[2], PropToken)
        assert tokens[2].name == "description"
    
    def test_wildcard(self):
        """Parse wildcard path."""
        tokens = parse_path("steps[*].description")
        assert len(tokens) == 3
        assert isinstance(tokens[0], PropToken)
        assert tokens[0].name == "steps"
        assert isinstance(tokens[1], WildcardToken)
        assert isinstance(tokens[2], PropToken)
        assert tokens[2].name == "description"
    
    def test_nested_wildcard(self):
        """Parse nested wildcard path."""
        tokens = parse_path("root_span.children[*].tags[*]")
        assert len(tokens) == 5
        assert isinstance(tokens[0], PropToken)
        assert tokens[0].name == "root_span"
        assert isinstance(tokens[1], PropToken)
        assert tokens[1].name == "children"
        assert isinstance(tokens[2], WildcardToken)
        assert isinstance(tokens[3], PropToken)
        assert tokens[3].name == "tags"
        assert isinstance(tokens[4], WildcardToken)
    
    def test_invalid_bracket(self):
        """Raise error on missing closing bracket."""
        with pytest.raises(ValueError, match="missing ]"):
            parse_path("steps[0.description")
    
    def test_invalid_index(self):
        """Raise error on non-integer index."""
        with pytest.raises(ValueError, match="Invalid array index"):
            parse_path("steps[abc].description")


class TestGetValueNodesByPath:
    """Test value extraction with wildcard expansion."""
    
    def test_simple_property_access(self):
        """Extract simple property value."""
        obj = {"meta": {"protocol_version": "1.0.0"}}
        nodes = get_value_nodes_by_path(obj, "meta.protocol_version")
        assert len(nodes) == 1
        assert nodes[0].path == "meta.protocol_version"
        assert nodes[0].value == "1.0.0"
    
    def test_array_index_access(self):
        """Extract array element by index."""
        obj = {"steps": [{"description": "Step 1"}, {"description": "Step 2"}]}
        nodes = get_value_nodes_by_path(obj, "steps[0].description")
        assert len(nodes) == 1
        assert nodes[0].path == "steps[0].description"
        assert nodes[0].value == "Step 1"
    
    def test_wildcard_expansion(self):
        """Expand wildcard to all array elements."""
        obj = {"steps": [{"description": "Step 1"}, {"description": "Step 2"}]}
        nodes = get_value_nodes_by_path(obj, "steps[*].description")
        assert len(nodes) == 2
        assert nodes[0].path == "steps[0].description"
        assert nodes[0].value == "Step 1"
        assert nodes[1].path == "steps[1].description"
        assert nodes[1].value == "Step 2"
    
    def test_nested_wildcard_expansion(self):
        """Expand nested wildcards."""
        obj = {
            "root_span": {
                "children": [
                    {"tags": ["tag1", "tag2"]},
                    {"tags": ["tag3"]}
                ]
            }
        }
        nodes = get_value_nodes_by_path(obj, "root_span.children[*].tags[*]")
        assert len(nodes) == 3
        assert nodes[0].path == "root_span.children[0].tags[0]"
        assert nodes[0].value == "tag1"
        assert nodes[1].path == "root_span.children[0].tags[1]"
        assert nodes[1].value == "tag2"
        assert nodes[2].path == "root_span.children[1].tags[0]"
        assert nodes[2].value == "tag3"
    
    def test_nonexistent_path(self):
        """Return empty list for nonexistent path."""
        obj = {"foo": "bar"}
        nodes = get_value_nodes_by_path(obj, "nonexistent.path")
        assert len(nodes) == 0
    
    def test_out_of_bounds_index(self):
        """Return empty list for out-of-bounds array index."""
        obj = {"steps": [{"description": "Step 1"}]}
        nodes = get_value_nodes_by_path(obj, "steps[5].description")
        assert len(nodes) == 0
    
    def test_wildcard_on_empty_array(self):
        """Return empty list for wildcard on empty array."""
        obj = {"steps": []}
        nodes = get_value_nodes_by_path(obj, "steps[*].description")
        assert len(nodes) == 0
