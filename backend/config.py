import os
from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
TEMPLATES_DIR = BASE_DIR / "templates"
GENERATED_DIR = DATA_DIR / "generated"
SIGNATURES_DIR = DATA_DIR / "signatures"
TEMP_DIR = BASE_DIR / "temp"

# Excel log path
EXCEL_LOG_PATH = DATA_DIR / "agreements_log.xlsx"

# Create directories if they don't exist
for d in [DATA_DIR, TEMPLATES_DIR, GENERATED_DIR, SIGNATURES_DIR, TEMP_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# Required files for validation
REQUIRED_VALIDATION_FILES = ['agreement', 'invoice', 'purchase_order', 'email']

# Field rules mapping for each file type
FIELD_RULES = {
    'agreement': ['company_name', 'agreement_value', 'start_date', 'end_date'],
    'invoice': ['invoice_number', 'amount', 'company_name', 'date'],
    'purchase_order': ['po_number', 'company_name', 'total_value'],
    'email': ['sender', 'recipient', 'subject']
}

# Agreement types mapping based on device ownership
AGREEMENT_TYPES = {
    'customer': ['Device Purchase Agreement', 'Annual Maintenance Contract'],
    'msd': ['Device Loan Agreement', 'Device Placement Agreement']
}
