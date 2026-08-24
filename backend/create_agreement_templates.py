"""
=============================================================================
AGREEMENT TEMPLATE GENERATOR
=============================================================================
Creates 4 Word (.docx) agreement templates with full legal content:
  1. Direct Agreement Template - Customer Ownership
  2. Direct Agreement Template - Innoject Pro
  3. Indirect Agreement Template - Customer Ownership
  4. Indirect Agreement Template - Innoject Pro

Each template contains:
  - Standard commercial agreement legal clauses
  - Placeholder fields for dynamic data ({{customer_name}}, {{location}}, etc.)
  - Equipment table marker ({{equipment_table}})
  - Exhibit A with auto-populated equipment marker ({{exhibit_a_equipment}})
  - Dual signature sections (Customer optional, Intervet mandatory)
  - Internal approval section
=============================================================================
"""

from docx import Document
from docx.shared import Pt, Inches, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn, nsdecls
from docx.oxml import parse_xml
from pathlib import Path

from config import TEMPLATES_DIR


def _set_cell_shading(cell, color_hex):
    """Apply background shading to a table cell."""
    shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
    cell._tc.get_or_add_tcPr().append(shading)


def _add_styled_heading(doc, text, level=1):
    """Add a heading with consistent styling."""
    heading = doc.add_heading(text, level=level)
    for run in heading.runs:
        run.font.color.rgb = RGBColor(0, 0x85, 0x7C)  # MSD Teal
    return heading


def _add_normal_paragraph(doc, text, bold=False, alignment=None, space_after=Pt(6)):
    """Add a standard paragraph."""
    p = doc.add_paragraph()
    if alignment:
        p.alignment = alignment
    run = p.add_run(text)
    run.bold = bold
    run.font.size = Pt(11)
    run.font.name = 'Calibri'
    p.paragraph_format.space_after = space_after
    return p


def _add_equipment_table_marker(doc):
    """Add the equipment table placeholder that will be replaced dynamically."""
    p = doc.add_paragraph()
    run = p.add_run('{{equipment_table}}')
    run.font.size = Pt(11)
    run.font.name = 'Calibri'
    return p


def _add_internal_approval_section(doc):
    """Add the Internal Approval section."""
    _add_styled_heading(doc, 'INTERNAL APPROVAL', level=2)

    table = doc.add_table(rows=3, cols=2)
    table.style = 'Table Grid'
    table.alignment = WD_TABLE_ALIGNMENT.CENTER

    # Header row
    for i, header in enumerate(['Role', 'Name and Date']):
        cell = table.cell(0, i)
        cell.text = header
        for p in cell.paragraphs:
            for run in p.runs:
                run.bold = True
                run.font.size = Pt(10)
                run.font.name = 'Calibri'
        _set_cell_shading(cell, 'E6F3F2')

    # Initiator row
    table.cell(1, 0).text = 'Initiator'
    table.cell(1, 1).text = '{{initiator_name_and_date}}'

    # Manager row
    table.cell(2, 0).text = 'Manager'
    table.cell(2, 1).text = '{{manager_name_and_date}}'

    # Style data cells
    for row_idx in range(1, 3):
        for col_idx in range(2):
            cell = table.cell(row_idx, col_idx)
            for p in cell.paragraphs:
                for run in p.runs:
                    run.font.size = Pt(10)
                    run.font.name = 'Calibri'

    doc.add_paragraph()


def _add_signature_section(doc):
    """Add the dual signature section."""
    _add_styled_heading(doc, 'SIGNATURES', level=2)

    _add_normal_paragraph(doc,
        'IN WITNESS WHEREOF, the parties hereto have executed this Agreement as of the date first written above.',
        space_after=Pt(12))

    table = doc.add_table(rows=6, cols=2)
    table.style = 'Table Grid'
    table.alignment = WD_TABLE_ALIGNMENT.CENTER

    # Set column widths
    for row in table.rows:
        row.cells[0].width = Inches(3.5)
        row.cells[1].width = Inches(3.5)

    # --- Column 1: Customer / Receiver ---
    header_cell_1 = table.cell(0, 0)
    header_cell_1.text = 'Customer / Receiver'
    _set_cell_shading(header_cell_1, 'E6F3F2')
    for p in header_cell_1.paragraphs:
        for run in p.runs:
            run.bold = True
            run.font.size = Pt(10)
            run.font.name = 'Calibri'

    table.cell(1, 0).text = 'Signature:'
    sig_cell_1 = table.cell(2, 0)
    sig_cell_1.text = '{{customer_signature}}'
    table.cell(3, 0).text = 'Name: {{receiver_name}}'
    table.cell(4, 0).text = 'Title: {{receiver_title}}'
    table.cell(5, 0).text = 'Date: {{receiver_date}}'

    # --- Column 2: Intervet India Private Limited ---
    header_cell_2 = table.cell(0, 1)
    header_cell_2.text = 'Intervet India Private Limited'
    _set_cell_shading(header_cell_2, 'E6F3F2')
    for p in header_cell_2.paragraphs:
        for run in p.runs:
            run.bold = True
            run.font.size = Pt(10)
            run.font.name = 'Calibri'

    table.cell(1, 1).text = 'Signature:'
    sig_cell_2 = table.cell(2, 1)
    sig_cell_2.text = '{{intervet_signature}}'
    table.cell(3, 1).text = 'Name: {{intervet_name}}'
    table.cell(4, 1).text = 'Title: {{intervet_title}}'
    table.cell(5, 1).text = 'Date: {{intervet_date}}'

    # Style all data cells
    for row_idx in range(1, 6):
        for col_idx in range(2):
            cell = table.cell(row_idx, col_idx)
            for p in cell.paragraphs:
                for run in p.runs:
                    run.font.size = Pt(10)
                    run.font.name = 'Calibri'

    doc.add_paragraph()


