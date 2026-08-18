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
                try:
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
                finally:
                    wb.close()

    def log_entry(self, form_data: AgreementFormData, signatures_info: Dict[str, str], entry_id: Optional[str] = None) -> str:
        if not entry_id:
            entry_id = str(uuid.uuid4())
            
        timestamp = datetime.now().isoformat()
        
        start_date_str = form_data.agreement_start_date.isoformat() if hasattr(form_data.agreement_start_date, 'isoformat') else str(form_data.agreement_start_date)
        end_date_str = form_data.agreement_end_date.isoformat() if hasattr(form_data.agreement_end_date, 'isoformat') else str(form_data.agreement_end_date)
        
        row = [
            entry_id,
            timestamp,
            str(form_data.company_name or ''),
            str(form_data.customer_address or ''),
            str(form_data.contact_person_name or ''),
            str(form_data.contact_person_designation or ''),
            str(form_data.contact_person_email or ''),
            str(form_data.contact_person_phone or ''),
            start_date_str,
            end_date_str,
            str(form_data.device_name or ''),
            str(form_data.device_serial_number or ''),
            str(form_data.territory or ''),
            float(form_data.agreement_value or 0.0),
            str(form_data.device_ownership or ''),
            str(form_data.agreement_type or ''),
            "ACTIVE",
            str(signatures_info.get("customer_signature", "")),
            str(signatures_info.get("msd_signature", ""))
        ]

        with self.lock:
            wb = openpyxl.load_workbook(self.filepath)
            try:
                ws = wb.active
                ws.append(row)
                wb.save(self.filepath)
            finally:
                wb.close()
            
        return entry_id

    def update_entry(self, entry_id: str, updated_fields: Dict[str, Any]) -> bool:
        with self.lock:
            if not self.filepath.exists():
                return False
                
            wb = openpyxl.load_workbook(self.filepath)
            try:
                ws = wb.active
                headers = [cell.value for cell in ws[1]]
                try:
                    id_idx = headers.index("entry_id")
                except ValueError:
                    return False
                    
                for row in ws.iter_rows(min_row=2):
                    if str(row[id_idx].value) == str(entry_id):
                        for k, v in updated_fields.items():
                            if k in headers:
                                col_idx = headers.index(k)
                                row[col_idx].value = v
                        wb.save(self.filepath)
                        return True
                return False
            finally:
                wb.close()

    def rollback_entry(self, entry_id: str) -> bool:
        with self.lock:
            if not self.filepath.exists():
                return False
                
            wb = openpyxl.load_workbook(self.filepath)
            try:
                ws = wb.active
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
            finally:
                wb.close()

    def get_entry(self, entry_id: str) -> Optional[Dict[str, Any]]:
        with self.lock:
            if not self.filepath.exists():
                return None
                
            wb = openpyxl.load_workbook(self.filepath, data_only=True)
            try:
                ws = wb.active
                headers = [cell.value for cell in ws[1]]
                try:
                    id_idx = headers.index("entry_id")
                except ValueError:
                    return None
                    
                for row in ws.iter_rows(min_row=2, values_only=True):
                    if str(row[id_idx]) == str(entry_id):
                        return dict(zip(headers, row))
                return None
            finally:
                wb.close()

excel_logger = ExcelLogger()
