# MPLP v1.0.0 FROZEN
# Governance: MPGC

"""
mplp-sdk — public protocol helper package surface

This public package surface ships a minimal protocol helper surface for:
- __version__
- MPLP_PROTOCOL_VERSION
- KERNEL_DUTIES / KERNEL_DUTY_IDS / KERNEL_DUTY_NAMES / KERNEL_DUTY_COUNT

It does not currently ship generated models or runtime orchestration.
"""

from .kernel_duties import KERNEL_DUTIES, KERNEL_DUTY_IDS, KERNEL_DUTY_NAMES, KERNEL_DUTY_COUNT

__version__ = "1.0.6"
MPLP_PROTOCOL_VERSION = "1.0.0"
__all__ = [
    "__version__",
    "MPLP_PROTOCOL_VERSION",
    "KERNEL_DUTIES",
    "KERNEL_DUTY_IDS",
    "KERNEL_DUTY_NAMES",
    "KERNEL_DUTY_COUNT",
]

# Public protocol helper package for mplp-sdk v1.0.6.
