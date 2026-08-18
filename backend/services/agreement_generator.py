import uuid
from pathlib import Path
from typing import Dict, Any, Optional
from docx import Document
from docx.shared import Inches
from PIL import Image

from config import TEMPLATES_DIR, GENERATED_DIR

class AgreementGenerator:
    
    def _replace_text_in_paragraph(self, paragraph, placeholders: Dict[str, str]):
        for key, val in placeholders.items():
            if key in paragraph.text:
                for run in paragraph.runs:
                    if key in run.text:
                        run.text = run.text.replace(key, str(val))
    
    def _replace_placeholders(self, doc: Document, placeholders: Dict[str, str]):
        # Replace in paragraphs
        for paragraph in doc.paragraphs:
            self._replace_text_in_paragraph(paragraph, placeholders)
            
        # Replace in tables
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    for paragraph in cell.paragraphs:
                        self._replace_text_in_paragraph(paragraph, placeholders)
                        
        # Replace in headers and footers
        for section in doc.sections:
            for header_para in section.header.paragraphs:
                self._replace_text_in_paragraph(header_para, placeholders)
            for footer_para in section.footer.paragraphs:
                self._replace_text_in_paragraph(footer_para, placeholders)

    def _normalize_image(self, img_path_str: str) -> Optional[str]:
        if not img_path_str:
            return None
        img_path = Path(img_path_str)
        if not img_path.exists():
            return None
        try:
            with Image.open(img_path) as im:
                # Re-save as clean standard PNG
                clean_path = img_path.parent / f"norm_{img_path.name}"
                im.convert("RGBA").save(clean_path, format="PNG")
                return str(clean_path)
        except Exception:
            return str(img_path)

    def _embed_signatures(self, doc: Document, customer_sig: str, msd_sig: str):
        clean_cust_sig = self._normalize_image(customer_sig)
        clean_msd_sig = self._normalize_image(msd_sig)

        # Replace in paragraphs
        for paragraph in doc.paragraphs:
            if '{{customer_signature}}' in paragraph.text:
                paragraph.text = paragraph.text.replace('{{customer_signature}}', '')
                if clean_cust_sig and Path(clean_cust_sig).exists():
                    try:
                        run = paragraph.add_run()
                        run.add_picture(clean_cust_sig, width=Inches(2.0))
                    except Exception:
                        pass
            if '{{msd_signature}}' in paragraph.text:
                paragraph.text = paragraph.text.replace('{{msd_signature}}', '')
                if clean_msd_sig and Path(clean_msd_sig).exists():
                    try:
                        run = paragraph.add_run()
                        run.add_picture(clean_msd_sig, width=Inches(2.0))
                    except Exception:
                        pass

        # Replace in tables
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    for paragraph in cell.paragraphs:
                        if '{{customer_signature}}' in paragraph.text:
                            paragraph.text = paragraph.text.replace('{{customer_signature}}', '')
                            if clean_cust_sig and Path(clean_cust_sig).exists():
                                try:
                                    run = paragraph.add_run()
                                    run.add_picture(clean_cust_sig, width=Inches(2.0))
                                except Exception:
                                    pass
                        if '{{msd_signature}}' in paragraph.text:
                            paragraph.text = paragraph.text.replace('{{msd_signature}}', '')
                            if clean_msd_sig and Path(clean_msd_sig).exists():
                                try:
                                    run = paragraph.add_run()
                                    run.add_picture(clean_msd_sig, width=Inches(2.0))
                                except Exception:
                                    pass

    def generate_agreement(self, entry_id: str, form_data: Dict[str, Any], agreement_type: str, 
                           customer_signature_path: str, msd_signature_path: str) -> str:
        agreement_id = str(uuid.uuid4())
        
        template_name = f"{agreement_type}.docx"
        template_path = TEMPLATES_DIR / template_name
        
        if not template_path.exists():
            raise FileNotFoundError(f"Template {template_name} not found at {template_path}")
            
        doc = Document(template_path)
        
        start_date = form_data.get('agreement_start_date')
        end_date = form_data.get('agreement_end_date')
        duration = ""
        if start_date and end_date:
            try:
                if isinstance(start_date, str):
                    from datetime import datetime
                    sd = datetime.fromisoformat(start_date)
                    ed = datetime.fromisoformat(end_date)
                    months = (ed.year - sd.year) * 12 + ed.month - sd.month
                    duration = f"{months} months"
            except Exception:
                pass

        placeholders = {
            '{{company_name}}': str(form_data.get('company_name', '')),
            '{{customer_address}}': str(form_data.get('customer_address', '')),
            '{{contact_person_name}}': str(form_data.get('contact_person_name', '')),
            '{{contact_person_designation}}': str(form_data.get('contact_person_designation', '')),
            '{{contact_person_email}}': str(form_data.get('contact_person_email', '')),
            '{{contact_person_phone}}': str(form_data.get('contact_person_phone', '')),
            '{{agreement_start_date}}': str(start_date),
            '{{agreement_end_date}}': str(end_date),
            '{{device_name}}': str(form_data.get('device_name', '')),
            '{{device_serial_number}}': str(form_data.get('device_serial_number', '')),
            '{{territory}}': str(form_data.get('territory', '')),
            '{{agreement_value}}': str(form_data.get('agreement_value', '')),
            '{{agreement_duration}}': duration
        }
        
        self._replace_placeholders(doc, placeholders)
        self._embed_signatures(doc, customer_signature_path, msd_signature_path)
        
        output_filename = f"{entry_id}_{agreement_type}_{agreement_id}.docx"
        output_path = GENERATED_DIR / output_filename
        doc.save(output_path)
        
        return agreement_id

    def edit_agreement(self, agreement_id: str, updated_fields: Dict[str, Any], entry: Dict[str, Any]) -> str:
        entry_id = entry.get('entry_id')
        agreement_type = entry.get('agreement_type')
        cust_sig = entry.get('customer_signature_path')
        msd_sig = entry.get('msd_signature_path')
        
        form_data = {**entry, **updated_fields}
        new_agreement_id = self.generate_agreement(entry_id, form_data, agreement_type, cust_sig, msd_sig)
        return new_agreement_id

    def get_agreement_path(self, agreement_id: str) -> Optional[Path]:
        for file in GENERATED_DIR.glob(f"*_{agreement_id}.docx"):
            return file
        return None

agreement_generator = AgreementGenerator()
