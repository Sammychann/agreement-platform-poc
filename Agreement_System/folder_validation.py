"""
=============================================================================
PHASE 4 BLUEPRINT - FOLDER COMPLETENESS (folder_validation.py)
=============================================================================
This module is designed for FUTURE PHASE 4 implementation.

GOAL:
Scan a parent folder containing customer folders and check whether each
customer folder contains the 4 required document types:
1. Agreement PDF (e.g., *agreement*.pdf)
2. Installation Report PDF (e.g., *installation*.pdf or *install*.pdf)
3. Approval Mail PDF (e.g., *approval*.pdf or *mail*.pdf)
4. Finance Excel File (e.g., *finance*.xlsx or *commercial*.xlsx)

OUTPUT:
Reports 'COMPLETE' or 'INCOMPLETE - [Missing Files]' for each customer.
=============================================================================
"""

import os
from pathlib import Path
from typing import Dict, Any, List


REQUIRED_DOC_PATTERNS = {
    "agreement_pdf": {
        "label": "Agreement PDF",
        "extensions": [".pdf"],
        "keywords": ["agreement", "contract", "agr"]
    },
    "installation_report_pdf": {
        "label": "Installation Report PDF",
        "extensions": [".pdf"],
        "keywords": ["installation", "install", "handover", "commissioning", "report"]
    },
    "approval_mail_pdf": {
        "label": "Approval Mail PDF",
        "extensions": [".pdf", ".eml", ".msg"],
        "keywords": ["approval", "approve", "mail", "email"]
    },
    "finance_excel": {
        "label": "Finance Excel File",
        "extensions": [".xlsx", ".xls", ".csv"],
        "keywords": ["finance", "commercial", "pricing", "cost", "invoice", "billing"]
    }
}


def validate_customer_folder(folder_path: str) -> Dict[str, Any]:
    """
    Inspects a single customer's folder and verifies presence of all 4 document types.

    Args:
        folder_path: Path to the customer's folder

    Returns:
        Dictionary with status ('COMPLETE' / 'INCOMPLETE'), found documents, and missing documents.
    """
    path_obj = Path(folder_path)

    if not path_obj.exists() or not path_obj.is_dir():
        return {
            "folder_name": path_obj.name,
            "status": "ERROR",
            "message": f"Folder '{folder_path}' does not exist or is not a directory."
        }

    # List all files in customer folder
    files = [f for f in path_obj.iterdir() if f.is_file()]
    found_docs = {}
    missing_docs = []

    for doc_type_key, doc_rules in REQUIRED_DOC_PATTERNS.items():
        matched_file = None
        for f in files:
            ext = f.suffix.lower()
            fname_lower = f.name.lower()
            
            # Check extension
            if ext in doc_rules["extensions"]:
                # Check keyword match
                if any(kw in fname_lower for kw in doc_rules["keywords"]):
                    matched_file = f.name
                    break
        
        if matched_file:
            found_docs[doc_type_key] = {
                "label": doc_rules["label"],
                "filename": matched_file,
                "present": True
            }
        else:
            missing_docs.append(doc_rules["label"])
            found_docs[doc_type_key] = {
                "label": doc_rules["label"],
                "filename": None,
                "present": False
            }

    is_complete = len(missing_docs) == 0
    status_label = "COMPLETE" if is_complete else f"INCOMPLETE - Missing: {', '.join(missing_docs)}"

    return {
        "folder_name": path_obj.name,
        "status": status_label,
        "is_complete": is_complete,
        "documents": found_docs,
        "missing": missing_docs,
        "total_files_in_folder": len(files)
    }


def scan_parent_directory(parent_dir_path: str) -> List[Dict[str, Any]]:
    """
    Scans a parent directory containing multiple customer folders.
    Returns completeness report for each folder.
    """
    parent_path = Path(parent_dir_path)
    if not parent_path.exists() or not parent_path.is_dir():
        return []

    results = []
    for item in parent_path.iterdir():
        if item.is_dir() and not item.name.startswith("."):
            results.append(validate_customer_folder(str(item)))

    return results
