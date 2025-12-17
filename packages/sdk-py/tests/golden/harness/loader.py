# MPLP v1.0.0 FROZEN
# Governance: MPGC

# Copyright 2025 邦士（北京）网络科技有限公司.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""
Golden Flow Loader - Load flow definitions and invariants from filesystem.

Loads flow fixtures and invariant YAML files that are shared with the TypeScript
Golden Harness, ensuring cross-language test consistency.
"""

import json
import yaml
from pathlib import Path
from typing import Dict, List, Any, NamedTuple, Optional
from .invariant_rules import Invariant


def load_json_file_safe(json_path: Path) -> Any:
    """
    Safe JSON file loading that strips UTF-8 BOM and provides detailed error messages.
    This ensures compatibility across different editors and OS environments.
    
    Args:
        json_path: Path to JSON file
        
    Returns:
        Parsed JSON object
    """
    with open(json_path, 'r', encoding='utf-8-sig') as f:  # utf-8-sig automatically strips BOM
        try:
            return json.load(f)
        except json.JSONDecodeError as e:
            print(f"❌ Failed to parse JSON file: {json_path}")
            raise



class GoldenFlow(NamedTuple):
    """Golden flow definition with input, expected output, and invariants."""
    flow_id: str
    name: str
    path: Path
    input: Dict[str, Any]  # e.g., {"context": {...}, "plan": {...}}
    expected: Dict[str, Any]  # e.g., {"context": {...}, "plan": {...}}
    invariants: Dict[str, List[Invariant]]  # by scope: "context", "plan", etc.


def load_invariants_from_yaml(yaml_path: Path) -> List[Invariant]:
    """
    Load invariants from a YAML file.
    
    Args:
        yaml_path: Path to invariant YAML file (e.g., tests/golden/invariants/plan.yaml)
        
    Returns:
        List of Invariant objects with scope extracted from filename
    """
    scope = yaml_path.stem  # e.g., "plan" from "plan.yaml"
    
    with open(yaml_path, 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f)
    
    if not data:
        return []
    
    invariants = []
    for item in data:
        inv = Invariant(
            id=item.get('id', ''),
            path=item.get('path', ''),
            rule=item.get('rule', ''),
            description=item.get('description', ''),
            scope=scope
        )
        invariants.append(inv)
    
    return invariants


def load_global_invariants(invariants_root: Path) -> Dict[str, List[Invariant]]:
    """
    Load all global invariants from YAML files.
    
    Args:
        invariants_root: Root directory containing invariant YAML files
                        (e.g., tests/golden/invariants/)
        
    Returns:
        Dictionary mapping scope to list of invariants
        Example: {"context": [...], "plan": [...]}
    """
    invariants_by_scope: Dict[str, List[Invariant]] = {}
    
    if not invariants_root.exists():
        return invariants_by_scope
    
    for yaml_file in invariants_root.glob('*.yaml'):
        scope_invariants = load_invariants_from_yaml(yaml_file)
        scope = yaml_file.stem
        invariants_by_scope[scope] = scope_invariants
    
    for yml_file in invariants_root.glob('*.yml'):
        if yml_file.with_suffix('.yaml').exists():
            continue  # Skip if .yaml version exists
        scope_invariants = load_invariants_from_yaml(yml_file)
        scope = yml_file.stem
        invariants_by_scope[scope] = scope_invariants
    
    return invariants_by_scope


def load_flow_json_files(flow_dir: Path, subdir: str) -> Dict[str, Any]:
    """
    Load JSON files from input/ or expected/ subdirectory.
    
    Args:
        flow_dir: Flow directory (e.g., tests/golden/flows/flow-01-single-agent-plan/)
        subdir: Subdirectory name ("input" or "expected")
        
    Returns:
        Dictionary mapping file basename (without .json) to parsed JSON
        Example: {"context": {...}, "plan": {...}}
    """
    result: Dict[str, Any] = {}
    target_dir = flow_dir / subdir
    
    if not target_dir.exists():
        return result
    
    for json_file in target_dir.glob('*.json'):
        basename = json_file.stem  # e.g., "context" from "context.json"
        result[basename] = load_json_file_safe(json_file)

    
    return result


def load_flow_specific_invariants(flow_dir: Path) -> Dict[str, List[Invariant]]:
    """
    Load flow-specific invariants from expected/invariants.yaml.
    
    Args:
        flow_dir: Flow directory
        
    Returns:
        Dictionary mapping scope to invariants (currently returns empty dict
        as flow-specific invariants are not yet implemented in fixtures)
    """
    invariants_file = flow_dir / "expected" / "invariants.yaml"
    
    if not invariants_file.exists():
        return {}
    
    # TODO: Implement when flow-specific invariants are added to fixtures
    return {}


def load_golden_flow(flow_dir: Path, global_invariants: Dict[str, List[Invariant]]) -> GoldenFlow:
    """
    Load a single golden flow from directory.
    
    Args:
        flow_dir: Flow directory (e.g., tests/golden/flows/flow-01-single-agent-plan/)
        global_invariants: Global invariants loaded from tests/golden/invariants/
        
    Returns:
        GoldenFlow object
    """
    # Parse flow ID and name from directory name
    dir_name = flow_dir.name
    # e.g., "flow-01-single-agent-plan" -> "FLOW-01", "Single Agent Plan"
    parts = dir_name.split('-')
    if len(parts) >= 2 and parts[0] == 'flow':
        flow_id = f"{parts[0].upper()}-{parts[1].upper()}"
        name_parts = parts[2:] if len(parts) > 2 else []
        name = ' '.join(word.capitalize() for word in name_parts)
    else:
        flow_id = dir_name.upper()
        name = dir_name.replace('-', ' ').title()
    
    # Load input and expected fixtures
    input_data = load_flow_json_files(flow_dir, "input")
    expected_data = load_flow_json_files(flow_dir, "expected")
    
    # Merge global and flow-specific invariants
    flow_specific = load_flow_specific_invariants(flow_dir)
    all_invariants = {**global_invariants}  # Copy global
    for scope, invs in flow_specific.items():
        if scope in all_invariants:
            all_invariants[scope].extend(invs)
        else:
            all_invariants[scope] = invs
    
    return GoldenFlow(
        flow_id=flow_id,
        name=name,
        path=flow_dir,
        input=input_data,
        expected=expected_data,
        invariants=all_invariants
    )


def load_all_golden_flows(flows_root: Optional[Path] = None, 
                          invariants_root: Optional[Path] = None) -> List[GoldenFlow]:
    """
    Load all golden flows from filesystem.
    
    Args:
        flows_root: Root directory for flows (default: tests/golden/flows/)
        invariants_root: Root directory for invariants (default: tests/golden/invariants/)
        
    Returns:
        List of GoldenFlow objects
    """
    if flows_root is None:
        # Default to repository root relative path
        repo_root = Path(__file__).parent.parent.parent.parent.parent.parent
        flows_root = repo_root / "tests" / "golden" / "flows"
    
    if invariants_root is None:
        repo_root = Path(__file__).parent.parent.parent.parent.parent.parent
        invariants_root = repo_root / "tests" / "golden" / "invariants"
    
    if not flows_root.exists():
        return []
    
    # Load global invariants
    global_invariants = load_global_invariants(invariants_root)
    
    # Load all flows
    flows = []
    # MPLP v1.0 Protocol Invariant Flows
    # These flows define the minimum behavioral semantics required for v1.0 compliance.
    # Any implementation claiming MPLP v1.0 compatibility MUST pass these flows.
    V1_PROTOCOL_FLOWS = {
        'flow-01-single-agent-plan',
        'flow-02-single-agent-large-plan',
        'flow-03-single-agent-with-tools',
        'flow-04-single-agent-llm-enrichment',
        'flow-05-single-agent-confirm-required',
    }
    
    # Profile-Level Flows (optional, not part of v1.0 compliance boundary)
    SA_PROFILE_FLOWS = {
        'sa-flow-01-basic',
        'sa-flow-02-step-evaluation',
    }
    
    # MAP Profile Flows (Profile-level, non-mandatory)
    MAP_PROFILE_FLOWS = {
        'map-flow-01-turn-taking',
        'map-flow-02-broadcast-fanout',
    }
    
    allowed_flows = V1_PROTOCOL_FLOWS | SA_PROFILE_FLOWS | MAP_PROFILE_FLOWS
    
    for flow_dir in sorted(flows_root.iterdir()):
        if flow_dir.is_dir() and flow_dir.name in allowed_flows:
            flow = load_golden_flow(flow_dir, global_invariants)
            flows.append(flow)
    
    return flows

