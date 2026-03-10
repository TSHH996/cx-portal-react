import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppShell } from "../../contexts/AppShellContext";
import { useToast } from "../../contexts/ToastContext";
import { BRANDS, computeSlaDueAt, FEEDBACK_CATEGORIES, FEEDBACK_TYPES, PRIORITIES, STATUSES, SUB_CATEGORIES } from "../../features/portal/newTicketConfig";
import { usePortalData } from "../../features/portal/usePortalData";
import { joinMultiValue } from "../../lib/multiValue";

function initialForm(copy) {
  return {
    customer_name: copy.customerNameDefault || "Test Customer",
    customer_phone: copy.customerPhoneDefault || "0500000000",
    branch_name: "",
    brand: "",
    priority: "Medium",
    status: "Open",
    feedback_type: "WhatsApp",
    feedback_category: [],
    sub_category: [],
    description: copy.descriptionDefault || "test",
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
      ? helper.replace("{values}", values.join(" · "))
      : helper.replace("{values}", emptyText);

  return (
    <div className="fieldReact">
      <label>{label}</label>
      <div className={`multiPickField${disabled ? " is-disabled" : ""}`}>
        {options.length ? (
          <div className="multiPickGrid">
            {options.map((value) => {
              const active = values.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  className={`multiPickChip${active ? " active" : ""}`}
                  onClick={() => onToggle(value)}
                  aria-pressed={active}
                  disabled={disabled}
                >
                  {value}
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
            {values.map((value) => <span key={value} className="soft-badge">{value}</span>)}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function NewTicketModal() {
  const { copy, language, isNewTicketOpen, closeNewTicket } = useAppShell();
  const { branches, createTicket } = usePortalData(language);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm(copy));
  const [busy, setBusy] = useState(false);

  const subCategoryOptions = useMemo(() => {
    const opts = new Set();
    (form.feedback_category || []).forEach((cat) => {
      (SUB_CATEGORIES[cat] || []).forEach((opt) => opts.add(opt));
    });
    return [...opts].sort();
  }, [form.feedback_category]);

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
        branch_name: form.branch_name.trim(),
        brand: form.brand.trim(),
        feedback_type: form.feedback_type.trim(),
        feedback_category: joinMultiValue(form.feedback_category) || null,
        sub_category: joinMultiValue(form.sub_category) || null,
        description: form.description.trim() || copy.descriptionDefault || "test",
        priority: form.priority,
        status: form.status,
        sla_due_at: computeSlaDueAt(form.priority),
        sla_status: "pending",
      };
      await createTicket(payload, form.files);
      showToast(copy.newTicketTitle || copy.newTicket, copy.createSuccess || "Ticket created successfully.", "good");
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
            <div className="fieldReact"><label>{copy.labelCustomerName || "Customer Name"}</label><input value={form.customer_name} onChange={(e) => setForm((current) => ({ ...current, customer_name: e.target.value }))} /></div>
            <div className="fieldReact"><label>{copy.labelCustomerPhone || "Customer Phone"}</label><input value={form.customer_phone} onChange={(e) => setForm((current) => ({ ...current, customer_phone: e.target.value }))} /></div>
          </div>

          <div className="grid2React">
            <div className="fieldReact"><label>{copy.labelBranchName || "Branch Name"}</label><select value={form.branch_name} onChange={(e) => setForm((current) => ({ ...current, branch_name: e.target.value }))}><option value="">{copy.optionSelectBranch || "Select branch"}</option>{branches.map((branch) => <option key={branch.id || branch.branch_name} value={branch.branch_name}>{branch.branch_name}</option>)}</select></div>
            <div className="fieldReact"><label>{copy.labelBrand || "Brand"}</label><select value={form.brand} onChange={(e) => setForm((current) => ({ ...current, brand: e.target.value }))}><option value="">Select brand</option>{BRANDS.map((brand) => <option key={brand} value={brand}>{brand}</option>)}</select></div>
          </div>

          <div className="grid2React">
            <div className="fieldReact"><label>{copy.labelPriority || "Priority"}</label><select value={form.priority} onChange={(e) => setForm((current) => ({ ...current, priority: e.target.value }))}>{PRIORITIES.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
            <div className="fieldReact"><label>{copy.labelStatus || "Status"}</label><select value={form.status} onChange={(e) => setForm((current) => ({ ...current, status: e.target.value }))}>{STATUSES.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
          </div>

          <div className="fieldReact full"><label>{copy.labelFeedbackType || "Feedback Source"}</label><select value={form.feedback_type} onChange={(e) => setForm((current) => ({ ...current, feedback_type: e.target.value }))}>{FEEDBACK_TYPES.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>

          <div className="grid2React">
            <MultiChoiceField
              label={copy.labelFeedbackCategory || "Feedback Category"}
              helper={copy.multiSelectHelper || "Select one or more options. Current selection: {values}"}
              values={form.feedback_category}
              options={FEEDBACK_CATEGORIES}
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

          <div className="fieldReact full"><label>{copy.labelDescription || "Description"}</label><textarea value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} /></div>
          <div className="fieldReact full"><label>{copy.labelAttachments || "Attachments"}</label><input type="file" multiple onChange={(e) => setForm((current) => ({ ...current, files: Array.from(e.target.files || []) }))} /><div className="panel-note">{form.files.length ? `${form.files.length} file(s) selected` : copy.attachmentsHelper || "Upload images, PDFs, or documents."}</div></div>
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
