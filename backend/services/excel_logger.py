import uuid
import threading
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any
import openpyxl

from config import EXCEL_LOG_PATH
from schemas.generation import AgreementFormData

class ExcelLogger:
    def __init__(self):
        self.lock = threading.Lock()
        self.filepath = EXCEL_LOG_PATH
        self._ensure_file_exists()

    def _ensure_file_exists(self):
        with self.lock:
            if not self.filepath.exists():
                wb = openpyxl.Workbook()
                ws = wb.active
                ws.title = "Log"
                headers = [
                    "entry_id", "timestamp", "company_name", "customer_address",
                    "contact_person_name", "contact_person_designation",
                    "contact_person_email", "contact_person_phone",
                    "agreement_start_date", "agreement_end_date",
                    "device_name", "device_serial_number", "territory",
                    "agreement_value", "device_ownership", "agreement_type",
                    "status", "customer_signature_path", "msd_signature_path"
                ]
                ws.append(headers)
                wb.save(self.filepath)

    def log_entry(self, form_data: AgreementFormData, signatures_info: Dict[str, str]) -> str:
        entry_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()
        
        row = [
            entry_id,
            timestamp,
            form_data.company_name,
            form_data.customer_address,
            form_data.contact_person_name,
            form_data.contact_person_designation,
            form_data.contact_person_email,
            form_data.contact_person_phone,
            form_data.agreement_start_date.isoformat(),
            form_data.agreement_end_date.isoformat(),
            form_data.device_name,
            form_data.device_serial_number,
            form_data.territory,
            form_data.agreement_value,
            form_data.device_ownership,
            form_data.agreement_type,
            "ACTIVE",
            signatures_info.get("customer_signature", ""),
            signatures_info.get("msd_signature", "")
        ]

        with self.lock:
            wb = openpyxl.load_workbook(self.filepath)
            ws = wb.active
            ws.append(row)
            wb.save(self.filepath)
            
        return entry_id

    def rollback_entry(self, entry_id: str) -> bool:
        with self.lock:
            if not self.filepath.exists():
                return False
                
            wb = openpyxl.load_workbook(self.filepath)
            ws = wb.active
            
            # Find the header column for 'entry_id' and 'status'
            headers = [cell.value for cell in ws[1]]
            try:
                id_idx = headers.index("entry_id")
                status_idx = headers.index("status")
            except ValueError:
                return False
                
            for row in ws.iter_rows(min_row=2):
                if row[id_idx].value == entry_id:
                    row[status_idx].value = "CANCELLED"
                    wb.save(self.filepath)
                    return True
            return False

    def get_entry(self, entry_id: str) -> Optional[Dict[str, Any]]:
        with self.lock:
            if not self.filepath.exists():
                return None
                
            wb = openpyxl.load_workbook(self.filepath, data_only=True)
            ws = wb.active
            
            headers = [cell.value for cell in ws[1]]
            
            try:
                id_idx = headers.index("entry_id")
            except ValueError:
                return None
                
            for row in ws.iter_rows(min_row=2, values_only=True):
                if row[id_idx] == entry_id:
                    return dict(zip(headers, row))
            return None

excel_logger = ExcelLogger()
