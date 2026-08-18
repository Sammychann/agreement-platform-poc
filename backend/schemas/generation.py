from datetime import date
from typing import Literal
from pydantic import BaseModel, EmailStr

class AgreementFormData(BaseModel):
    company_name: str
    customer_address: str
    contact_person_name: str
    contact_person_designation: str
    contact_person_email: EmailStr
    contact_person_phone: str
    agreement_start_date: date
    agreement_end_date: date
    device_name: str
    device_serial_number: str
    territory: str
    agreement_value: float
    device_ownership: Literal['customer', 'msd']
    agreement_type: str

class SubmitResponse(BaseModel):
    entry_id: str
    message: str

class GenerateResponse(BaseModel):
    agreement_id: str
    message: str
    preview_url: str
