"""
Canonical Kernel Duty baseline exposed by the source-side mplp-sdk mirror.
"""

KERNEL_DUTIES = [
    {"id": "KD-01", "name": "Coordination", "slug": "coordination"},
    {"id": "KD-02", "name": "Error Handling", "slug": "error-handling"},
    {"id": "KD-03", "name": "Event Bus", "slug": "event-bus"},
    {"id": "KD-04", "name": "Learning Feedback", "slug": "learning-feedback"},
    {"id": "KD-05", "name": "Observability", "slug": "observability"},
    {"id": "KD-06", "name": "Orchestration", "slug": "orchestration"},
    {"id": "KD-07", "name": "Performance", "slug": "performance"},
    {"id": "KD-08", "name": "Protocol Versioning", "slug": "protocol-versioning"},
    {"id": "KD-09", "name": "Security", "slug": "security"},
    {"id": "KD-10", "name": "State Sync", "slug": "state-sync"},
    {"id": "KD-11", "name": "Transaction", "slug": "transaction"},
]

KERNEL_DUTY_IDS = [duty["id"] for duty in KERNEL_DUTIES]
KERNEL_DUTY_NAMES = [duty["name"] for duty in KERNEL_DUTIES]
KERNEL_DUTY_COUNT = len(KERNEL_DUTIES)
