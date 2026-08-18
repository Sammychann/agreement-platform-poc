from typing import Any, Optional, Union
from pydantic import BaseModel

class AgreementFormData(BaseModel):
    company_name: str = ""
    customer_address: str = ""
    contact_person_name: str = ""
    contact_person_designation: str = ""
    contact_person_email: str = ""
    contact_person_phone: str = ""
    agreement_start_date: Union[str, Any] = ""
    agreement_end_date: Union[str, Any] = ""
    device_name: str = ""
    device_serial_number: str = ""
    territory: str = ""
    agreement_value: Union[float, int, str] = 0.0
    device_ownership: str = "customer"
    agreement_type: str = "pending"

class SubmitResponse(BaseModel):
    entry_id: str
    message: str

class GenerateResponse(BaseModel):
    agreement_id: str
    message: str
    preview_url: str