def _add_exhibit_a(doc):
    """Add Exhibit A section with equipment auto-population marker."""
    doc.add_page_break()
    _add_styled_heading(doc, 'EXHIBIT A', level=1)
    _add_normal_paragraph(doc, 'EQUIPMENT SCHEDULE', bold=True,
                          alignment=WD_ALIGN_PARAGRAPH.CENTER)

    _add_normal_paragraph(doc,
        'The following equipment is covered under this Agreement:',
        space_after=Pt(12))

    # Equipment auto-population marker
    p = doc.add_paragraph()
    run = p.add_run('{{exhibit_a_equipment}}')
    run.font.size = Pt(11)
    run.font.name = 'Calibri'

    doc.add_paragraph()
    _add_normal_paragraph(doc,
        'This Exhibit A forms an integral part of the Agreement and shall be read in conjunction with all terms and conditions stated therein.',
        space_after=Pt(12))


def _create_title_page(doc, title, subtitle=None):
    """Create the title header for the agreement."""
    # Company header
    header_p = doc.add_paragraph()
    header_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = header_p.add_run('INTERVET INDIA PRIVATE LIMITED')
    run.bold = True
    run.font.size = Pt(16)
    run.font.color.rgb = RGBColor(0, 0x85, 0x7C)
    run.font.name = 'Calibri'

    # Subtitle line
    sub_p = doc.add_paragraph()
    sub_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run2 = sub_p.add_run('(A subsidiary of Merck & Co., Inc.)')
    run2.font.size = Pt(10)
    run2.font.color.rgb = RGBColor(0x66, 0x66, 0x66)
    run2.font.name = 'Calibri'

    doc.add_paragraph()  # spacer

    # Agreement title
    title_p = doc.add_paragraph()
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_run = title_p.add_run(title.upper())
    title_run.bold = True
    title_run.font.size = Pt(14)
    title_run.font.name = 'Calibri'

    if subtitle:
        sub_title_p = doc.add_paragraph()
        sub_title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        sub_run = sub_title_p.add_run(subtitle)
        sub_run.font.size = Pt(11)
        sub_run.font.color.rgb = RGBColor(0x66, 0x66, 0x66)
        sub_run.font.name = 'Calibri'

    # Date line
    date_p = doc.add_paragraph()
    date_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    date_run = date_p.add_run('Date: {{date}}')
    date_run.font.size = Pt(11)
    date_run.font.name = 'Calibri'

    doc.add_paragraph()  # spacer


