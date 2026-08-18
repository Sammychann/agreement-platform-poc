# MSD India Agreement Generation & Validation Platform

An automated web platform engineered for **Merck (MSD India)** sales teams to streamline commercial agreement generation and automate batch document validation.

---

## 📌 Description

This platform automates two core operational workflows for the MSD India sales team:
1. **Agreement Generation**: Enables sales representatives to fill out customer details, capture digital signatures (draw on canvas or upload image), automatically log submissions into Excel, and generate standardized legal agreements (`.docx`) tailored to device ownership models.
2. **Agreement Validation**: Automatically inspects bulk uploaded customer agreement folders (`.zip` archives at Annual, Monthly, or Customer level) to check file presence, validate mandatory data fields across formats (`.docx`, `.xlsx`, `.pdf`, `.eml`), identify duplicate records, and produce detailed visual and exportable Excel reports (`.xlsx`).

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS v4 (Custom MSD `#00857C` Teal Branding)
- **Routing**: React Router DOM v6
- **Signature Capture**: `react-signature-canvas`
- **HTTP Client**: Axios

### Backend
- **Framework**: FastAPI (Python 3.11)
- **Server**: Uvicorn (ASGI)
- **Document Processing**: `python-docx` (Word templates & signature embedding)
- **Excel Engine**: `openpyxl` (Thread-safe Excel logging & report generation)
- **PDF Extraction**: `pdfplumber` (Field keyword validation)
- **Data Validation**: Pydantic v2

---

## ✨ Features

### 1. Agreement Generation Workflow
- 📝 **14 Comprehensive Form Fields**: Captures Company Name, Address, Contact Person, Designation, Email, Phone, Start Date, End Date, Device Name/Model, Serial Number, Territory/Region, Value (₹), Device Ownership, and T&C.
- ✍️ **Dual Signature Modes**: Interactive canvas drawing or file uploads for both Customer and MSD Authorized Signatory.
- 📊 **Excel Audit Logging**: Automatically appends entry to `agreements_log.xlsx` upon form submission with rollback capabilities.
- 📜 **Ownership-Based Agreement Types**:
  - **Customer Owned**: *Device Purchase Agreement*, *Annual Maintenance Contract (AMC)*
  - **MSD Owned**: *Device Loan Agreement*, *Device Placement Agreement*
- 📄 **Preview & Edit**: Instant template substitution, inline detail updates, and `.docx`/`.pdf` download options.

### 2. Agreement Validation Workflow
- 📁 **Flexible ZIP Batch Processing**: Auto-detects structure across Annual (`Year/Month/Company`), Monthly (`Month/Company`), or Customer (`Company`) folder archives.
- 🔍 **Rule-Based Validation (Zero LLM Overhead)**:
  - Verifies presence of 4 required files (`agreement`, `invoice`, `purchase_order`, `email`).
  - Scans document contents for mandatory field completeness.
  - Flags duplicate company records and duplicate references.
- 📈 **Interactive Dashboards & Reports**: Summary stats (Pass/Fail/Warnings), expandable company cards, and one-click Excel report export (`.xlsx`).

---

## 🚀 Quick Start Guide

### Windows One-Click Launch
Double-click `start.bat` in the repository root folder.

### Manual Launch

#### Backend:
```bash
cd backend
pip install -r requirements.txt
python main.py
```
*Backend runs at `http://localhost:8000` (API Docs at `http://localhost:8000/docs`)*

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs at `http://localhost:5173`*

---

## 🔮 Future Roadmap (Phase 2 LLM Integration)
- **Auto-Fill Missing Fields**: Integrate Gemini API + Google Search to discover missing company GST, CIN, and address details.
- **Contextual Clause Suggestions**: LLM-powered recommendations for non-standard commercial agreements.
