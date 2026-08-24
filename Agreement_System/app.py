"""
=============================================================================
AGREEMENT MANAGEMENT SYSTEM - WEB APPLICATION (app.py)
=============================================================================
This is the Flask web server that provides:
1. The interactive web dashboard interface.
2. Dynamic form fields based on the selected Agreement Type.
3. One-click sample dummy data filling for testing.
4. Document generation (.docx and .pdf).
5. In-browser document preview.
6. One-click Word and PDF downloads.
7. Modular roadmap navigation for Future Phases (Validation, Dates, Folders).

HOW TO RUN:
    In VS Code terminal:
    python app.py

    Then open your browser at:
    http://127.0.0.1:5000
=============================================================================
"""

import os
import json
from pathlib import Path
from flask import Flask, render_template, request, jsonify, send_file, abort

# Import internal modules
from config import (
    BASE_DIR,
    AGREEMENT_TYPES,
    TEMPLATES_DIR,
    OUTPUT_DIR,
    TEST_DATA_DIR,
    STATIC_DIR,
    TEMPLATES_WEB_DIR,
    get_agreement_config
)
from agreement_generation import (
    generate_agreement,
    validate_input_data,
    get_agreement_preview
)
from agreement_validation import validate_agreement_document
from date_validation import validate_agreement_dates
from folder_validation import validate_customer_folder

# Initialize Flask application
app = Flask(
    __name__,
    template_folder=str(TEMPLATES_WEB_DIR),
    static_folder=str(STATIC_DIR),
    static_url_path="/static"
)

# Set max upload size to 16 MB
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024


@app.route("/")
def index():
    """
    Renders the main Agreement System dashboard.
    """
    return render_template(
        "index.html",
        agreement_types=AGREEMENT_TYPES
    )


@app.route("/api/config", methods=["GET"])
def api_get_config():
    """
    Returns agreement types and field definitions for the frontend form generator.
    """
    return jsonify({
        "status": "success",
        "agreement_types": AGREEMENT_TYPES
    })


@app.route("/api/sample-data/<agreement_type_id>", methods=["GET"])
def api_get_sample_data(agreement_type_id):
    """
    Returns pre-configured dummy test data for 1-click testing in the UI.
    """
    sample_file = TEST_DATA_DIR / f"sample_{agreement_type_id}.json"
    
    if not sample_file.exists():
        return jsonify({
            "status": "error",
            "message": f"Sample data file not found for '{agreement_type_id}'"
        }), 404

    try:
        with open(sample_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        return jsonify({
            "status": "success",
            "agreement_type_id": agreement_type_id,
            "sample_data": data
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Error loading sample data: {str(e)}"
        }), 500


@app.route("/api/generate", methods=["POST"])
def api_generate_agreement():
    """
    Handles agreement generation request.
    Payload:
    {
        "agreement_type_id": "type_1",
        "form_data": { "customer_name": "...", ... }
    }
    """
    try:
        req_data = request.get_json()
        if not req_data:
            return jsonify({
                "status": "error",
                "message": "Invalid request body. Expected JSON."
            }), 400

        agreement_type_id = req_data.get("agreement_type_id")
        form_data = req_data.get("form_data", {})

        if not agreement_type_id or agreement_type_id not in AGREEMENT_TYPES:
            return jsonify({
                "status": "error",
                "message": f"Invalid or missing agreement_type_id: '{agreement_type_id}'"
            }), 400

        # Execute generation logic
        result = generate_agreement(agreement_type_id, form_data)

        if result.get("status") == "error":
            return jsonify(result), 400

        # Add download URLs for convenience
        result["download_urls"] = {
            "docx": f"/download/docx/{result['docx_filename']}",
            "pdf": f"/download/pdf/{result['pdf_filename']}" if result.get("pdf_filename") else None
        }

        return jsonify(result), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Unexpected server error during generation: {str(e)}"
        }), 500


@app.route("/download/<file_type>/<filename>", methods=["GET"])
def download_file(file_type, filename):
    """
    Serves generated .docx or .pdf files from the output directory.
    """
    # Security: Ensure filename doesn't contain directory traversal
    safe_filename = os.path.basename(filename)
    file_path = OUTPUT_DIR / safe_filename

    if not file_path.exists():
        abort(404, description=f"File '{safe_filename}' not found in output folder.")

    if file_type == "docx":
        mimetype = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    elif file_type == "pdf":
        mimetype = "application/pdf"
    else:
        mimetype = "application/octet-stream"

    return send_file(
        str(file_path),
        mimetype=mimetype,
        as_attachment=True,
        download_name=safe_filename
    )


@app.route("/api/preview/<filename>", methods=["GET"])
def api_get_preview(filename):
    """
    Extracts preview structure from an existing generated docx in the output folder.
    """
    safe_filename = os.path.basename(filename)
    file_path = OUTPUT_DIR / safe_filename

    if not file_path.exists():
        return jsonify({
            "status": "error",
            "message": f"File '{safe_filename}' not found in output directory."
        }), 404

    try:
        preview_data = get_agreement_preview(file_path)
        return jsonify({
            "status": "success",
            "filename": safe_filename,
            "preview": preview_data
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Could not extract preview: {str(e)}"
        }), 500


@app.route("/api/phase-info", methods=["GET"])
def api_get_phase_info():
    """
    Returns roadmap and overview info for all Phases 1-5.
    """
    return jsonify({
        "status": "success",
        "phases": [
            {
                "phase": 1,
                "name": "Agreement Generation",
                "status": "ACTIVE",
                "description": "Generate error-free Word and PDF agreements from 4 standardized templates while preserving fixed clauses."
            },
            {
                "phase": 2,
                "name": "Agreement Validation",
                "status": "ROADMAP / BLUEPRINT",
                "description": "Automated 10-point rule checker inspecting customer info, device models, serials, and signatures."
            },
            {
                "phase": 3,
                "name": "Date Chronology Validation",
                "status": "ROADMAP / BLUEPRINT",
                "description": "Chronological integrity validation (Approval Mail Date <= Agreement Date <= Term Dates)."
            },
            {
                "phase": 4,
                "name": "Customer Folder Completeness",
                "status": "ROADMAP / BLUEPRINT",
                "description": "Automated scanning of batch customer folders verifying presence of 4 mandatory documents (Agreement, Installation, Approval Mail, Finance)."
            },
            {
                "phase": 5,
                "name": "Approval Mail & Agreement Reconciliation",
                "status": "ROADMAP / FUTURE",
                "description": "Deep data cross-matching between email approval records and final executed contracts."
            }
        ]
    })


if __name__ == "__main__":
    print("\n" + "=" * 70)
    print("  COMMERCIAL AGREEMENT GENERATION SYSTEM (PHASE 1)")
    print("=" * 70)
    print(f"  * Templates Folder: {TEMPLATES_DIR}")
    print(f"  * Output Folder:    {OUTPUT_DIR}")
    print(f"  * Server running at: http://127.0.0.1:5000")
    print("=" * 70 + "\n")
    app.run(host="127.0.0.1", port=5000, debug=True)