# =============================================================================
# TEMPLATE 1: Direct Agreement - Customer Ownership
# =============================================================================
def create_direct_customer_ownership():
    doc = Document()

    # Set default font
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Calibri'
    font.size = Pt(11)

    _create_title_page(doc,
        'DIRECT DEVICE AGREEMENT',
        'Customer Ownership Model')

    # --- Section 1: Parties ---
    _add_styled_heading(doc, '1. PARTIES', level=1)
    _add_normal_paragraph(doc,
        'This Device Agreement ("Agreement") is entered into as of {{date}} ("Effective Date"), by and between:')
    _add_normal_paragraph(doc,
        'Intervet India Private Limited, a company incorporated under the laws of India, having its registered office at Pune, Maharashtra (hereinafter referred to as "Intervet" or "Company"), of the FIRST PART;',
        space_after=Pt(8))
    _add_normal_paragraph(doc, 'AND')
    _add_normal_paragraph(doc,
        '{{customer_name}}, located at {{location}} (hereinafter referred to as the "Customer" or "Recipient"), of the SECOND PART.',
        space_after=Pt(8))
    _add_normal_paragraph(doc,
        '(Intervet and the Customer are hereinafter individually referred to as "Party" and collectively as "Parties".)')

    # --- Section 2: Recitals ---
    _add_styled_heading(doc, '2. RECITALS', level=1)
    _add_normal_paragraph(doc,
        'WHEREAS, Intervet is engaged in the business of manufacturing, importing, distributing, and selling animal health products, vaccines, and pharmaceutical devices for veterinary use;')
    _add_normal_paragraph(doc,
        'WHEREAS, the Customer desires to purchase certain equipment/devices from Intervet for use in its veterinary or animal health practice;')
    _add_normal_paragraph(doc,
        'WHEREAS, Intervet agrees to sell and the Customer agrees to purchase the equipment/devices subject to the terms and conditions set forth in this Agreement;')
    _add_normal_paragraph(doc,
        'NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the Parties agree as follows:')

    # --- Section 3: Equipment Details ---
    _add_styled_heading(doc, '3. EQUIPMENT DETAILS', level=1)
    _add_normal_paragraph(doc,
        'The following equipment/devices are covered under this Agreement:')
    _add_equipment_table_marker(doc)

    # --- Section 4: Terms and Conditions ---
    _add_styled_heading(doc, '4. TERMS AND CONDITIONS', level=1)

    _add_styled_heading(doc, '4.1 Ownership and Transfer', level=2)
    _add_normal_paragraph(doc,
        'Upon completion of the sale and receipt of full payment, the ownership of the equipment shall transfer to the Customer. The Customer shall be the sole and absolute owner of the equipment from the date of delivery.')

    _add_styled_heading(doc, '4.2 Delivery', level=2)
    _add_normal_paragraph(doc,
        'Intervet shall deliver the equipment to the Customer at the address specified in the Device Release Form. The risk of loss or damage to the equipment shall pass to the Customer upon delivery.')

    _add_styled_heading(doc, '4.3 Payment', level=2)
    _add_normal_paragraph(doc,
        'The Customer agrees to pay for the equipment as per the commercial terms agreed between the Parties. All payments shall be made within 30 (thirty) days from the date of invoice, unless otherwise agreed in writing.')

    _add_styled_heading(doc, '4.4 Warranty', level=2)
    _add_normal_paragraph(doc,
        'Intervet warrants that the equipment shall be free from defects in material and workmanship for a period of 12 (twelve) months from the date of delivery ("Warranty Period"). This warranty does not cover damage caused by misuse, negligence, unauthorized modification, or normal wear and tear.')

    _add_styled_heading(doc, '4.5 Maintenance and Support', level=2)
    _add_normal_paragraph(doc,
        'During the Warranty Period, Intervet shall provide free maintenance and technical support for the equipment. After the expiry of the Warranty Period, maintenance services shall be available at mutually agreed commercial terms.')

    _add_styled_heading(doc, '4.6 Use of Equipment', level=2)
    _add_normal_paragraph(doc,
        'The Customer shall use the equipment solely for the purposes intended and in accordance with the manufacturer\'s guidelines and instructions. The Customer shall ensure that the equipment is operated only by qualified and trained personnel.')

    _add_styled_heading(doc, '4.7 Indemnification', level=2)
    _add_normal_paragraph(doc,
        'Each Party shall indemnify and hold harmless the other Party from and against any and all claims, losses, damages, liabilities, costs, and expenses arising out of or in connection with any breach of this Agreement or any negligent or wrongful act or omission of the indemnifying Party.')

    _add_styled_heading(doc, '4.8 Confidentiality', level=2)
    _add_normal_paragraph(doc,
        'Both Parties agree to maintain the confidentiality of all proprietary and confidential information exchanged in connection with this Agreement. This obligation shall survive the termination or expiry of this Agreement for a period of 3 (three) years.')

    _add_styled_heading(doc, '4.9 Governing Law and Dispute Resolution', level=2)
    _add_normal_paragraph(doc,
        'This Agreement shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with this Agreement shall be resolved through mutual negotiations. If the dispute cannot be resolved amicably, it shall be referred to arbitration in accordance with the Arbitration and Conciliation Act, 1996, with the seat of arbitration in Pune, Maharashtra.')

    _add_styled_heading(doc, '4.10 Termination', level=2)
    _add_normal_paragraph(doc,
        'This Agreement may be terminated by either Party upon 30 (thirty) days\' prior written notice to the other Party. In the event of a material breach by either Party, the non-breaching Party may terminate this Agreement immediately upon written notice.')

    _add_styled_heading(doc, '4.11 Entire Agreement', level=2)
    _add_normal_paragraph(doc,
        'This Agreement, together with its Exhibits and any amendments executed by both Parties, constitutes the entire agreement between the Parties with respect to the subject matter hereof and supersedes all prior agreements, understandings, negotiations, and discussions, whether oral or written.')

    # --- Section 5: Device Release Form ---
    _add_styled_heading(doc, '5. DEVICE RELEASE FORM', level=1)
    _add_normal_paragraph(doc, 'Date: {{date}}')
    _add_normal_paragraph(doc, 'To,')
    _add_normal_paragraph(doc, '{{customer_name}}')
    _add_normal_paragraph(doc, '{{address}}')
    doc.add_paragraph()
    _add_normal_paragraph(doc,
        'Dear Sir/Madam,')
    _add_normal_paragraph(doc,
        'With reference to the above-captioned Agreement, we hereby confirm the release and delivery of the following equipment to the Customer as detailed herein. Please acknowledge receipt of the equipment by signing below.')
    _add_normal_paragraph(doc,
        'The equipment is being released in good working condition and has been tested and verified prior to dispatch.')

    # --- Section 6: Internal Approval ---
    _add_internal_approval_section(doc)

    # --- Section 7: Signatures ---
    _add_signature_section(doc)

    # --- Exhibit A ---
    _add_exhibit_a(doc)

    return doc


