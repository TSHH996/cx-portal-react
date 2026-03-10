import { fmtDate, matchesTicketSearch } from "../dashboard/dashboardUtils";

export function filterTickets(tickets, filters) {
  const query = (filters.search || "").toLowerCase().trim();
  const status = filters.status || "all";
  const priority = filters.priority || "all";
  const branch = filters.branch || "all";

  return tickets.filter((ticket) => {
    if (!matchesTicketSearch(ticket, query)) return false;
    if (status !== "all" && ticket.status !== status) return false;
    if (priority !== "all" && ticket.priority !== priority) return false;
    if (branch !== "all" && ticket.branch !== branch) return false;
    return true;
  });
}

export function ticketInfoRows(ticket, labels) {
  if (!ticket) return [];
  return [
    [labels.ticket, ticket.id],
    [labels.status, ticket.statusLabel || ticket.status],
    [labels.priority, ticket.priorityLabel || ticket.priority],
    [labels.branch, ticket.branch],
    [labels.city, ticket.cityLabel || ticket.city || "--"],
    [labels.brand, ticket.brand],
    [labels.source, ticket.sourceLabel || ticket.source],
    [labels.category, ticket.categoryLabels?.length ? ticket.categoryLabels : ticket.categoryValues?.length ? ticket.categoryValues : ticket.categoryLabel || ticket.category],
    [labels.subCategory, ticket.subCategoryLabels?.length ? ticket.subCategoryLabels : ticket.subCategoryValues?.length ? ticket.subCategoryValues : ticket.subCategoryLabel || ticket.subCategory],
    [labels.customer, ticket.customerName],
    [labels.phone, ticket.customerPhone],
    [labels.assigned, ticket.assignedTo || "--"],
    [labels.created, fmtDate(ticket.createdAt)],
    [labels.complaintAt, fmtDate(ticket.complaintAt)],
    [labels.sla, ticket.slaRemainingText || "--"],
    [labels.slaStatus, ticket.slaComputedStatusLabel || ticket.slaComputedStatus || "pending"],
  ];
}

function buildResolutionSummary(ticket, copy) {
  const rows = [
    [copy.resolutionActionTypeLabel, ticket.resolutionActionType],
    [copy.resolutionContactStatusLabel, ticket.customerContactStatus],
    [copy.resolutionSatisfiedLabel, ticket.customerSatisfied],
    [copy.resolutionDateLabel, ticket.resolutionDate ? fmtDate(ticket.resolutionDate) : ""],
    [copy.resolutionHandledByLabel, ticket.resolutionHandledBy],
  ].filter(([, value]) => value);

  return rows.map(([label, value]) => `${label}: ${value}`).join("\n");
}

export function buildTimeline(ticket, copy) {
  if (!ticket) return [];
  const rows = [{ t: copy.createdTimeline, d: `${copy.loadedFromDb}\n${copy.complaintDateTimeLabel}: ${fmtDate(ticket.complaintAt)}`, m: `${copy.timelineTimestampLabel}: ${fmtDate(ticket.createdAt)}` }];
  const replies = ticket.rawReplies || [];
  let hasResolutionEntry = false;
  replies.forEach((reply) => {
    const timestamp = `${copy.timelineTimestampLabel}: ${fmtDate(reply.created_at)}`;

    if (reply.reply_by === "Customer Resolution") {
      hasResolutionEntry = true;
      const details = [reply.action_taken, reply.reply_text].filter(Boolean).join("\n\n");
      rows.push({ t: copy.customerResolutionTitle, d: details || copy.resolutionEmpty, m: timestamp });
      return;
    }

    rows.push({ t: copy.replyByBranchTimeline, d: reply.reply_text || "--", m: timestamp });
    if (reply.action_taken && reply.action_taken !== "Branch reply updated") rows.push({ t: copy.actionTakenTimeline, d: reply.action_taken, m: timestamp });
  });

  if (ticket.resolutionUpdatedAt && !hasResolutionEntry) {
    rows.push({
      t: copy.customerResolutionTitle,
      d: [buildResolutionSummary(ticket, copy), ticket.resolutionDetails].filter(Boolean).join("\n\n") || copy.resolutionEmpty,
      m: `${copy.timelineTimestampLabel}: ${fmtDate(ticket.resolutionUpdatedAt)}`,
    });
  }
  return rows;
}

export function statusBadgeClass(status) {
  if (status === "Replied") return "good";
  if (status === "In Progress") return "warn";
  if (status === "Open") return "warn";
  if (status === "Closed") return "good";
  return "";
}

export function priorityBadgeClass(priority) {
  if (priority === "High") return "bad";
  if (priority === "Medium") return "warn";
  return "good";
}
