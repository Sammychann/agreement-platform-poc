import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormField from '../components/FormField';
import SignaturePad from '../components/SignaturePad';
import EquipmentTable from '../components/EquipmentTable';
import { submitForm } from '../services/api';

const TEMPLATES = [
  {
    id: 'Direct Agreement Template-Customer ownership',
    type: 'direct',
    badge: 'Direct • Customer Owned',
    title: 'Direct Device Agreement — Customer Ownership',
    desc: 'Two-party direct sales agreement where full equipment ownership transfers to the customer upon purchase.',
    icon: '🏢'
  },
  {
    id: 'Direct Agreement Template-Innoject Pro',
    type: 'direct',
    badge: 'Direct • Innoject Pro',
    title: 'Direct Device Agreement — Innoject Pro',
    desc: 'Direct agreement tailored for the Innoject Pro Needle-Free Injection System including training and compliance terms.',
    icon: '💉'
  },
  {
    id: 'Indirect Agreement Template-Customer Ownership',
    type: 'indirect',
    badge: 'Indirect • Three-Party',
    title: 'Indirect Device Agreement — Customer Ownership',
    desc: 'Three-party commercial agreement involving Intervet, authorized Distributor, and the End-Customer.',
    icon: '🤝'
  },
  {
    id: 'Indirect Agreement Template-Innoject Pro',
    type: 'indirect',
    badge: 'Indirect • Innoject Pro',
    title: 'Indirect Device Agreement — Innoject Pro',
    desc: 'Three-party agreement for Innoject Pro Needle-Free device supply through an authorized distributor network.',
    icon: '📦'
  }
];

