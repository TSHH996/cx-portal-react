import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useAppShell } from "../../contexts/AppShellContext";
import { useToast } from "../../contexts/ToastContext";
import { BRANDS, computeSlaDueAt, CUSTOMER_CONTACT_STATUSES, CUSTOMER_SATISFIED_OPTIONS, getLocalizedCategoryOptions, getLocalizedCityOptions, getLocalizedPriorityOptions, getLocalizedSourceOptions, getLocalizedStatusOptions, getLocalizedSubCategoryOptions, RESOLUTION_ACTION_TYPES, resolveBranchCity, SUB_CATEGORIES, YES_NO_OPTIONS } from "../../features/portal/newTicketConfig";
import { usePortalData } from "../../features/portal/usePortalData";
import { joinMultiValue } from "../../lib/multiValue";

function initialForm(copy) {
  const now = new Date();
  const localDateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  return {
    customer_name: copy.customerNameDefault || "Test Customer",
    customer_phone: copy.customerPhoneDefault || "0500000000",
    complaint_at: localDateTime,
    initial_action_taken: "No",
    initial_action_type: "",
    initial_customer_contact_status: "",
    initial_customer_satisfied: "",
    initial_resolution_details: "",
    city: "",
    branch_name: "",
    brand: "",
    priority: "Medium",
    status: "Open",
    feedback_type: "WhatsApp",
    feedback_category: [],
    sub_category: [],
    description: copy.descriptionDefault || "",
    files: [],
  };
}

function toggleEntry(entries, value) {
  return entries.includes(value)
    ? entries.filter((entry) => entry !== value)
    : [...entries, value];
}

