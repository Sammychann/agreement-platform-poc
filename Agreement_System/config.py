"""
=============================================================================
AGREEMENT MANAGEMENT SYSTEM - CONFIGURATION (config.py)
=============================================================================
This file is the central place to configure:
1. Agreement Types and their associated Word templates (.docx).
2. The dynamic input fields required for each agreement type.
3. System folder paths (templates, output, test data).

HOW TO USE ON YOUR COMPANY LAPTOP:
- When you receive the actual company Word templates, place them in the 'templates/' folder.
- If the file names differ, simply update the 'template_file' setting below.
- You do NOT need to rewrite any Python logic!
=============================================================================
"""

import os
from pathlib import Path

# Base directory for the Agreement System project
BASE_DIR = Path(__file__).resolve().parent

# Directory paths
TEMPLATES_DIR = BASE_DIR / "templates"
OUTPUT_DIR = BASE_DIR / "output"
TEST_DATA_DIR = BASE_DIR / "test_data"
STATIC_DIR = BASE_DIR / "web" / "static"
TEMPLATES_WEB_DIR = BASE_DIR / "web" / "templates"

# Ensure directories exist
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(TEMPLATES_DIR, exist_ok=True)
os.makedirs(TEST_DATA_DIR, exist_ok=True)

# -----------------------------------------------------------------------------
# AGREEMENT TYPES AND DYNAMIC FIELD DEFINITIONS
# -----------------------------------------------------------------------------
# Each agreement type has:
# - id: Unique key used by the application
# - name: Display title shown in the web interface
# - template_file: The .docx filename in the templates/ directory
# - description: Brief overview of this agreement model
# - fields: The list of dynamic fields that must be populated into the template
# -----------------------------------------------------------------------------

