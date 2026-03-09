import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppShell } from "../../contexts/AppShellContext";
import { useToast } from "../../contexts/ToastContext";
import { BRANDS, computeSlaDueAt, FEEDBACK_CATEGORIES, FEEDBACK_TYPES, PRIORITIES, STATUSES, SUB_CATEGORIES } from "../../features/portal/newTicketConfig";
import { usePortalData } from "../../features/portal/usePortalData";

function initialForm(copy) {
  return {
    customer_name: copy.customerNameDefault || "Test Customer",
    customer_phone: copy.customerPhoneDefault || "0500000000",
    branch_name: "",
    brand: "",
    priority: "Medium",
    status: "Open",
    feedback_type: "WhatsApp",
    feedback_category: "",
    sub_category: "",
    description: copy.descriptionDefault || "test",
    files: [],
  };
}

function NewTicketModal() {
  const { copy, language, isNewTicketOpen, closeNewTicket } = useAppShell();
  const { branches, createTicket } = usePortalData(language);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm(copy));
  const [busy, setBusy] = useState(false);

  const subCategoryOptions = useMemo(() => SUB_CATEGORIES[form.feedback_category] || [], [form.feedback_category]);

  if (!isNewTicketOpen) return null;

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
        feedback_category: form.feedback_category.trim(),
        sub_category: form.sub_category.trim(),
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

          <div className="fieldReact full"><label>{copy.labelFeedbackType || "Feedback Type"}</label><select value={form.feedback_type} onChange={(e) => setForm((current) => ({ ...current, feedback_type: e.target.value }))}>{FEEDBACK_TYPES.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>

          <div className="grid2React">
            <div className="fieldReact"><label>{copy.labelFeedbackCategory || "Feedback Category"}</label><select value={form.feedback_category} onChange={(e) => setForm((current) => ({ ...current, feedback_category: e.target.value, sub_category: "" }))}><option value="">Select category</option>{FEEDBACK_CATEGORIES.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
            <div className="fieldReact"><label>{copy.labelSubCategory || "Sub Category"}</label><select value={form.sub_category} onChange={(e) => setForm((current) => ({ ...current, sub_category: e.target.value }))}><option value="">{form.feedback_category ? "Select sub category" : "Select category first"}</option>{subCategoryOptions.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
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
