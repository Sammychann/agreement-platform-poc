"""Schemas for document validation results."""

from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class FileValidation(BaseModel):
    filename: str
    found: bool
    missing_fields: List[str]
    extra_info: Dict[str, Any]

class CompanyValidation(BaseModel):
    company_name: str
    month: Optional[str] = None
    files: List[FileValidation]
    duplicates: List[str]

class ValidationReport(BaseModel):
    report_id: str
    zip_type: str
    total_companies: int
    passed: int
    failed: int
    warnings: int
    companies: List[CompanyValidation]
    generated_at: datetime