# =============================================================================
# TEMPLATE 2: Direct Agreement - Innoject Pro
# =============================================================================
def create_direct_innoject_pro():
    doc = Document()

    style = doc.styles['Normal']
    font = style.font
    font.name = 'Calibri'
    font.size = Pt(11)

    _create_title_page(doc,
        'DIRECT DEVICE AGREEMENT',
        'Innoject Pro — Needle-Free Injection System')

    # --- Section 1: Parties ---
    _add_styled_heading(doc, '1. PARTIES', level=1)
    _add_normal_paragraph(doc,
        'This Device Agreement ("Agreement") is entered into as of {{date}} ("Effective Date"), by and between:')
    _add_normal_paragraph(doc,
        'Intervet India Private Limited, a company incorporated under the laws of India, having its registered office at Pune, Maharashtra (hereinafter referred to as "Intervet" or "Company"), of the FIRST PART;',
        space_after=Pt(8))
    _add_normal_paragraph(doc, 'AND')
    _add_normal_paragraph(doc,
        '{{customer_name}}, located at {{location}} (hereinafter referred to as the "Customer" or "Recipient"), of the SECOND PART.',
        space_after=Pt(8))
    _add_normal_paragraph(doc,
        '(Intervet and the Customer are hereinafter individually referred to as "Party" and collectively as "Parties".)')

    # --- Section 2: Recitals ---
    _add_styled_heading(doc, '2. RECITALS', level=1)
    _add_normal_paragraph(doc,
        'WHEREAS, Intervet is engaged in the business of manufacturing, importing, distributing, and selling animal health products, vaccines, pharmaceutical devices, and needle-free injection systems for veterinary use;')
    _add_normal_paragraph(doc,
        'WHEREAS, Intervet has developed the Innoject Pro Needle-Free Injection System ("Innoject Pro"), a proprietary device designed for needle-free administration of vaccines and pharmaceuticals in animals;')
    _add_normal_paragraph(doc,
        'WHEREAS, the Customer desires to acquire Innoject Pro device(s) from Intervet for use in its veterinary or animal health practice;')
    _add_normal_paragraph(doc,
        'NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, the Parties agree as follows:')

    # --- Section 3: Equipment Details ---
    _add_styled_heading(doc, '3. EQUIPMENT DETAILS', level=1)
    _add_normal_paragraph(doc,
        'The following Innoject Pro device(s) and accessories are covered under this Agreement:')
    _add_equipment_table_marker(doc)

    # --- Section 4: Terms and Conditions ---
    _add_styled_heading(doc, '4. TERMS AND CONDITIONS', level=1)

    _add_styled_heading(doc, '4.1 Device Specifications', level=2)
    _add_normal_paragraph(doc,
        'The Innoject Pro is a needle-free injection system designed for the subcutaneous and intramuscular administration of vaccines and pharmaceuticals in livestock and companion animals. The device operates using high-pressure technology to deliver precise dosages without the use of needles.')

    _add_styled_heading(doc, '4.2 Ownership and Transfer', level=2)
    _add_normal_paragraph(doc,
        'Upon completion of the sale and receipt of full payment, the ownership of the Innoject Pro device(s) shall transfer to the Customer. The Customer shall be the sole and absolute owner of the device(s) from the date of delivery.')

    _add_styled_heading(doc, '4.3 Training and Certification', level=2)
    _add_normal_paragraph(doc,
        'Intervet shall provide comprehensive training to the Customer\'s designated personnel on the proper use, handling, maintenance, and safety protocols of the Innoject Pro device. Training shall be provided at no additional cost within 30 (thirty) days of delivery.')

    _add_styled_heading(doc, '4.4 Safety and Compliance', level=2)
    _add_normal_paragraph(doc,
        'The Customer shall use the Innoject Pro device only in accordance with the manufacturer\'s instructions and applicable regulatory requirements. The Customer shall ensure that all operators are trained and certified before using the device. Use of the device with unauthorized consumables or modifications shall void the warranty.')

    _add_styled_heading(doc, '4.5 Warranty', level=2)
    _add_normal_paragraph(doc,
        'Intervet warrants that the Innoject Pro device shall be free from defects in material and workmanship for a period of 12 (twelve) months from the date of delivery. This warranty covers manufacturing defects only and excludes damage caused by misuse, unauthorized modification, or failure to follow operating instructions.')

    _add_styled_heading(doc, '4.6 Consumables and Spare Parts', level=2)
    _add_normal_paragraph(doc,
        'The Customer shall purchase consumables, spare parts, and replacement components exclusively from Intervet or its authorized distributors to ensure device performance and safety compliance.')

    _add_styled_heading(doc, '4.7 Payment', level=2)
    _add_normal_paragraph(doc,
        'The Customer agrees to pay for the device(s) as per the commercial terms agreed between the Parties. All payments shall be made within 30 (thirty) days from the date of invoice.')

    _add_styled_heading(doc, '4.8 Indemnification', level=2)
    _add_normal_paragraph(doc,
        'Each Party shall indemnify and hold harmless the other Party from any claims, losses, or damages arising from any breach of this Agreement or negligent use of the device.')

    _add_styled_heading(doc, '4.9 Confidentiality', level=2)
    _add_normal_paragraph(doc,
        'Both Parties agree to maintain the confidentiality of all proprietary information, including device specifications, pricing, and technical documentation, for a period of 3 (three) years following termination of this Agreement.')

    _add_styled_heading(doc, '4.10 Governing Law', level=2)
    _add_normal_paragraph(doc,
        'This Agreement shall be governed by the laws of India. Any disputes shall be resolved through arbitration in Pune, Maharashtra, in accordance with the Arbitration and Conciliation Act, 1996.')

    _add_styled_heading(doc, '4.11 Entire Agreement', level=2)
    _add_normal_paragraph(doc,
        'This Agreement, together with its Exhibits, constitutes the entire agreement between the Parties and supersedes all prior understandings.')

    # --- Section 5: Device Release Form ---
    _add_styled_heading(doc, '5. DEVICE RELEASE FORM', level=1)
    _add_normal_paragraph(doc, 'Date: {{date}}')
    _add_normal_paragraph(doc, 'To,')
    _add_normal_paragraph(doc, '{{customer_name}}')
    _add_normal_paragraph(doc, '{{address}}')
    doc.add_paragraph()
    _add_normal_paragraph(doc,
        'Dear Sir/Madam,')
    _add_normal_paragraph(doc,
        'We hereby confirm the release and delivery of the Innoject Pro device(s) as detailed in this Agreement. Please acknowledge receipt by signing below.')

    # --- Section 6: Internal Approval ---
    _add_internal_approval_section(doc)

    # --- Section 7: Signatures ---
    _add_signature_section(doc)

    # --- Exhibit A ---
    _add_exhibit_a(doc)

    return doc


