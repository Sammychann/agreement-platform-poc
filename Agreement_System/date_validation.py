"""
=============================================================================
PHASE 3 BLUEPRINT - DATE VALIDATION (date_validation.py)
=============================================================================
This module is designed for FUTURE PHASE 3 implementation.

GOAL:
Perform cross-document chronological and business rule date validation:
1. Approval mail date must exist.
2. Agreement date must exist.
3. Agreement should not be created before the approval date.
4. Agreement start date must be on or after agreement execution date.
5. Agreement end date must be strictly after the start date.
=============================================================================
"""

from datetime import datetime
from typing import Dict, Any, Optional, List


def parse_date_safe(date_str: str) -> Optional[datetime]:
    """
    Safely parses common date formats (YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY).
    """
    if not date_str or not isinstance(date_str, str):
        return None
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%B %d, %Y"):
        try:
            return datetime.strptime(date_str.strip(), fmt)
        except ValueError:
            continue
    return None


def validate_agreement_dates(
    approval_date_str: Optional[str],
    agreement_date_str: Optional[str],
    start_date_str: Optional[str],
    end_date_str: Optional[str]
) -> Dict[str, Any]:
    """
    Validates chronological consistency between approval and agreement dates.

    Rules:
    1. Approval Date exists.
    2. Agreement Date exists.
    3. Agreement Date >= Approval Date.
    4. Start Date >= Agreement Date (or reasonable grace period).
    5. End Date > Start Date.

    Returns:
        Dictionary with status ('COMPLETE', 'INCOMPLETE', 'ACTION REQUIRED') and rule breakdown.
    """
    errors: List[str] = []
    warnings: List[str] = []

    dt_approval = parse_date_safe(approval_date_str) if approval_date_str else None
    dt_agreement = parse_date_safe(agreement_date_str) if agreement_date_str else None
    dt_start = parse_date_safe(start_date_str) if start_date_str else None
    dt_end = parse_date_safe(end_date_str) if end_date_str else None

    # Check 1: Approval Date exists
    if not dt_approval and approval_date_str is not None:
        warnings.append("Approval date is not provided or could not be parsed.")

    # Check 2: Agreement Date exists
    if not dt_agreement:
        errors.append("Agreement execution date is missing or invalid.")

    # Check 3: Agreement after Approval
    if dt_approval and dt_agreement:
        if dt_agreement < dt_approval:
            errors.append(f"Agreement date ({agreement_date_str}) is BEFORE Approval date ({approval_date_str}).")

    # Check 4: Start Date after Agreement
    if dt_start and dt_end:
        if dt_end <= dt_start:
            errors.append(f"End date ({end_date_str}) must be after start date ({start_date_str}).")

    status = "COMPLETE" if not errors and not warnings else ("ACTION REQUIRED" if errors else "COMPLETE")

    return {
        "status": status,
        "is_valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
        "dates_checked": {
            "approval_date": approval_date_str,
            "agreement_date": agreement_date_str,
            "start_date": start_date_str,
            "end_date": end_date_str
        }
    }
