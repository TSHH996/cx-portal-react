import { fmtDate } from "../dashboard/dashboardUtils";

export function filterTickets(tickets, filters) {
  const query = (filters.search || "").toLowerCase().trim();
  const status = filters.status || "all";
  const priority = filters.priority || "all";
  const branchQuery = (filters.branch || "").toLowerCase().trim();

  return tickets.filter((ticket) => {
    const hay = `${ticket.id} ${ticket.subject || ""} ${ticket.branch} ${ticket.customerName} ${ticket.customerPhone} ${ticket.category} ${ticket.source} ${ticket.description}`.toLowerCase();
    if (query && !hay.includes(query)) return false;
    if (status !== "all" && ticket.status !== status) return false;
    if (priority !== "all" && ticket.priority !== priority) return false;
    if (branchQuery && !String(ticket.branch || "").toLowerCase().includes(branchQuery)) return false;
    return true;
  });
}

export function ticketInfoRows(ticket, labels) {
  if (!ticket) return [];
  return [
    [labels.ticket, ticket.id],
    [labels.status, ticket.status],
    [labels.priority, ticket.priority],
    [labels.branch, ticket.branch],
    [labels.brand, ticket.brand],
    [labels.source, ticket.source],
    [labels.category, ticket.category],
    [labels.subCategory, ticket.subCategory],
    [labels.customer, ticket.customerName],
    [labels.phone, ticket.customerPhone],
    [labels.assigned, ticket.assignedTo || "--"],
    [labels.created, fmtDate(ticket.createdAt)],
    [labels.sla, ticket.slaRemainingText || "--"],
    [labels.slaStatus, ticket.slaComputedStatus || "pending"],
  ];
}

export function buildTimeline(ticket, copy) {
  if (!ticket) return [];
  const rows = [{ t: copy.createdTimeline, d: copy.loadedFromDb, m: fmtDate(ticket.createdAt) }];
  const replies = ticket.rawReplies || [];
  replies.forEach((reply) => {
    rows.push({ t: copy.replyByBranchTimeline, d: reply.reply_text || "--", m: fmtDate(reply.created_at) });
    if (reply.action_taken) rows.push({ t: copy.actionTakenTimeline, d: reply.action_taken, m: fmtDate(reply.created_at) });
  });
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
