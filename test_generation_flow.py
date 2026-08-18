import requests
import json
import io
from PIL import Image

BASE_URL = "http://127.0.0.1:8000/api/generate"

print("--- TESTING AGREEMENT GENERATION FLOW ---")

# Create a valid PNG image using Pillow
img_buf = io.BytesIO()
img = Image.new('RGBA', (200, 80), color=(255, 255, 255, 0))
img.save(img_buf, format='PNG')
valid_png = img_buf.getvalue()

form_payload = {
    "company_name": "Apollo Hospitals Enterprise Ltd",
    "customer_address": "Greams Lane, 1, Greams Rd, Thousand Lights, Chennai, Tamil Nadu 600006",
    "contact_person_name": "Dr. Rajesh Sharma",
    "contact_person_designation": "Head of Medical Procurement",
    "contact_person_email": "rajesh.sharma@apollohospitals.com",
    "contact_person_phone": "+91-9876543210",
    "agreement_start_date": "2025-04-01",
    "agreement_end_date": "2026-03-31",
    "device_name": "Advanced Diagnostic Imaging Scanner Model X",
    "device_serial_number": "SN-APOLLO-2025-9988",
    "territory": "Tamil Nadu",
    "agreement_value": 7500000.0,
    "device_ownership": "customer",
    "agreement_type": "Device Purchase Agreement"
}

files = {
    "form_data": (None, json.dumps(form_payload)),
    "customer_signature": ("cust_sig.png", valid_png, "image/png"),
    "msd_signature": ("comp_sig.png", valid_png, "image/png")
}

# Step 1: Submit Form
print("\n1. Submitting form data to /submit...")
r1 = requests.post(f"{BASE_URL}/submit", files=files)
print("Response Code:", r1.status_code)
res1 = r1.json()
print("Response Data:", res1)
assert r1.status_code == 200, f"Submit failed: {r1.text}"
entry_id = res1["entry_id"]

# Step 2: Create Agreement DOCX
print(f"\n2. Creating agreement for entry_id: {entry_id}...")
r2 = requests.post(f"{BASE_URL}/create/{entry_id}", json={"agreement_type": "Device Purchase Agreement"})
print("Response Code:", r2.status_code)
res2 = r2.json()
print("Response Data:", res2)
assert r2.status_code == 200, f"Create failed: {r2.text}"
agreement_id = res2["agreement_id"]

# Step 3: Fetch Details
print(f"\n3. Fetching agreement details for agreement_id: {agreement_id}...")
r3 = requests.get(f"{BASE_URL}/details/{agreement_id}")
print("Response Code:", r3.status_code)
print("Response Data:", r3.json())
assert r3.status_code == 200, f"Details failed: {r3.text}"

# Step 4: Fetch Preview File
print(f"\n4. Fetching preview file for agreement_id: {agreement_id}...")
r4 = requests.get(f"{BASE_URL}/preview/{agreement_id}")
print("Response Code:", r4.status_code)
print("File Size:", len(r4.content), "bytes")
assert r4.status_code == 200, f"Preview failed: {r4.text}"

# Step 5: Edit Agreement
print(f"\n5. Editing agreement fields...")
r5 = requests.put(f"{BASE_URL}/edit/{agreement_id}", json={
    "agreement_value": 8500000.0,
    "contact_person_name": "Dr. Rajesh Sharma (Updated)"
})
print("Response Code:", r5.status_code)
print("Response Data:", r5.json())
assert r5.status_code == 200, f"Edit failed: {r5.text}"

# Step 6: Download Agreement
print(f"\n6. Downloading final agreement file...")
r6 = requests.get(f"{BASE_URL}/download/{agreement_id}")
print("Response Code:", r6.status_code)
print("File Size:", len(r6.content), "bytes")
assert r6.status_code == 200, f"Download failed: {r6.text}"

print("\nSUCCESS: ALL 6 ENDPOINTS PASSED WITH 200 OK!")
