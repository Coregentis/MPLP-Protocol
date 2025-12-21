# MPLP v1.0.0 FROZEN
# Governance: MPGC

import os

FROZEN_MD_BLOCK = """
> [!FROZEN]
> **MPLP Protocol v1.0.0 (FROZEN)**
> This document is part of the frozen specification. Any changes require a new protocol version.
> Governance: MPLP Protocol Governance Committee (MPGC)
"""

COPYRIGHT_FOOTER = """
---
© 2025 Coregentis. All Rights Reserved.
MPLP Protocol - Multi-Agent Protocol for Learning & Planning
"""

YAML_HEADER = """# MPLP v1.0.0 FROZEN - Invariant Set
# Governance: MPGC
"""

JSON_COMMENT = "MPLP v1.0.0 FROZEN - Governed by MPGC"

JSON_META_BASE = {
    "protocolVersion": "1.0.0",
    "frozen": True,
    "governance": "MPGC"
}

SOURCE_HEADER = """# MPLP v1.0.0 FROZEN
# Governance: MPGC
"""

def update_headers(root_dir):
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            path = os.path.join(root, file)
            if file.endswith('.py'):
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                if not content.startswith(SOURCE_HEADER):
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(SOURCE_HEADER + '\n' + content)
                    print(f"Updated {path}")

if __name__ == "__main__":
    update_headers(os.getcwd())
