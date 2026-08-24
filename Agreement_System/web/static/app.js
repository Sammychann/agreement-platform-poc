/**
 * =============================================================================
 * AGREEMENT MANAGEMENT SYSTEM - FRONTEND CLIENT SCRIPT (app.js)
 * =============================================================================
 * Handles:
 * - Dynamic form generation from config.py API
 * - Agreement type selection
 * - 1-Click sample test data autofill
 * - Form validation and error display
 * - Agreement generation (.docx & .pdf)
 * - In-browser document preview rendering
 * - Phase roadmap navigation
 * =============================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    // State
    let agreementConfig = {};
    let selectedTypeId = "type_1";
    let lastGeneratedData = null;

    // DOM Elements
    const navTabs = document.querySelectorAll(".nav-tab");
    const tabContents = document.querySelectorAll(".tab-content");
    const templateCards = document.querySelectorAll(".template-option-card");
    const dynamicForm = document.getElementById("agreementForm");
    const btnGenerate = document.getElementById("btnGenerateAgreement");
    const btnAutofill = document.getElementById("btnAutofillSample");
    const formErrorAlert = document.getElementById("formErrorAlert");
    const alertErrorList = document.getElementById("alertErrorList");

    // Output DOM Elements
    const outputEmptyState = document.getElementById("outputEmptyState");
    const outputResultPanel = document.getElementById("outputResultPanel");
    const resultAgreementTitle = document.getElementById("resultAgreementTitle");
    const resultTemplateUsed = document.getElementById("resultTemplateUsed");
    const resultGeneratedTime = document.getElementById("resultGeneratedTime");
    const btnDownloadDocx = document.getElementById("btnDownloadDocx");
    const btnDownloadPdf = document.getElementById("btnDownloadPdf");
    const labelDocxFilename = document.getElementById("labelDocxFilename");
    const labelPdfFilename = document.getElementById("labelPdfFilename");
    const previewPaperContent = document.getElementById("previewPaperContent");

    // Modal DOM Elements
    const previewModal = document.getElementById("previewModal");
    const btnOpenModalPreview = document.getElementById("btnOpenModalPreview");
    const btnCloseModal = document.getElementById("btnCloseModal");
    const btnModalCloseSecondary = document.getElementById("btnModalCloseSecondary");
    const modalPaperContent = document.getElementById("modalPaperContent");
    const modalDocTitle = document.getElementById("modalDocTitle");

    // -------------------------------------------------------------------------
    // 1. INITIALIZATION & CONFIG LOADING
    // -------------------------------------------------------------------------
    async function init() {
        setupNavTabs();
        setupTemplateCards();
        setupModalEvents();

        try {
            const res = await fetch("/api/config");
            const data = await res.json();
            if (data.status === "success") {
                agreementConfig = data.agreement_types;
                renderFormForType(selectedTypeId);
            }
        } catch (err) {
            console.error("Failed to load configuration:", err);
            dynamicForm.innerHTML = `<div class="alert-box error-alert">Error loading form configuration. Please check backend.</div>`;
        }
    }

    // -------------------------------------------------------------------------
    // 2. NAVIGATION TABS (PHASE 1 - 5)
    // -------------------------------------------------------------------------
    function setupNavTabs() {
        navTabs.forEach(tab => {
            tab.addEventListener("click", () => {
                const targetTabId = tab.getAttribute("data-tab");

                navTabs.forEach(t => t.classList.remove("active"));
                tabContents.forEach(c => c.classList.remove("active"));

                tab.classList.add("active");
                const targetContent = document.getElementById(targetTabId);
                if (targetContent) {
                    targetContent.classList.add("active");
                }
            });
        });
    }

    // -------------------------------------------------------------------------
    // 3. TEMPLATE SELECTION
    // -------------------------------------------------------------------------
    function setupTemplateCards() {
        templateCards.forEach(card => {
            card.addEventListener("click", () => {
                templateCards.forEach(c => c.classList.remove("selected"));
                card.classList.add("selected");

                selectedTypeId = card.getAttribute("data-type-id");
                hideErrorAlert();
                renderFormForType(selectedTypeId);
            });
        });
    }

    // -------------------------------------------------------------------------
    // 4. DYNAMIC FORM RENDERING
    // -------------------------------------------------------------------------
    function renderFormForType(typeId) {
        if (!agreementConfig[typeId]) return;

        const fields = agreementConfig[typeId].fields || [];
        dynamicForm.innerHTML = "";

        fields.forEach(field => {
            const formGroup = document.createElement("div");
            formGroup.className = `form-group ${field.type === 'textarea' ? 'col-span-2' : ''}`;

            const label = document.createElement("label");
            label.className = "form-label";
            label.setAttribute("for", `field_${field.key}`);
            label.innerHTML = `
                ${field.label}
                ${field.required ? '<span class="required-asterisk">*</span>' : ''}
            `;
            formGroup.appendChild(label);

            let inputElem;
            if (field.type === "textarea") {
                inputElem = document.createElement("textarea");
                inputElem.className = "form-textarea";
                inputElem.rows = 2;
            } else if (field.type === "select") {
                inputElem = document.createElement("select");
                inputElem.className = "form-select";
                (field.options || []).forEach(opt => {
                    const option = document.createElement("option");
                    option.value = opt;
                    option.textContent = opt;
                    if (opt === field.default) option.selected = true;
                    inputElem.appendChild(option);
                });
            } else {
                inputElem = document.createElement("input");
                inputElem.className = "form-input";
                inputElem.type = field.type || "text";
            }

            inputElem.id = `field_${field.key}`;
            inputElem.name = field.key;
            if (field.placeholder) inputElem.placeholder = field.placeholder;
            if (field.default && field.type !== "select") inputElem.value = field.default;
            if (field.required) inputElem.required = true;

            formGroup.appendChild(inputElem);

            if (field.help_text) {
                const help = document.createElement("span");
                help.className = "field-help";
                help.textContent = field.help_text;
                formGroup.appendChild(help);
            }

            dynamicForm.appendChild(formGroup);
        });
    }

    // -------------------------------------------------------------------------
    // 5. SAMPLE TEST DATA AUTOFILL
    // -------------------------------------------------------------------------
    btnAutofill.addEventListener("click", async () => {
        hideErrorAlert();
        try {
            const res = await fetch(`/api/sample-data/${selectedTypeId}`);
            const data = await res.json();

            if (data.status === "success" && data.sample_data) {
                const sample = data.sample_data;
                Object.keys(sample).forEach(key => {
                    const input = document.getElementById(`field_${key}`);
                    if (input) {
                        input.value = sample[key];
                    }
                });

                // Visual button feedback
                const origText = btnAutofill.innerHTML;
                btnAutofill.innerHTML = `✓ Sample Data Loaded`;
                btnAutofill.style.backgroundColor = "#ccfbf1";
                btnAutofill.style.borderColor = "#0d9488";
                setTimeout(() => {
                    btnAutofill.innerHTML = origText;
                    btnAutofill.style.backgroundColor = "";
                    btnAutofill.style.borderColor = "";
                }, 1400);
            }
        } catch (err) {
            console.error("Failed to load sample test data:", err);
        }
    });

    // -------------------------------------------------------------------------
    // 6. FORM VALIDATION & SUBMISSION
    // -------------------------------------------------------------------------
    btnGenerate.addEventListener("click", async () => {
        hideErrorAlert();

        // Extract form data
        const formData = {};
        const inputs = dynamicForm.querySelectorAll("input, textarea, select");
        const missingFields = [];

        inputs.forEach(input => {
            const key = input.name;
            const val = input.value.trim();
            formData[key] = val;

            if (input.required && !val) {
                const labelElem = input.parentElement.querySelector("label");
                const labelText = labelElem ? labelElem.textContent.replace('*', '').trim() : key;
                missingFields.push(labelText);
            }
        });

        // Client-side validation check
        if (missingFields.length > 0) {
            showErrorAlert(missingFields);
            return;
        }

        // Set button loading state
        const origBtnContent = btnGenerate.innerHTML;
        btnGenerate.disabled = true;
        btnGenerate.innerHTML = `
            <svg class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
                <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
            </svg>
            <span>Generating Agreement (.docx & .pdf)...</span>
        `;

        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    agreement_type_id: selectedTypeId,
                    form_data: formData
                })
            });

            const result = await response.json();

            if (result.status === "success") {
                lastGeneratedData = result;
                renderGenerationSuccess(result);
            } else {
                showErrorAlert(result.errors || [result.message || "Failed to generate agreement."]);
            }
        } catch (err) {
            console.error("Generation error:", err);
            showErrorAlert(["An unexpected network error occurred while generating agreement."]);
        } finally {
            btnGenerate.disabled = false;
            btnGenerate.innerHTML = origBtnContent;
        }
    });

    // -------------------------------------------------------------------------
    // 7. RENDER GENERATION SUCCESS & PREVIEW
    // -------------------------------------------------------------------------
    function renderGenerationSuccess(result) {
        // Toggle output panels
        outputEmptyState.classList.add("hidden");
        outputResultPanel.classList.remove("hidden");

        // Update result meta
        resultAgreementTitle.textContent = result.agreement_name || "Commercial Agreement";
        resultTemplateUsed.textContent = `Template: ${result.template_used}`;
        resultGeneratedTime.textContent = new Date().toLocaleTimeString();

        // Configure Word Download link
        labelDocxFilename.textContent = result.docx_filename;
        btnDownloadDocx.href = result.download_urls.docx;

        // Configure PDF Download link
        if (result.pdf_available && result.download_urls.pdf) {
            labelPdfFilename.textContent = result.pdf_filename;
            btnDownloadPdf.href = result.download_urls.pdf;
            btnDownloadPdf.style.display = "flex";
        } else {
            labelPdfFilename.textContent = "PDF generation in progress";
            btnDownloadPdf.style.display = "none";
        }

        // Render preview content
        if (result.preview) {
            renderPreviewPaper(result.preview, previewPaperContent);
            renderPreviewPaper(result.preview, modalPaperContent);
            modalDocTitle.textContent = result.preview.title || result.agreement_name;
        }

        // Scroll output into view smoothly on smaller screens
        outputResultPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function renderPreviewPaper(preview, container) {
        container.innerHTML = "";

        if (preview.title) {
            const titleElem = document.createElement("div");
            titleElem.className = "preview-title";
            titleElem.textContent = preview.title;
            container.appendChild(titleElem);
        }

        (preview.blocks || []).forEach(block => {
            if (block.type === "title") {
                // Already rendered
            } else if (block.type === "heading") {
                const h = document.createElement("div");
                h.className = "preview-heading";
                h.textContent = block.text;
                container.appendChild(h);
            } else if (block.type === "paragraph") {
                const p = document.createElement("p");
                p.className = "preview-p";
                p.textContent = block.text;
                container.appendChild(p);
            } else if (block.type === "table") {
                const table = document.createElement("table");
                table.className = "preview-table";
                (block.rows || []).forEach((row, idx) => {
                    const tr = document.createElement("tr");
                    row.forEach(cell => {
                        const cellTag = idx === 0 ? "th" : "td";
                        const c = document.createElement(cellTag);
                        c.textContent = cell;
                        tr.appendChild(c);
                    });
                    table.appendChild(tr);
                });
                container.appendChild(table);
            }
        });
    }

    // -------------------------------------------------------------------------
    // 8. MODAL PREVIEW EVENTS
    // -------------------------------------------------------------------------
    function setupModalEvents() {
        btnOpenModalPreview.addEventListener("click", () => {
            previewModal.classList.remove("hidden");
        });

        btnCloseModal.addEventListener("click", () => {
            previewModal.classList.add("hidden");
        });

        btnModalCloseSecondary.addEventListener("click", () => {
            previewModal.classList.add("hidden");
        });

        previewModal.addEventListener("click", (e) => {
            if (e.target === previewModal) {
                previewModal.classList.add("hidden");
            }
        });
    }

    // -------------------------------------------------------------------------
    // 9. ERROR ALERT HELPERS
    // -------------------------------------------------------------------------
    function showErrorAlert(errors) {
        alertErrorList.innerHTML = "";
        errors.forEach(err => {
            const li = document.createElement("li");
            li.textContent = err;
            alertErrorList.appendChild(li);
        });
        formErrorAlert.classList.remove("hidden");
        formErrorAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function hideErrorAlert() {
        formErrorAlert.classList.add("hidden");
        alertErrorList.innerHTML = "";
    }

    // Run initialization
    init();
});
