import requests
import json
import io
from PIL import Image

BASE_URL = "http://127.0.0.1:8000/api/generate"

print("--- TESTING RESTRUCTURED AGREEMENT GENERATION FLOW ---")

# Create a valid PNG image using Pillow
img_buf = io.BytesIO()
img = Image.new('RGBA', (200, 80), color=(0, 133, 124, 255))
img.save(img_buf, format='PNG')
valid_png = img_buf.getvalue()

# Test 1: Direct Agreement - Customer Ownership
print("\n[TEST 1] Submitting Direct Agreement Template-Customer ownership...")
form_payload_1 = {
    "agreement_type": "Direct Agreement Template-Customer ownership",
    "customer_name": "Apollo Veterinary Healthcare Ltd",
    "location": "Chennai, Tamil Nadu",
    "address": "No. 42, Greams Road, Thousand Lights, Chennai, Tamil Nadu - 600006",
    "date": "2026-05-28",
    "initiator_name_and_date": "Rajesh Sharma, 28/05/2026",
    "manager_name_and_date": "Sunita Rao, 28/05/2026",
    "receiver_name": "Dr. A. K. Verma",
    "receiver_title": "Head of Veterinary Procurement",
    "receiver_date": "28/05/2026",
    "intervet_name": "Dr. Vikram Anand",
    "intervet_title": "Director - Commercial Operations",
    "intervet_date": "28/05/2026",
    "equipment": [
        {"equipment_name": "Diagnostic Imaging Device Scanner Pro", "quantity": 2},
        {"equipment_name": "Innoject Needle-Free Applicator V2", "quantity": 5}
    ]
}

files_1 = {
    "form_data": (None, json.dumps(form_payload_1)),
    "customer_signature": ("cust_sig.png", valid_png, "image/png"),
    "intervet_signature": ("intervet_sig.png", valid_png, "image/png")
}

r1 = requests.post(f"{BASE_URL}/submit", files=files_1)
print("Response Code:", r1.status_code)
res1 = r1.json()
print("Response Data:", res1)
assert r1.status_code == 200, f"Submit failed: {r1.text}"
agreement_id_1 = res1["agreement_id"]

# Test Details endpoint
print(f"\n[TEST 2] Fetching agreement details for agreement_id: {agreement_id_1}...")
r2 = requests.get(f"{BASE_URL}/details/{agreement_id_1}")
print("Response Code:", r2.status_code)
res2 = r2.json()
print("Response Data:", res2)
assert r2.status_code == 200, f"Details failed: {r2.text}"
assert len(res2.get("equipment", [])) == 2, "Equipment list should have 2 items"

# Test Preview endpoint
print(f"\n[TEST 3] Fetching preview file for agreement_id: {agreement_id_1}...")
r3 = requests.get(f"{BASE_URL}/preview/{agreement_id_1}")
print("Response Code:", r3.status_code)
print("File Size:", len(r3.content), "bytes")
assert r3.status_code == 200, f"Preview failed: {r3.text}"

# Test Edit endpoint
print(f"\n[TEST 4] Editing agreement fields...")
r4 = requests.put(f"{BASE_URL}/edit/{agreement_id_1}", json={
    "customer_name": "Apollo Veterinary Healthcare Ltd (Updated)",
    "location": "Coimbatore, Tamil Nadu"
})
print("Response Code:", r4.status_code)
res4 = r4.json()
print("Response Data:", res4)
assert r4.status_code == 200, f"Edit failed: {r4.text}"

# Test Download endpoint
print(f"\n[TEST 5] Downloading final agreement file...")
r5 = requests.get(f"{BASE_URL}/download/{agreement_id_1}")
print("Response Code:", r5.status_code)
print("File Size:", len(r5.content), "bytes")
assert r5.status_code == 200, f"Download failed: {r5.text}"

# Test 6: Indirect Agreement with Optional Customer Signature (null/omitted)
print("\n[TEST 6] Testing Indirect Agreement with ONLY mandatory Intervet signature...")
form_payload_2 = {
    "agreement_type": "Indirect Agreement Template-Innoject Pro",
    "customer_name": "Sunrise Animal Care Clinic",
    "distributor_name": "MedVantage Distribution Network Pvt Ltd",
    "location": "Hyderabad, Telangana",
    "address": "Plot 88, Pharma Zone, Hyderabad - 500034",
    "date": "2026-06-01",
    "initiator_name_and_date": "Kavita Reddy, 01/06/2026",
    "manager_name_and_date": "Sunita Rao, 01/06/2026",
    "receiver_name": "Dr. Ramesh Babu",
    "receiver_title": "Chief Veterinarian",
    "receiver_date": "01/06/2026",
    "intervet_name": "Dr. Vikram Anand",
    "intervet_title": "Director - Commercial Operations",
    "intervet_date": "01/06/2026",
    "equipment": [
        {"equipment_name": "Innoject Pro Needle-Free System Unit", "quantity": 3}
    ]
}

files_2 = {
    "form_data": (None, json.dumps(form_payload_2)),
    "intervet_signature": ("intervet_sig.png", valid_png, "image/png")
    # Customer signature omitted
}

r6 = requests.post(f"{BASE_URL}/submit", files=files_2)
print("Response Code:", r6.status_code)
res6 = r6.json()
print("Response Data:", res6)
assert r6.status_code == 200, f"Submit failed: {r6.text}"

# Test 7: Rejection when mandatory Intervet signature is missing
print("\n[TEST 7] Testing rejection when mandatory Intervet signature is missing...")
files_missing_sig = {
    "form_data": (None, json.dumps(form_payload_2)),
    "customer_signature": ("cust_sig.png", valid_png, "image/png")
}
r7 = requests.post(f"{BASE_URL}/submit", files=files_missing_sig)
print("Response Code (should be 400):", r7.status_code)
assert r7.status_code == 400, "Should reject when Intervet signature is missing"

print("\n[SUCCESS] ALL TESTS PASSED SUCCESSFULLY! FULL AGREEMENT WORKFLOW IS WORKING AS SPECIFIED!")
