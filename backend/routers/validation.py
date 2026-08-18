import shutil
import uuid
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse

from config import TEMP_DIR
from schemas.validation import ValidationReport
from services.agreement_validator import agreement_validator

router = APIRouter(prefix="/api/validate", tags=["Validation"])

# In-memory store for reports (in production, use a database)
_reports_store: dict[str, ValidationReport] = {}


@router.post("/upload", response_model=ValidationReport)
async def upload_zip(file: UploadFile = File(...)):
    if not file.filename.endswith('.zip'):
        raise HTTPException(status_code=400, detail="File must be a ZIP archive")

    zip_path = TEMP_DIR / f"{uuid.uuid4()}_{file.filename}"

    try:
        with zip_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        report = agreement_validator.validate_zip(str(zip_path))

        # Generate Excel report for later download
        agreement_validator.generate_excel_report(report)

        # Store report for retrieval
        _reports_store[report.report_id] = report

        return report

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if zip_path.exists():
            zip_path.unlink(missing_ok=True)


@router.get("/report/{report_id}", response_model=ValidationReport)
async def get_report(report_id: str):
    report = _reports_store.get(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.get("/download-report/{report_id}")
async def download_report(report_id: str):
    report_path = TEMP_DIR / f"report_{report_id}.xlsx"

    if not report_path.exists():
        # Try to regenerate from stored report
        report = _reports_store.get(report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        agreement_validator.generate_excel_report(report)

    if not report_path.exists():
        raise HTTPException(status_code=404, detail="Report file could not be generated")

    return FileResponse(
        path=report_path,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename=f"validation_report_{report_id}.xlsx",
        headers={"Content-Disposition": f"attachment; filename=validation_report_{report_id}.xlsx"}
    )