AGREEMENT_TYPES = {
    "type_1": {
        "id": "type_1",
        "name": "Direct Agreement - Customer Ownership",
        "template_file": "Template_1.docx",
        "alternate_name": "Direct Agreement Template-Customer ownership.docx",
        "description": "Standard direct sales contract where customer purchases and owns the equipment.",
        "category": "Direct Sale",
        "fields": [
            {
                "key": "customer_name",
                "label": "Customer / Hospital Name",
                "type": "text",
                "required": True,
                "placeholder": "e.g. Apollo Healthcare Ltd",
                "help_text": "Legal entity name of the purchasing customer"
            },
            {
                "key": "customer_id",
                "label": "Customer ID",
                "type": "text",
                "required": True,
                "placeholder": "e.g. CUST-2026-001",
                "help_text": "Internal customer code or ERP reference"
            },
            {
                "key": "customer_address",
                "label": "Customer Address",
                "type": "textarea",
                "required": True,
                "placeholder": "e.g. 100 Main Hospital Road, Sector 5, Metro City",
                "help_text": "Registered legal billing address of customer"
            },
            {
                "key": "contact_person",
                "label": "Contact Person Name",
                "type": "text",
                "required": True,
                "placeholder": "e.g. Dr. Rajesh Sharma",
                "help_text": "Authorized representative or procurement head"
            },
            {
                "key": "contact_email",
                "label": "Contact Email",
                "type": "email",
                "required": True,
                "placeholder": "e.g. rajesh.sharma@apollohealthcare.com",
                "help_text": "Official email address for notices"
            },
            {
                "key": "agreement_date",
                "label": "Agreement Execution Date",
                "type": "date",
                "required": True,
                "placeholder": "YYYY-MM-DD",
                "help_text": "Date on which this agreement is executed"
            },
            {
                "key": "start_date",
                "label": "Effective Start Date",
                "type": "date",
                "required": True,
                "placeholder": "YYYY-MM-DD",
                "help_text": "Commencement date of the agreement term"
            },
            {
                "key": "end_date",
                "label": "Agreement End Date",
                "type": "date",
                "required": True,
                "placeholder": "YYYY-MM-DD",
                "help_text": "Expiration date of warranty/maintenance term"
            },
            {
                "key": "equipment_name",
                "label": "Equipment / Device Name",
                "type": "text",
                "required": True,
                "placeholder": "e.g. Advanced Diagnostic Imaging Scanner X500",
                "help_text": "Commercial trade name of the medical device"
            },
            {
                "key": "equipment_details",
                "label": "Equipment Specification / Details",
                "type": "text",
                "required": False,
                "placeholder": "e.g. Includes dual-probe console & workstation",
                "help_text": "Optional configuration details"
            },
            {
                "key": "quantity",
                "label": "Quantity (Units)",
                "type": "number",
                "required": True,
                "default": "1",
                "placeholder": "e.g. 1",
                "help_text": "Number of units delivered under this contract"
            },
            {
                "key": "serial_number",
                "label": "Device Serial Number(s)",
                "type": "text",
                "required": True,
                "placeholder": "e.g. SN-DX500-2026-0091",
                "help_text": "Unique manufacturer serial number"
            },
            {
                "key": "agreement_value",
                "label": "Total Agreement Value (INR)",
                "type": "text",
                "required": True,
                "placeholder": "e.g. ₹ 4,500,000",
                "help_text": "Total contract value including taxes"
            },
            {
                "key": "device_ownership",
                "label": "Device Ownership Model",
                "type": "select",
                "required": True,
                "options": ["Customer Ownership", "Company Ownership"],
                "default": "Customer Ownership",
                "help_text": "Title ownership classification"
            }
        ]
    },

    "type_2": {
        "id": "type_2",
        "name": "Direct Agreement - Innoject Pro",
        "template_file": "Template_2.docx",
        "alternate_name": "Direct Agreement Template-Innoject Pro.docx",
        "description": "Direct placement model for Innoject Pro systems where company retains title ownership.",
        "category": "Direct Placement",
        "fields": [
            {
                "key": "customer_name",
                "label": "Customer / Clinic Name",
                "type": "text",
                "required": True,
                "placeholder": "e.g. Fortis Specialty Clinics",
                "help_text": "Legal entity name of the clinic/institution"
            },
            {
                "key": "customer_id",
                "label": "Customer ID",
                "type": "text",
                "required": True,
                "placeholder": "e.g. CUST-2026-002",
                "help_text": "Internal customer account code"
            },
            {
                "key": "customer_address",
                "label": "Installation Address",
                "type": "textarea",
                "required": True,
                "placeholder": "e.g. Plot 45, Cyber City, Phase 2, Gurugram, Haryana",
                "help_text": "Physical site where Innoject Pro is placed"
            },
            {
                "key": "contact_person",
                "label": "Contact Person Name",
                "type": "text",
                "required": True,
                "placeholder": "e.g. Dr. Ananya Verma",
                "help_text": "Lead clinician or administrator"
            },
            {
                "key": "contact_email",
                "label": "Contact Email",
                "type": "email",
                "required": True,
                "placeholder": "e.g. ananya.verma@fortisclinic.org",
                "help_text": "Authorized email address for communications"
            },
            {
                "key": "agreement_date",
                "label": "Agreement Date",
                "type": "date",
                "required": True,
                "placeholder": "YYYY-MM-DD",
                "help_text": "Execution date of placement contract"
            },
            {
                "key": "start_date",
                "label": "Placement Start Date",
                "type": "date",
                "required": True,
                "placeholder": "YYYY-MM-DD",
                "help_text": "Date device placement begins"
            },
            {
                "key": "end_date",
                "label": "Placement End Date",
                "type": "date",
                "required": True,
                "placeholder": "YYYY-MM-DD",
                "help_text": "Expiry of placement term"
            },
            {
                "key": "equipment_name",
                "label": "Equipment Name",
                "type": "text",
                "required": True,
                "default": "Innoject Pro Automated Delivery System",
                "placeholder": "Innoject Pro Automated Delivery System",
                "help_text": "Model name of the Innoject Pro unit"
            },
            {
                "key": "equipment_details",
                "label": "Equipment Configuration",
                "type": "text",
                "required": False,
                "placeholder": "e.g. Complete with dual micro-injection handpieces",
                "help_text": "Accessory bundle and specifications"
            },
            {
                "key": "quantity",
                "label": "Quantity (Units)",
                "type": "number",
                "required": True,
                "default": "1",
                "placeholder": "e.g. 1",
                "help_text": "Placed unit quantity"
            },
            {
                "key": "serial_number",
                "label": "Innoject Pro Serial Number",
                "type": "text",
                "required": True,
                "placeholder": "e.g. INN-PRO-2026-7731",
                "help_text": "Serial tag number on device chassis"
            },
            {
                "key": "agreement_value",
                "label": "Monthly Placement Fee / Value",
                "type": "text",
                "required": True,
                "placeholder": "e.g. ₹ 85,000 / month",
                "help_text": "Agreed monthly placement / consumable commitment"
            },
            {
                "key": "device_ownership",
                "label": "Device Ownership Model",
                "type": "select",
                "required": True,
                "options": ["Company Ownership", "Customer Ownership"],
                "default": "Company Ownership",
                "help_text": "Title retained by the company"
            }
        ]
    },

    "type_3": {
        "id": "type_3",
        "name": "Indirect Agreement - Customer Ownership",
        "template_file": "Template_3.docx",
        "alternate_name": "Indirect Agreement Template-Customer Ownership.docx",
        "description": "Tripartite / indirect sales agreement executed via an authorized distributor partner.",
        "category": "Indirect Sale",
        "fields": [
            {
                "key": "customer_name",
                "label": "End Customer / Institution Name",
                "type": "text",
                "required": True,
                "placeholder": "e.g. Max Care Institute of Medical Sciences",
                "help_text": "End-user healthcare institution"
            },
            {
                "key": "distributor_name",
                "label": "Authorized Distributor Partner Name",
                "type": "text",
                "required": True,
                "placeholder": "e.g. MedTech Logistics & Distribution Pvt Ltd",
                "help_text": "Authorized channel distributor executing transaction"
            },
            {
                "key": "customer_id",
                "label": "Customer / Account ID",
                "type": "text",
                "required": True,
                "placeholder": "e.g. CUST-IND-2026-042",
                "help_text": "Distributor/End-user cross reference ID"
            },
            {
                "key": "customer_address",
                "label": "End Customer Address",
                "type": "textarea",
                "required": True,
                "placeholder": "e.g. 55 Healthcare Boulevard, Ring Road, Bengaluru",
                "help_text": "Delivery and operational address"
            },
            {
                "key": "contact_person",
                "label": "Customer Contact Person",
                "type": "text",
                "required": True,
                "placeholder": "e.g. Dr. Vikram Singhania",
                "help_text": "Customer primary contact"
            },
            {
                "key": "contact_email",
                "label": "Contact Email",
                "type": "email",
                "required": True,
                "placeholder": "e.g. procurement@maxcare.org",
                "help_text": "Official correspondence email"
            },
            {
                "key": "agreement_date",
                "label": "Agreement Date",
                "type": "date",
                "required": True,
                "placeholder": "YYYY-MM-DD",
                "help_text": "Date of agreement signing"
            },
            {
                "key": "start_date",
                "label": "Warranty / Term Start Date",
                "type": "date",
                "required": True,
                "placeholder": "YYYY-MM-DD",
                "help_text": "Commencement date of indirect warranty/support"
            },
            {
                "key": "end_date",
                "label": "Warranty / Term End Date",
                "type": "date",
                "required": True,
                "placeholder": "YYYY-MM-DD",
                "help_text": "Termination date of term"
            },
            {
                "key": "equipment_name",
                "label": "Equipment / Device Name",
                "type": "text",
                "required": True,
                "placeholder": "e.g. Precision Surgical Laser Console 400",
                "help_text": "Name of device sold via distributor"
            },
            {
                "key": "equipment_details",
                "label": "Equipment Details",
                "type": "text",
                "required": False,
                "placeholder": "e.g. Standard accessories & calibration kit included",
                "help_text": "Device model description"
            },
            {
                "key": "quantity",
                "label": "Quantity (Units)",
                "type": "number",
                "required": True,
                "default": "1",
                "placeholder": "e.g. 1",
                "help_text": "Number of devices"
            },
            {
                "key": "serial_number",
                "label": "Device Serial Number(s)",
                "type": "text",
                "required": True,
                "placeholder": "e.g. SN-LASER-2026-5502",
                "help_text": "Hardware serial identifier"
            },
            {
                "key": "agreement_value",
                "label": "Distributor Invoiced Value",
                "type": "text",
                "required": True,
                "placeholder": "e.g. ₹ 3,200,000",
                "help_text": "Purchase price from channel partner"
            },
            {
                "key": "device_ownership",
                "label": "Device Ownership",
                "type": "select",
                "required": True,
                "options": ["Customer Ownership", "Company Ownership"],
                "default": "Customer Ownership",
                "help_text": "Ownership transferred upon final payment"
            }
        ]
    },

    "type_4": {
        "id": "type_4",
        "name": "Indirect Agreement - Innoject Pro",
        "template_file": "Template_4.docx",
        "alternate_name": "Indirect Agreement Template-Innoject Pro.docx",
        "description": "Indirect placement of Innoject Pro managed through an authorized channel partner.",
        "category": "Indirect Placement",
        "fields": [
            {
                "key": "customer_name",
                "label": "End Customer / Clinic Name",
                "type": "text",
                "required": True,
                "placeholder": "e.g. Pristyn Aesthetics & Wellness Centre",
                "help_text": "End clinic receiving the Innoject Pro system"
            },
            {
                "key": "distributor_name",
                "label": "Channel Partner / Distributor",
                "type": "text",
                "required": True,
                "placeholder": "e.g. Prime Care Distribution Network",
                "help_text": "Authorized managing partner"
            },
            {
                "key": "customer_id",
                "label": "Customer ID",
                "type": "text",
                "required": True,
                "placeholder": "e.g. CUST-INDIRECT-INN-088",
                "help_text": "Account reference number"
            },
            {
                "key": "customer_address",
                "label": "Placement Location Address",
                "type": "textarea",
                "required": True,
                "placeholder": "e.g. 12th Floor, Tower B, Trade Center, Mumbai 400051",
                "help_text": "Physical deployment premises"
            },
            {
                "key": "contact_person",
                "label": "Contact Person Name",
                "type": "text",
                "required": True,
                "placeholder": "e.g. Dr. Rohan Mehta",
                "help_text": "Designated clinic supervisor"
            },
            {
                "key": "contact_email",
                "label": "Contact Email",
                "type": "email",
                "required": True,
                "placeholder": "e.g. rohan.mehta@pristynmed.com",
                "help_text": "Notification email"
            },
            {
                "key": "agreement_date",
                "label": "Agreement Date",
                "type": "date",
                "required": True,
                "placeholder": "YYYY-MM-DD",
                "help_text": "Date of tripartite agreement"
            },
            {
                "key": "start_date",
                "label": "Placement Start Date",
                "type": "date",
                "required": True,
                "placeholder": "YYYY-MM-DD",
                "help_text": "Commencement date of placement"
            },
            {
                "key": "end_date",
                "label": "Placement End Date",
                "type": "date",
                "required": True,
                "placeholder": "YYYY-MM-DD",
                "help_text": "Scheduled completion of placement period"
            },
            {
                "key": "equipment_name",
                "label": "Equipment Name",
                "type": "text",
                "required": True,
                "default": "Innoject Pro Medical Dispensing Station",
                "placeholder": "Innoject Pro Medical Dispensing Station",
                "help_text": "Device model"
            },
            {
                "key": "equipment_details",
                "label": "Equipment Details",
                "type": "text",
                "required": False,
                "placeholder": "e.g. Includes standard service pack and applicator accessories",
                "help_text": "Configuration notes"
            },
            {
                "key": "quantity",
                "label": "Quantity (Units)",
                "type": "number",
                "required": True,
                "default": "1",
                "placeholder": "e.g. 1",
                "help_text": "Total units placed"
            },
            {
                "key": "serial_number",
                "label": "Device Serial Number",
                "type": "text",
                "required": True,
                "placeholder": "e.g. INN-PRO-IND-2026-904",
                "help_text": "Chassis serial code"
            },
            {
                "key": "agreement_value",
                "label": "Placement Commitment Value",
                "type": "text",
                "required": True,
                "placeholder": "e.g. ₹ 95,000 / month",
                "help_text": "Channel partner placement fee/commitment"
            },
            {
                "key": "device_ownership",
                "label": "Device Ownership",
                "type": "select",
                "required": True,
                "options": ["Company Ownership", "Customer Ownership"],
                "default": "Company Ownership",
                "help_text": "Title ownership classification"
            }
        ]
    }
}

# Helper function to fetch config for an agreement type
def get_agreement_config(agreement_type_id: str) -> dict:
    """
    Returns the configuration dictionary for a given agreement type ID.
    Raises ValueError if ID is not found.
    """
    if agreement_type_id not in AGREEMENT_TYPES:
        raise ValueError(f"Unknown agreement type '{agreement_type_id}'. Available: {list(AGREEMENT_TYPES.keys())}")
    return AGREEMENT_TYPES[agreement_type_id]