# =============================================================================
# TEMPLATE 3: Indirect Agreement - Customer Ownership
# =============================================================================
def create_indirect_customer_ownership():
    doc = Document()

    style = doc.styles['Normal']
    font = style.font
    font.name = 'Calibri'
    font.size = Pt(11)

    _create_title_page(doc,
        'INDIRECT DEVICE AGREEMENT',
        'Customer Ownership Model (via Distributor)')

    # --- Section 1: Parties ---
    _add_styled_heading(doc, '1. PARTIES', level=1)
    _add_normal_paragraph(doc,
        'This Device Agreement ("Agreement") is entered into as of {{date}} ("Effective Date"), by and between:')
    _add_normal_paragraph(doc,
        'Intervet India Private Limited, a company incorporated under the laws of India, having its registered office at Pune, Maharashtra (hereinafter referred to as "Intervet" or "Company"), of the FIRST PART;',
        space_after=Pt(8))
    _add_normal_paragraph(doc, 'AND')
    _add_normal_paragraph(doc,
        '{{distributor_name}}, acting as the authorized distributor (hereinafter referred to as the "Distributor"), of the SECOND PART;',
        space_after=Pt(8))
    _add_normal_paragraph(doc, 'AND')
    _add_normal_paragraph(doc,
        '{{customer_name}}, located at {{location}}, being the end-customer and final recipient of the equipment (hereinafter referred to as the "Customer" or "End-User"), of the THIRD PART.',
        space_after=Pt(8))
    _add_normal_paragraph(doc,
        '(Intervet, the Distributor, and the Customer are hereinafter individually referred to as "Party" and collectively as "Parties".)')

    # --- Section 2: Recitals ---
    _add_styled_heading(doc, '2. RECITALS', level=1)
    _add_normal_paragraph(doc,
        'WHEREAS, Intervet is engaged in the business of manufacturing, importing, distributing, and selling animal health products, vaccines, and pharmaceutical devices for veterinary use;')
    _add_normal_paragraph(doc,
        'WHEREAS, {{distributor_name}} is an authorized distributor of Intervet and is engaged in the distribution and sale of Intervet products within the designated territory;')
    _add_normal_paragraph(doc,
        'WHEREAS, the Customer ({{customer_name}}) desires to purchase certain equipment/devices through the Distributor for use in its veterinary or animal health practice;')
    _add_normal_paragraph(doc,
        'WHEREAS, Intervet agrees to supply the equipment through the Distributor, and the ownership of the equipment shall ultimately transfer to the Customer upon completion of the transaction;')
    _add_normal_paragraph(doc,
        'NOW, THEREFORE, in consideration of the mutual covenants contained herein, the Parties agree as follows:')

    # --- Section 3: Equipment Details ---
    _add_styled_heading(doc, '3. EQUIPMENT DETAILS', level=1)
    _add_normal_paragraph(doc,
        'The following equipment/devices are covered under this Agreement and shall be delivered to the Customer ({{customer_name}}) through the Distributor ({{distributor_name}}):')
    _add_equipment_table_marker(doc)

    # --- Section 4: Terms and Conditions ---
    _add_styled_heading(doc, '4. TERMS AND CONDITIONS', level=1)

    _add_styled_heading(doc, '4.1 Distribution Channel', level=2)
    _add_normal_paragraph(doc,
        'The equipment shall be supplied by Intervet to the Distributor ({{distributor_name}}), who shall in turn deliver the equipment to the Customer ({{customer_name}}). The Distributor is responsible for ensuring timely and safe delivery of the equipment to the Customer.')

    _add_styled_heading(doc, '4.2 Ownership and Transfer', level=2)
    _add_normal_paragraph(doc,
        'Upon completion of the sale transaction and receipt of full payment (either directly from the Customer or through the Distributor), the ownership of the equipment shall transfer to the Customer ({{customer_name}}). The Customer shall be the sole and absolute owner of the equipment.')

    _add_styled_heading(doc, '4.3 Responsibilities of the Distributor', level=2)
    _add_normal_paragraph(doc,
        'The Distributor ({{distributor_name}}) shall: (a) facilitate the delivery of equipment to the Customer; (b) provide initial product orientation and support; (c) collect and remit payments as per agreed commercial terms; (d) maintain accurate records of all transactions; and (e) report any product complaints or adverse events to Intervet within 24 hours.')

    _add_styled_heading(doc, '4.4 Payment', level=2)
    _add_normal_paragraph(doc,
        'Payment for the equipment shall be made as per the commercial terms agreed between the Parties. The Distributor shall ensure that all financial obligations are fulfilled within the agreed timelines.')

    _add_styled_heading(doc, '4.5 Warranty', level=2)
    _add_normal_paragraph(doc,
        'Intervet warrants that the equipment shall be free from defects in material and workmanship for a period of 12 (twelve) months from the date of delivery to the Customer. Warranty claims shall be processed through the Distributor or directly with Intervet.')

    _add_styled_heading(doc, '4.6 Maintenance and Support', level=2)
    _add_normal_paragraph(doc,
        'During the Warranty Period, Intervet shall provide maintenance and technical support either directly or through the Distributor. After the Warranty Period, maintenance services shall be available at mutually agreed commercial terms.')

    _add_styled_heading(doc, '4.7 Use of Equipment', level=2)
    _add_normal_paragraph(doc,
        'The Customer shall use the equipment solely for its intended purpose and in accordance with the manufacturer\'s guidelines. The Customer shall ensure that the equipment is operated only by qualified and trained personnel.')

    _add_styled_heading(doc, '4.8 Indemnification', level=2)
    _add_normal_paragraph(doc,
        'Each Party shall indemnify and hold harmless the other Parties from any claims, losses, or damages arising from any breach of this Agreement or negligent acts.')

    _add_styled_heading(doc, '4.9 Confidentiality', level=2)
    _add_normal_paragraph(doc,
        'All Parties agree to maintain the confidentiality of proprietary information exchanged in connection with this Agreement for a period of 3 (three) years following termination.')

    _add_styled_heading(doc, '4.10 Governing Law', level=2)
    _add_normal_paragraph(doc,
        'This Agreement shall be governed by the laws of India. Any disputes shall be resolved through arbitration in Pune, Maharashtra.')

    _add_styled_heading(doc, '4.11 Entire Agreement', level=2)
    _add_normal_paragraph(doc,
        'This Agreement constitutes the entire understanding between the Parties and supersedes all prior agreements.')

    # --- Section 5: Device Release Form ---
    _add_styled_heading(doc, '5. DEVICE RELEASE FORM', level=1)
    _add_normal_paragraph(doc, 'Date: {{date}}')
    _add_normal_paragraph(doc, 'To,')
    _add_normal_paragraph(doc, '{{distributor_name}}')
    _add_normal_paragraph(doc, '{{address}}')
    doc.add_paragraph()
    _add_normal_paragraph(doc,
        'Dear Sir/Madam,')
    _add_normal_paragraph(doc,
        'We hereby confirm the release and delivery of the equipment as detailed in this Agreement, for onward delivery to the Customer ({{customer_name}}) at {{location}}. Please acknowledge receipt by signing below.')

    # --- Section 6: Internal Approval ---
    _add_internal_approval_section(doc)

    # --- Section 7: Signatures ---
    _add_signature_section(doc)

    # --- Exhibit A ---
    _add_exhibit_a(doc)

    return doc


