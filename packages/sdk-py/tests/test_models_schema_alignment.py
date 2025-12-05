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

import pytest
import json
import os
from pydantic import BaseModel
from mplp_sdk.models import Context, Plan, Confirm, Trace
from mplp_sdk.models.common import Metadata

SCHEMAS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../schemas/v2"))

def load_schema(filename):
    path = os.path.join(SCHEMAS_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def check_alignment(model_cls: BaseModel, schema_filename: str):
    schema = load_schema(schema_filename)
    schema_props = set(schema.get("properties", {}).keys())
    model_props = set(model_cls.model_fields.keys())

    # Check if all schema properties exist in model
    # Note: Model might have extra fields if we added helpers, but we shouldn't have.
    # But strict mapping means exact match?
    # Pydantic might add some internal fields? No, model_fields keys are user fields.
    
    missing_in_model = schema_props - model_props
    assert not missing_in_model, f"Model {model_cls.__name__} missing fields: {missing_in_model}"

    # Check required fields
    schema_required = set(schema.get("required", []))
    model_required = {
        name for name, field in model_cls.model_fields.items()
        if field.is_required()
    }
    
    # Note: Pydantic required means no default value.
    # Optional fields in schema are not required.
    # But if I set default=None, it's not required.
    
    missing_required = schema_required - model_required
    assert not missing_required, f"Model {model_cls.__name__} missing required status for: {missing_required}"

def test_context_alignment():
    check_alignment(Context, "mplp-context.schema.json")

def test_plan_alignment():
    check_alignment(Plan, "mplp-plan.schema.json")

def test_confirm_alignment():
    check_alignment(Confirm, "mplp-confirm.schema.json")

def test_trace_alignment():
    check_alignment(Trace, "mplp-trace.schema.json")

def test_metadata_alignment():
    check_alignment(Metadata, "common/metadata.schema.json")