const GenerationForm = () => {
  const navigate = useNavigate();

  // Selected Template
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0].id);

  // Form State
  const [formData, setFormData] = useState({
    customer_name: '',
    location: '',
    distributor_name: '',
    address: '',
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    initiator_name_and_date: '',
    manager_name_and_date: '',
    receiver_name: '',
    receiver_title: '',
    receiver_date: new Date().toLocaleDateString('en-GB'), // DD/MM/YYYY
    intervet_name: 'Dr. Vikram Anand',
    intervet_title: 'Director - Commercial Operations',
    intervet_date: new Date().toLocaleDateString('en-GB')
  });

  // Dynamic Equipment List
  const [equipment, setEquipment] = useState([
    { equipment_name: 'Innoject Pro Needle-Free Injector', quantity: 1 }
  ]);

  // Signatures
  const [customerSignature, setCustomerSignature] = useState(null);
  const [intervetSignature, setIntervetSignature] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isIndirect = selectedTemplate.includes('Indirect');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isFormValid = () => {
    if (!formData.customer_name || !formData.location || !formData.address || !formData.date) {
      return false;
    }
    if (isIndirect && !formData.distributor_name) {
      return false;
    }
    if (!equipment.length || equipment.some(e => !e.equipment_name || !e.quantity)) {
      return false;
    }
    if (!formData.initiator_name_and_date || !formData.manager_name_and_date) {
      return false;
    }
    if (!formData.receiver_name || !formData.receiver_title || !formData.receiver_date) {
      return false;
    }
    if (!formData.intervet_name || !formData.intervet_title || !formData.intervet_date) {
      return false;
    }
    // Intervet signature is mandatory
    if (!intervetSignature) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!intervetSignature) {
      setError('Intervet India Private Limited signature is mandatory. Please draw or upload signature before proceeding.');
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      return;
    }

    if (!isFormValid()) {
      setError('Please fill in all mandatory fields before generating agreement.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        agreement_type: selectedTemplate,
        equipment: equipment
      };

      const res = await submitForm(payload, customerSignature, intervetSignature);
      navigate(`/preview/${res.agreement_id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit form and generate agreement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Generate Commercial Agreement
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
          Select an agreement template, fill in the editable fields once, and generate fully formatted Word (.docx) agreements with automated data reuse.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg shadow-2xs">
          <div className="flex items-center">
            <span className="text-red-500 text-lg mr-2">⚠️</span>
            <p className="text-sm font-semibold text-red-700">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* STEP 1: Select Agreement Template */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xs border border-gray-200">
          <div className="flex items-center justify-between border-b pb-4 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-msd-teal">Step 1</span>
              <h2 className="text-xl font-bold text-gray-900 mt-0.5">Select Agreement Template</h2>
            </div>
            <span className="text-xs font-medium text-gray-500">4 Templates Available</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEMPLATES.map((tmpl) => {
              const isSelected = selectedTemplate === tmpl.id;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl.id)}
                  className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-msd-teal bg-msd-teal-light/50 ring-2 ring-msd-teal/20 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-2xl mr-3">{tmpl.icon}</span>
                    <span className={`text-2xs font-bold uppercase px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-msd-teal text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tmpl.badge}
                    </span>
                  </div>
                  <h3 className={`font-bold text-base mt-2 ${isSelected ? 'text-msd-teal-dark' : 'text-gray-900'}`}>
                    {tmpl.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {tmpl.desc}
                  </p>
                  {isSelected && (
                    <div className="mt-3 flex items-center text-xs font-bold text-msd-teal">
                      <span>✓ Selected Template</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 2: Parties Information */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xs border border-gray-200">
          <div className="border-b pb-4 mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-msd-teal">Step 2</span>
            <h2 className="text-xl font-bold text-gray-900 mt-0.5">Parties Information & Location</h2>
            <p className="text-xs text-gray-500 mt-1">
              Data entered here automatically populates all occurrences throughout the agreement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Customer Name"
              name="customer_name"
              placeholder="e.g. Apollo Hospitals Enterprise Ltd"
              value={formData.customer_name}
              onChange={handleChange}
              required
            />

            {isIndirect ? (
              <FormField
                label="Distributor Name"
                name="distributor_name"
                placeholder="e.g. MedVantage Pharma Distributors Pvt Ltd"
                value={formData.distributor_name}
                onChange={handleChange}
                required
              />
            ) : (
              <FormField
                label="Location (City / State)"
                name="location"
                placeholder="e.g. Chennai, Tamil Nadu"
                value={formData.location}
                onChange={handleChange}
                required
              />
            )}

            {isIndirect && (
              <FormField
                label="Location (Customer Location)"
                name="location"
                placeholder="e.g. Hyderabad, Telangana"
                value={formData.location}
                onChange={handleChange}
                required
              />
            )}

            <FormField
              label="Agreement Date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />

            <div className="md:col-span-2">
              <FormField
                label={isIndirect ? "Distributor Company Address (Release Form)" : "Customer Company Address (Release Form)"}
                type="textarea"
                name="address"
                placeholder={isIndirect ? "Full registered address of the Distributor Company..." : "Full registered address of the Customer Company..."}
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* STEP 3: Equipment Details & Exhibit A */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xs border border-gray-200">
          <div className="border-b pb-4 mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-msd-teal">Step 3</span>
            <h2 className="text-xl font-bold text-gray-900 mt-0.5">Equipment Details & EXHIBIT A</h2>
            <p className="text-xs text-gray-500 mt-1">
              Specify the number of equipment items. This schedule will automatically populate both the <strong>Equipment Details</strong> section and <strong>EXHIBIT A</strong> without re-typing.
            </p>
          </div>

          <EquipmentTable equipment={equipment} onChange={setEquipment} />
        </div>

        {/* STEP 4: Internal Approval Information */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xs border border-gray-200">
          <div className="border-b pb-4 mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-msd-teal">Step 4</span>
            <h2 className="text-xl font-bold text-gray-900 mt-0.5">Internal Approval Details</h2>
            <p className="text-xs text-gray-500 mt-1">
              Internal tracking metadata for the initiator and reviewing manager.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Initiator Name and Date"
              name="initiator_name_and_date"
              placeholder="e.g. Rajesh Nair, 28/05/2026"
              value={formData.initiator_name_and_date}
              onChange={handleChange}
              required
            />
            <FormField
              label="Manager Name and Date"
              name="manager_name_and_date"
              placeholder="e.g. Sunita Rao, 28/05/2026"
              value={formData.manager_name_and_date}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* STEP 5: Dual Signatures & Execution Section */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xs border border-gray-200">
          <div className="border-b pb-4 mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-msd-teal">Step 5</span>
            <h2 className="text-xl font-bold text-gray-900 mt-0.5">Signatures & Execution</h2>
            <p className="text-xs text-gray-500 mt-1">
              Intervet authorization signature is <strong>mandatory</strong>. Customer signature is <strong>optional</strong> and can be added later if needed.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Section 1: Customer / Receiver (Optional Signature) */}
            <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4">
              <div className="border-b pb-2">
                <span className="text-2xs font-bold uppercase text-gray-400">Signatory 1</span>
                <h3 className="text-base font-bold text-gray-900">Customer / Receiver</h3>
              </div>

              <SignaturePad
                label="Customer / Receiver Signature"
                onSignatureChange={setCustomerSignature}
                required={false}
                subtitle="Optional — user can upload or draw now, or sign the printed/downloaded agreement later."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <FormField
                  label="Receiver Name"
                  name="receiver_name"
                  placeholder="e.g. Dr. A. K. Sharma"
                  value={formData.receiver_name}
                  onChange={handleChange}
                  required
                />
                <FormField
                  label="Title / Designation"
                  name="receiver_title"
                  placeholder="e.g. Medical Director"
                  value={formData.receiver_title}
                  onChange={handleChange}
                  required
                />
                <div className="sm:col-span-2">
                  <FormField
                    label="Date (DD/MM/YYYY)"
                    name="receiver_date"
                    placeholder="e.g. 28/05/2026"
                    value={formData.receiver_date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Intervet India Private Limited (Mandatory Signature) */}
            <div className="border-2 border-msd-teal/40 rounded-xl p-5 bg-msd-teal-light/20 space-y-4">
              <div className="border-b border-msd-teal/20 pb-2">
                <span className="text-2xs font-bold uppercase text-msd-teal">Signatory 2</span>
                <h3 className="text-base font-bold text-gray-900">Intervet India Private Limited</h3>
              </div>

              <SignaturePad
                label="Intervet Authorized Signature"
                onSignatureChange={setIntervetSignature}
                required={true}
                subtitle="Mandatory — the agreement cannot be generated without an authorized Intervet signature."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <FormField
                  label="Authorized Signatory Name"
                  name="intervet_name"
                  value={formData.intervet_name}
                  onChange={handleChange}
                  required
                />
                <FormField
                  label="Title / Designation"
                  name="intervet_title"
                  value={formData.intervet_title}
                  onChange={handleChange}
                  required
                />
                <div className="sm:col-span-2">
                  <FormField
                    label="Date (DD/MM/YYYY)"
                    name="intervet_date"
                    value={formData.intervet_date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-2 pb-8">
          <button
            type="submit"
            disabled={!isFormValid() || loading}
            className={`w-full py-4 px-6 rounded-xl font-bold text-base shadow-md transition-all duration-200 flex items-center justify-center gap-3 ${
              !isFormValid() || loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-msd-teal hover:bg-msd-teal-dark text-white hover:shadow-lg cursor-pointer'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Generating Agreement Document...</span>
              </>
            ) : (
              <>
                <span>📄 Generate Word Agreement (.docx)</span>
                <span>➔</span>
              </>
            )}
          </button>
          {!intervetSignature && (
            <p className="text-center text-xs text-red-500 font-semibold mt-2">
              * Please provide the mandatory Intervet Authorized Signature above to enable generation.
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default GenerationForm;
