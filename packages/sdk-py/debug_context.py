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

import sys
sys.path.insert(0, 'src')

from mplp_sdk.models.context import ContextRoot, Context
from mplp_sdk.models.common.meta import Metadata
from datetime import datetime, timezone
from uuid import uuid4

# Test 1: Create ContextRoot directly
print("Test 1: Creating ContextRoot...")
try:
    root = ContextRoot(domain="test", environment="ci")
    print(f"✓ ContextRoot created: {root}")
    print(f"  domain={root.domain}, environment={root.environment}")
except Exception as e:
    print(f"✗ Failed: {e}")
    if hasattr(e, 'errors'):
        import json
        print(json.dumps(e.errors(), indent=2))
    sys.exit(1)

# Test 2: Create Context with ContextRoot object
print("\nTest 2: Creating Context with ContextRoot object...")
try:
    meta = Metadata(
        protocol_version="1.0.0",
        schema_version="1.0.0",
        created_at=datetime.now(timezone.utc)
    )
    ctx = Context(
        meta=meta,
        context_id=str(uuid4()),
        title="Test",
        root=root,
        status="active"
    )
    print(f"✓ Context created with ContextRoot object")
except Exception as e:
    print(f"✗ Failed: {e}")
    if hasattr(e, 'errors'):
        import json
        print(json.dumps(e.errors(), indent=2))
    sys.exit(1)

# Test 3: Create Context with dict
print("\nTest 3: Creating Context with dict for root...")
try:
    ctx2 = Context(
        meta=meta,
        context_id=str(uuid4()),
        title="Test",
        root={"domain": "test", "environment": "ci"},
        status="active"
    )
    print(f"✓ Context created with dict")
    print(f"  root type: {type(ctx2.root)}")
    print(f"  root.domain={ctx2.root.domain}")
except Exception as e:
    print(f"✗ Failed: {e}")
    if hasattr(e, 'errors'):
        import json
        print(json.dumps(e.errors(), indent=2))
    sys.exit(1)

print("\n✓ All tests passed!")
