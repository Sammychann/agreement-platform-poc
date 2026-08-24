from typing import List, Optional, Union, Any
from pydantic import BaseModel, Field

class EquipmentItem(BaseModel):
    equipment_name: str
    quantity: Union[int, str]

class AgreementFormData(BaseModel):
    agreement_type: str
    customer_name: str
    location: str
    distributor_name: Optional[str] = ""
    equipment: List[EquipmentItem] = Field(default_factory=list)
    initiator_name_and_date: str = ""
    manager_name_and_date: str = ""
    date: str = ""
    address: str = ""
    receiver_name: str = ""
    receiver_title: str = ""
    receiver_date: str = ""
    intervet_name: str = ""
    intervet_title: str = ""
    intervet_date: str = ""

class SubmitResponse(BaseModel):
    entry_id: str
    agreement_id: str
    message: str
    preview_url: str

class GenerateResponse(BaseModel):
    agreement_id: str
    message: str
    preview_url: str