# =============================================================================
# TEMPLATE 4: Indirect Agreement - Innoject Pro
# =============================================================================
def create_indirect_innoject_pro():
    doc = Document()

    style = doc.styles['Normal']
    font = style.font
    font.name = 'Calibri'
    font.size = Pt(11)

    _create_title_page(doc,
        'INDIRECT DEVICE AGREEMENT',
        'Innoject Pro — Needle-Free Injection System (via Distributor)')

    # --- Section 1: Parties ---
    _add_styled_heading(doc, '1. PARTIES', level=1)
    _add_normal_paragraph(doc,
        'This Device Agreement ("Agreement") is entered into as of {{date}} ("Effective Date"), by and between:')
    _add_normal_paragraph(doc,
        'Intervet India Private Limited, a company incorporated under the laws of India, having its registered office at Pune, Maharashtra (hereinafter referred to as "Intervet" or "Company"), of the FIRST PART;',
        space_after=Pt(8))
    _add_normal_paragraph(doc, 'AND')
    _add_normal_paragraph(doc,
        '{{distributor_name}}, acting as the authorized distributor (hereinafter referred to as the "Distributor"), of the SECOND PART;',
        space_after=Pt(8))
    _add_normal_paragraph(doc, 'AND')
    _add_normal_paragraph(doc,
        '{{customer_name}}, located at {{location}}, being the end-customer and final recipient of the Innoject Pro device(s) (hereinafter referred to as the "Customer" or "End-User"), of the THIRD PART.',
        space_after=Pt(8))
    _add_normal_paragraph(doc,
        '(Intervet, the Distributor, and the Customer are hereinafter individually referred to as "Party" and collectively as "Parties".)')

    # --- Section 2: Recitals ---
    _add_styled_heading(doc, '2. RECITALS', level=1)
    _add_normal_paragraph(doc,
        'WHEREAS, Intervet is engaged in the business of manufacturing, importing, distributing, and selling animal health products, vaccines, pharmaceutical devices, and needle-free injection systems for veterinary use;')
    _add_normal_paragraph(doc,
        'WHEREAS, Intervet has developed the Innoject Pro Needle-Free Injection System ("Innoject Pro"), a proprietary device designed for needle-free administration of vaccines and pharmaceuticals in animals;')
    _add_normal_paragraph(doc,
        'WHEREAS, {{distributor_name}} is an authorized distributor of Intervet and is engaged in the distribution and sale of Intervet products;')
    _add_normal_paragraph(doc,
        'WHEREAS, the Customer ({{customer_name}}) desires to acquire Innoject Pro device(s) through the Distributor for use in its veterinary practice;')
    _add_normal_paragraph(doc,
        'NOW, THEREFORE, in consideration of the mutual covenants contained herein, the Parties agree as follows:')

    # --- Section 3: Equipment Details ---
    _add_styled_heading(doc, '3. EQUIPMENT DETAILS', level=1)
    _add_normal_paragraph(doc,
        'The following Innoject Pro device(s) and accessories are covered under this Agreement and shall be delivered to the Customer ({{customer_name}}) through the Distributor ({{distributor_name}}):')
    _add_equipment_table_marker(doc)

    # --- Section 4: Terms and Conditions ---
    _add_styled_heading(doc, '4. TERMS AND CONDITIONS', level=1)

    _add_styled_heading(doc, '4.1 Distribution Channel', level=2)
    _add_normal_paragraph(doc,
        'The Innoject Pro device(s) shall be supplied by Intervet to the Distributor ({{distributor_name}}), who shall deliver the device(s) to the Customer ({{customer_name}}). The Distributor is responsible for safe and timely delivery.')

    _add_styled_heading(doc, '4.2 Device Specifications', level=2)
    _add_normal_paragraph(doc,
        'The Innoject Pro is a needle-free injection system designed for subcutaneous and intramuscular administration of vaccines and pharmaceuticals in livestock and companion animals using high-pressure technology.')

    _add_styled_heading(doc, '4.3 Ownership and Transfer', level=2)
    _add_normal_paragraph(doc,
        'Upon completion of the sale and receipt of full payment, ownership of the Innoject Pro device(s) shall transfer to the Customer ({{customer_name}}). The Customer shall be the sole and absolute owner.')

    _add_styled_heading(doc, '4.4 Training and Certification', level=2)
    _add_normal_paragraph(doc,
        'Intervet shall arrange comprehensive training for the Customer\'s personnel, either directly or through the Distributor, on proper use, handling, maintenance, and safety protocols of the Innoject Pro device within 30 days of delivery.')

    _add_styled_heading(doc, '4.5 Safety and Compliance', level=2)
    _add_normal_paragraph(doc,
        'The Customer shall use the Innoject Pro device only in accordance with manufacturer\'s instructions and applicable regulations. Use with unauthorized consumables or modifications shall void the warranty.')

    _add_styled_heading(doc, '4.6 Responsibilities of the Distributor', level=2)
    _add_normal_paragraph(doc,
        'The Distributor ({{distributor_name}}) shall: (a) facilitate delivery of device(s) to the Customer; (b) coordinate training sessions; (c) collect and remit payments; (d) maintain transaction records; and (e) report product complaints to Intervet within 24 hours.')

    _add_styled_heading(doc, '4.7 Warranty', level=2)
    _add_normal_paragraph(doc,
        'Intervet warrants the Innoject Pro device(s) shall be free from manufacturing defects for 12 months from delivery to the Customer. This warranty excludes damage from misuse or unauthorized modification.')

    _add_styled_heading(doc, '4.8 Consumables and Spare Parts', level=2)
    _add_normal_paragraph(doc,
        'The Customer shall purchase consumables and spare parts exclusively from Intervet or authorized distributors to maintain device performance and safety compliance.')

    _add_styled_heading(doc, '4.9 Payment', level=2)
    _add_normal_paragraph(doc,
        'Payment for the device(s) shall be made as per agreed commercial terms. The Distributor shall ensure all financial obligations are fulfilled within agreed timelines.')

    _add_styled_heading(doc, '4.10 Indemnification', level=2)
    _add_normal_paragraph(doc,
        'Each Party shall indemnify and hold harmless the other Parties from any claims arising from breach of this Agreement or negligent acts.')

    _add_styled_heading(doc, '4.11 Confidentiality', level=2)
    _add_normal_paragraph(doc,
        'All Parties agree to maintain confidentiality of proprietary information, including device specifications, pricing, and technical documentation, for 3 years following termination.')

    _add_styled_heading(doc, '4.12 Governing Law', level=2)
    _add_normal_paragraph(doc,
        'This Agreement shall be governed by the laws of India. Disputes shall be resolved through arbitration in Pune, Maharashtra.')

    _add_styled_heading(doc, '4.13 Entire Agreement', level=2)
    _add_normal_paragraph(doc,
        'This Agreement constitutes the entire understanding between the Parties and supersedes all prior agreements.')

    # --- Section 5: Device Release Form ---
    _add_styled_heading(doc, '5. DEVICE RELEASE FORM', level=1)
    _add_normal_paragraph(doc, 'Date: {{date}}')
    _add_normal_paragraph(doc, 'To,')
    _add_normal_paragraph(doc, '{{distributor_name}}')
    _add_normal_paragraph(doc, '{{address}}')
    doc.add_paragraph()
    _add_normal_paragraph(doc,
        'Dear Sir/Madam,')
    _add_normal_paragraph(doc,
        'We hereby confirm the release and delivery of the Innoject Pro device(s) as detailed in this Agreement, for onward delivery to the Customer ({{customer_name}}) at {{location}}. Please acknowledge receipt by signing below.')

    # --- Section 6: Internal Approval ---
    _add_internal_approval_section(doc)

    # --- Section 7: Signatures ---
    _add_signature_section(doc)

    # --- Exhibit A ---
    _add_exhibit_a(doc)

    return doc


# =============================================================================
# MAIN GENERATOR
# =============================================================================
TEMPLATES = {
    'Direct Agreement Template-Customer ownership': create_direct_customer_ownership,
    'Direct Agreement Template-Innoject Pro': create_direct_innoject_pro,
    'Indirect Agreement Template-Customer Ownership': create_indirect_customer_ownership,
    'Indirect Agreement Template-Innoject Pro': create_indirect_innoject_pro,
}


def generate_all_templates():
    """Generate all 4 agreement templates."""
    TEMPLATES_DIR.mkdir(parents=True, exist_ok=True)
    for name, creator_fn in TEMPLATES.items():
        filepath = TEMPLATES_DIR / f"{name}.docx"
        doc = creator_fn()
        doc.save(filepath)
        print(f"  [OK] Created: {filepath.name}")


if __name__ == '__main__':
    print("Generating agreement templates...")
    generate_all_templates()
    print("Done.")
