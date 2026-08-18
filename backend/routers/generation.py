import json
import shutil
import uuid
import logging
from pathlib import Path
from typing import Optional, Dict, Any
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse

from config import SIGNATURES_DIR, GENERATED_DIR
from schemas.generation import AgreementFormData, SubmitResponse, GenerateResponse
from services.excel_logger import excel_logger
from services.agreement_generator import agreement_generator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/generate", tags=["Generation"])

@router.post("/submit", response_model=SubmitResponse)
async def submit_form(
    form_data: str = Form(...),
    customer_signature: Optional[UploadFile] = File(None),
    msd_signature: Optional[UploadFile] = File(None)
):
    try:
        data_dict = json.loads(form_data)
        parsed_data = AgreementFormData(**data_dict)
    except Exception as e:
        logger.error(f"Form data validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid form data: {str(e)}")

    entry_id = str(uuid.uuid4())
    sig_dir = SIGNATURES_DIR / entry_id
    sig_dir.mkdir(parents=True, exist_ok=True)
    
    signatures_info = {}
    
    try:
        if customer_signature:
            cust_filename = customer_signature.filename or "customer_signature.png"
            cust_path = sig_dir / f"customer_{cust_filename}"
            with cust_path.open("wb") as buffer:
                shutil.copyfileobj(customer_signature.file, buffer)
            signatures_info["customer_signature"] = str(cust_path)
            
        if msd_signature:
            msd_filename = msd_signature.filename or "msd_signature.png"
            msd_path = sig_dir / f"msd_{msd_filename}"
            with msd_path.open("wb") as buffer:
                shutil.copyfileobj(msd_signature.file, buffer)
            signatures_info["msd_signature"] = str(msd_path)

        actual_entry_id = excel_logger.log_entry(parsed_data, signatures_info, entry_id=entry_id)
        return SubmitResponse(entry_id=actual_entry_id, message="Form submitted successfully")
        
    except Exception as e:
        logger.exception("Error during form submission")
        raise HTTPException(status_code=500, detail=f"Failed to submit form: {str(e)}")

@router.post("/create/{entry_id}", response_model=GenerateResponse)
async def create_agreement(entry_id: str, body: Dict[str, str]):
    agreement_type = body.get("agreement_type")
    if not agreement_type:
        raise HTTPException(status_code=400, detail="agreement_type is required")
        
    entry = excel_logger.get_entry(entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
        
    # Save selected agreement type to Excel log
    excel_logger.update_entry(entry_id, {"agreement_type": agreement_type})
    entry["agreement_type"] = agreement_type
    
    cust_sig = entry.get("customer_signature_path", "")
    msd_sig = entry.get("msd_signature_path", "")
    
    try:
        agreement_id = agreement_generator.generate_agreement(
            entry_id=entry_id,
            form_data=entry,
            agreement_type=agreement_type,
            customer_signature_path=cust_sig,
            msd_signature_path=msd_sig
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.exception("Failed to generate agreement")
        raise HTTPException(status_code=500, detail=f"Failed to generate: {str(e)}")
        
    return GenerateResponse(
        agreement_id=agreement_id,
        message="Agreement generated successfully",
        preview_url=f"/api/generate/preview/{agreement_id}"
    )

@router.get("/details/{agreement_id}")
async def get_agreement_details(agreement_id: str):
    path = agreement_generator.get_agreement_path(agreement_id)
    if not path:
        raise HTTPException(status_code=404, detail="Agreement not found")
        
    filename = path.name
    parts = filename.split('_')
    if len(parts) < 3:
        raise HTTPException(status_code=500, detail="Invalid agreement file format")
    entry_id = parts[0]
    agreement_type = parts[1]
    
    entry = excel_logger.get_entry(entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Original entry not found")
        
    result = dict(entry)
    result["agreement_id"] = agreement_id
    result["agreement_type"] = agreement_type
    return result

@router.get("/preview/{agreement_id}")
async def preview_agreement(agreement_id: str):
    path = agreement_generator.get_agreement_path(agreement_id)
    if not path or not path.exists():
        raise HTTPException(status_code=404, detail="Agreement not found")
        
    return FileResponse(
        path=path,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=path.name
    )

@router.put("/edit/{agreement_id}")
async def edit_agreement(agreement_id: str, updated_fields: Dict[str, Any]):
    path = agreement_generator.get_agreement_path(agreement_id)
    if not path:
        raise HTTPException(status_code=404, detail="Agreement not found")
        
    filename = path.name
    parts = filename.split('_')
    if len(parts) < 3:
        raise HTTPException(status_code=500, detail="Invalid agreement file format")
    entry_id = parts[0]
    agreement_type = parts[1]
    
    entry = excel_logger.get_entry(entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Original entry not found")
    
    # Save edits back to Excel log as well
    excel_logger.update_entry(entry_id, updated_fields)
    
    if "agreement_type" not in updated_fields:
        updated_fields["agreement_type"] = agreement_type or entry.get("agreement_type")
        
    try:
        new_id = agreement_generator.edit_agreement(agreement_id, updated_fields, entry)
    except Exception as e:
        logger.exception("Failed to edit agreement")
        raise HTTPException(status_code=500, detail=f"Failed to edit: {str(e)}")
        
    return {"agreement_id": new_id, "preview_url": f"/api/generate/preview/{new_id}"}

@router.get("/download/{agreement_id}")
async def download_agreement(agreement_id: str):
    path = agreement_generator.get_agreement_path(agreement_id)
    if not path or not path.exists():
        raise HTTPException(status_code=404, detail="Agreement not found")
        
    return FileResponse(
        path=path,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=path.name,
        headers={"Content-Disposition": f"attachment; filename={path.name}"}
    )

@router.delete("/rollback/{entry_id}")
async def rollback_entry(entry_id: str):
    success = excel_logger.rollback_entry(entry_id)
    if not success:
        raise HTTPException(status_code=404, detail="Entry not found or already cancelled")
        
    for file in GENERATED_DIR.glob(f"{entry_id}_*.docx"):
        file.unlink(missing_ok=True)
        
    return {"message": "Rollback successful"}