function MultiChoiceField({ label, helper, values, options, emptyText, onToggle, disabled = false }) {
  const helperText = disabled && !options.length
    ? emptyText
    : values.length
      ? helper.replace("{values}", options.filter((option) => values.includes(option.value)).map((option) => option.label).join(" · "))
      : helper.replace("{values}", emptyText);

  return (
    <div className="fieldReact">
      <label>{label}</label>
      <div className={`multiPickField${disabled ? " is-disabled" : ""}`}>
        {options.length ? (
          <div className="multiPickGrid">
            {options.map((option) => {
              const active = values.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  className={`multiPickChip${active ? " active" : ""}`}
                  onClick={() => onToggle(option.value)}
                  aria-pressed={active}
                  disabled={disabled}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="multiPickEmpty">{emptyText}</div>
        )}
        <div className="panel-note">{helperText}</div>
        {values.length ? (
          <div className="multiPickSelection">
            {options.filter((option) => values.includes(option.value)).map((option) => <span key={option.value} className="soft-badge">{option.label}</span>)}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function NewTicketModal() {
  const { copy, language, isNewTicketOpen, closeNewTicket } = useAppShell();
  const { profile } = useAuth();
  const { branches, createTicket } = usePortalData(language);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm(copy));
  const [busy, setBusy] = useState(false);

  const normalizedBranches = useMemo(
    () => branches.map((branch) => ({ ...branch, city: resolveBranchCity(branch.branch_name, branch.city) })),
    [branches]
  );
  const cityOptions = useMemo(() => getLocalizedCityOptions(language), [language]);
  const priorityOptions = useMemo(() => getLocalizedPriorityOptions(language), [language]);
  const statusOptions = useMemo(() => getLocalizedStatusOptions(language), [language]);
  const sourceOptions = useMemo(() => getLocalizedSourceOptions(language), [language]);
  const categoryOptions = useMemo(() => getLocalizedCategoryOptions(language), [language]);

  const filteredBranches = useMemo(
    () => (form.city ? normalizedBranches.filter((branch) => branch.city === form.city) : normalizedBranches),
    [form.city, normalizedBranches]
  );

  const subCategoryOptions = useMemo(() => {
    const opts = new Set();
    (form.feedback_category || []).forEach((cat) => {
      (SUB_CATEGORIES[cat] || []).forEach((opt) => opts.add(opt));
    });
    return getLocalizedSubCategoryOptions([...opts].sort(), language);
  }, [form.feedback_category, language]);

  if (!isNewTicketOpen) return null;

  function handleCategoryToggle(value) {
    setForm((current) => {
      const nextCategories = toggleEntry(current.feedback_category, value);
      const validSubs = new Set();
      nextCategories.forEach((category) => (SUB_CATEGORIES[category] || []).forEach((entry) => validSubs.add(entry)));
      return {
        ...current,
        feedback_category: nextCategories,
        sub_category: current.sub_category.filter((entry) => validSubs.has(entry)),
      };
    });
  }

  function handleSubCategoryToggle(value) {
    setForm((current) => ({ ...current, sub_category: toggleEntry(current.sub_category, value) }));
  }

  function handleCityChange(city) {
    setForm((current) => {
      const selectedBranch = current.branch_name
        ? normalizedBranches.find((branch) => branch.branch_name === current.branch_name)
        : null;
      const keepBranch = !city || (selectedBranch && selectedBranch.city === city);
      return {
        ...current,
        city,
        branch_name: keepBranch ? current.branch_name : "",
      };
    });
  }

  function handleBranchChange(branchName) {
    const selectedBranch = normalizedBranches.find((branch) => branch.branch_name === branchName);
    setForm((current) => ({
      ...current,
      branch_name: branchName,
      city: selectedBranch?.city || current.city,
    }));
  }

  async function handleSubmit() {
    if (!form.branch_name) {
      showToast(copy.newTicketTitle || copy.newTicket, copy.pleaseSelectBranch || "Please select branch.", "bad");
      return;
    }

    try {
      setBusy(true);
      const payload = {
        customer_name: form.customer_name.trim() || copy.customerNameDefault || "Test Customer",
        customer_phone: form.customer_phone.trim() || copy.customerPhoneDefault || "0500000000",
        complaint_at: form.complaint_at ? new Date(form.complaint_at).toISOString() : null,
        created_by_name: profile?.name || null,
        created_by_email: profile?.email || null,
        initial_action_taken: form.initial_action_taken || "No",
        initial_action_type: form.initial_action_taken === "Yes" ? form.initial_action_type || null : null,
        initial_customer_contact_status: form.initial_action_taken === "Yes" ? form.initial_customer_contact_status || null : null,
        initial_customer_satisfied: form.initial_action_taken === "Yes" ? form.initial_customer_satisfied || null : null,
        initial_resolution_details: form.initial_action_taken === "Yes" ? form.initial_resolution_details.trim() || null : null,
        initial_action_recorded_at: form.initial_action_taken === "Yes" ? new Date().toISOString() : null,
        branch_name: form.branch_name.trim(),
        brand: form.brand.trim(),
        feedback_type: form.feedback_type.trim(),
        feedback_category: joinMultiValue(form.feedback_category) || null,
        sub_category: joinMultiValue(form.sub_category) || null,
        description: form.description.trim() || copy.descriptionDefault || "",
        priority: form.priority,
        status: form.status,
        sla_due_at: computeSlaDueAt(form.priority),
        sla_status: "pending",
      };
      const created = await createTicket(payload, form.files);
      showToast(
        copy.newTicketTitle || copy.newTicket,
        created?.emailError
          ? `${copy.createSuccess || "Ticket created successfully."} ${copy.emailSendWarning || "Branch email could not be delivered automatically."}`
          : copy.createSuccess || "Ticket created successfully.",
        created?.emailError ? "warn" : "good"
      );
      setForm(initialForm(copy));
      closeNewTicket();
      navigate("/tickets");
    } catch (error) {
      showToast(copy.ticketLoadError || "Error", error?.message || "Ticket creation failed.", "bad");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modalOverlayReact" onClick={(e) => { if (e.target === e.currentTarget) closeNewTicket(); }}>
      <div className="modalCardReact newTicketModalReact">
        <div className="modalHeadReact">
          <div>
            <div className="eyebrow-text">{copy.newTicketEyebrow || copy.newTicket}</div>
            <div className="modalTitleReact">{copy.newTicketTitle || copy.newTicket}</div>
            <div className="modalSubReact">{copy.newTicketSub || copy.newTicketReady}</div>
          </div>
          <button type="button" className="ghost-btn" onClick={closeNewTicket}>✕</button>
        </div>

        <div className="modalBodyReact">
          <div className="grid2React">
            <div className="fieldReact"><label>{copy.labelCustomerName || "Customer Name"}</label><input dir="auto" value={form.customer_name} onChange={(e) => setForm((current) => ({ ...current, customer_name: e.target.value }))} /></div>
            <div className="fieldReact"><label>{copy.labelCustomerPhone || "Customer Phone"}</label><input dir="auto" value={form.customer_phone} onChange={(e) => setForm((current) => ({ ...current, customer_phone: e.target.value }))} /></div>
          </div>

          <div className="grid2React">
            <div className="fieldReact"><label>{copy.labelCreatedBy || "Created By"}</label><input dir="auto" value={profile?.name || ""} readOnly /></div>
            <div className="fieldReact"><label>{copy.labelCreatedByEmail || "Created By Email"}</label><input dir="auto" value={profile?.email || ""} readOnly /></div>
          </div>

          <div className="fieldReact full"><label>{copy.labelComplaintDateTime || "Complaint Date & Time"}</label><input dir="auto" type="datetime-local" value={form.complaint_at} onChange={(e) => setForm((current) => ({ ...current, complaint_at: e.target.value }))} placeholder={copy.optionSelectDateTime || "Select date and time"} /></div>

          <div className="grid2React">
            <div className="fieldReact"><label>{copy.labelCity || "City"}</label><select dir="auto" value={form.city} onChange={(e) => handleCityChange(e.target.value)}><option value="">{copy.optionSelectCity || "Select city"}</option>{cityOptions.map((city) => <option key={city.value} value={city.value}>{city.label}</option>)}</select></div>
            <div className="fieldReact"><label>{copy.labelBranchName || "Branch Name"}</label><select dir="auto" value={form.branch_name} onChange={(e) => handleBranchChange(e.target.value)}><option value="">{copy.optionSelectBranch || "Select branch"}</option>{filteredBranches.map((branch) => <option key={branch.id || branch.branch_name} value={branch.branch_name}>{branch.branch_name}</option>)}</select>{form.city && filteredBranches.length === 0 ? <div className="panel-note" style={{ marginTop: 6 }}>{copy.noBranchesForCity || "No branches are available for the selected city yet."}</div> : null}</div>
          </div>

          <div className="grid2React">
            <div className="fieldReact"><label>{copy.labelBrand || "Brand"}</label><select dir="auto" value={form.brand} onChange={(e) => setForm((current) => ({ ...current, brand: e.target.value }))}><option value="">{copy.optionSelectBrand || "Select brand"}</option>{BRANDS.map((brand) => <option key={brand} value={brand}>{brand}</option>)}</select></div>
            <div className="fieldReact"><label>{copy.labelPriority || "Priority"}</label><select dir="auto" value={form.priority} onChange={(e) => setForm((current) => ({ ...current, priority: e.target.value }))}>{priorityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
          </div>

          <div className="fieldReact full"><label>{copy.labelStatus || "Status"}</label><select dir="auto" value={form.status} onChange={(e) => setForm((current) => ({ ...current, status: e.target.value }))}>{statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>

          <div className="fieldReact full"><label>{copy.labelFeedbackType || "Feedback Source"}</label><select dir="auto" value={form.feedback_type} onChange={(e) => setForm((current) => ({ ...current, feedback_type: e.target.value }))}>{sourceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>

          <div className="grid2React">
            <MultiChoiceField
              label={copy.labelFeedbackCategory || "Feedback Category"}
              helper={copy.multiSelectHelper || "Select one or more options. Current selection: {values}"}
              values={form.feedback_category}
              options={categoryOptions}
              emptyText={copy.multiSelectEmpty || "No selection yet."}
              onToggle={handleCategoryToggle}
            />
            <MultiChoiceField
              label={copy.labelSubCategory || "Sub Category"}
              helper={copy.multiSelectHelper || "Select one or more options. Current selection: {values}"}
              values={form.sub_category}
              options={subCategoryOptions}
              emptyText={copy.subCategorySelectFirst || "Select at least one feedback category first."}
              onToggle={handleSubCategoryToggle}
              disabled={subCategoryOptions.length === 0}
            />
          </div>

          <div className="fieldReact full"><label>{copy.labelDescription || "Description"}</label><textarea dir="auto" value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} /></div>

          <article className="panel-card detail-section-card">
            <div className="detail-section-head">
              <div>
                <div className="panel-heading">{copy.initialCustomerActionTitle}</div>
                <div className="panel-note">{copy.initialCustomerActionSub}</div>
              </div>
            </div>
            <div className="detail-section-stack">
              <div className="grid2React">
                <div className="fieldReact"><label>{copy.initialActionTakenLabel}</label><select dir="auto" value={form.initial_action_taken} onChange={(e) => setForm((current) => {
                  const next = e.target.value;
                  if (next === "No") {
                    return {
                      ...current,
                      initial_action_taken: next,
                      initial_action_type: "",
                      initial_customer_contact_status: "",
                      initial_customer_satisfied: "",
                      initial_resolution_details: "",
                    };
                  }
                  return { ...current, initial_action_taken: next };
                })}>{YES_NO_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
              </div>
              {form.initial_action_taken === "Yes" ? (
                <div className="resolution-grid">
                  <div className="fieldReact">
                    <label>{copy.initialActionTypeLabel}</label>
                    <select dir="auto" value={form.initial_action_type} onChange={(e) => setForm((current) => ({ ...current, initial_action_type: e.target.value }))}>
                      <option value="">--</option>
                      {RESOLUTION_ACTION_TYPES.map((value) => <option key={value} value={value}>{value}</option>)}
                    </select>
                  </div>
                  <div className="fieldReact">
                    <label>{copy.initialContactStatusLabel}</label>
                    <select dir="auto" value={form.initial_customer_contact_status} onChange={(e) => setForm((current) => ({ ...current, initial_customer_contact_status: e.target.value }))}>
                      <option value="">--</option>
                      {CUSTOMER_CONTACT_STATUSES.map((value) => <option key={value} value={value}>{value}</option>)}
                    </select>
                  </div>
                  <div className="fieldReact">
                    <label>{copy.initialSatisfiedLabel}</label>
                    <select dir="auto" value={form.initial_customer_satisfied} onChange={(e) => setForm((current) => ({ ...current, initial_customer_satisfied: e.target.value }))}>
                      <option value="">--</option>
                      {CUSTOMER_SATISFIED_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}
                    </select>
                  </div>
                  <div className="fieldReact full">
                    <label>{copy.initialResolutionDetailsLabel}</label>
                    <textarea dir="auto" value={form.initial_resolution_details} onChange={(e) => setForm((current) => ({ ...current, initial_resolution_details: e.target.value }))} placeholder={copy.initialResolutionDetailsPlaceholder} />
                  </div>
                </div>
              ) : null}
            </div>
          </article>

          <div className="fieldReact full"><label>{copy.labelAttachments || "Attachments"}</label><input type="file" multiple onChange={(e) => setForm((current) => ({ ...current, files: Array.from(e.target.files || []) }))} /><div className="panel-note">{form.files.length ? (copy.filesSelectedLabel || "{count} files selected").replace("{count}", form.files.length) : copy.attachmentsHelper || "Upload images, PDFs, or documents."}</div></div>
        </div>

        <div className="modalActionsReact">
          <button type="button" className="ghost-btn" onClick={closeNewTicket} disabled={busy}>{copy.btnCancelTxt || "Cancel"}</button>
          <button type="button" className="primary-btn" onClick={handleSubmit} disabled={busy}>{busy ? (copy.newTicketSubmitting || "Creating...") : (copy.btnCreateTxt || copy.newTicket || "Create Ticket")}</button>
        </div>
      </div>
    </div>
  );
}

export default NewTicketModal;
