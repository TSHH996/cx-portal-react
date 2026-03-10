import { buildMultiValueBreakdown, formatMultiValue, hasMultiValue, splitMultiValue } from "../../lib/multiValue";
import { getLocalizedCategory, getLocalizedCity, getLocalizedPriority, getLocalizedSlaStatus, getLocalizedSource, getLocalizedStatus, getLocalizedSubCategory } from "../portal/newTicketConfig";

export function pad(value) {
  return String(value).padStart(2, "0");
}

export function fmtDate(value) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

export function getTicketCity(ticket) {
  const raw = ticket?.raw || {};
  return ticket?.city || raw.city || raw.branch_city || raw.city_name || raw.branch_city_name || "Unspecified";
}

export function matchesTicketSearch(ticket, query) {
  const term = String(query || "").trim().toLowerCase();
  if (!term) return true;

  const raw = ticket?.raw || {};
  const haystack = [
    ticket.id,
    ticket.ticketNo,
    ticket.subject,
    ticket.status,
    ticket.statusLabel,
    ticket.priority,
    ticket.priorityLabel,
    ticket.branch,
    ticket.city,
    ticket.cityLabel,
    ticket.brand,
    ticket.category,
    ticket.categoryLabel,
    ticket.subCategory,
    ticket.subCategoryLabel,
    ticket.source,
    ticket.sourceLabel,
    ticket.customerName,
    ticket.customerPhone,
    ticket.description,
    raw.ticket_no,
    raw.branch_name,
    raw.customer_name,
    raw.customer_phone,
    raw.description,
    raw.feedback_category,
    raw.sub_category,
    raw.feedback_type,
    raw.city,
    raw.branch_city,
    raw.city_name,
    raw.branch_city_name,
  ].filter(Boolean).join(" ").toLowerCase();

  return haystack.includes(term);
}

export function countBy(items, keyGetter, limit = 6) {
  const bucket = {};
  items.forEach((item) => {
    const label = (keyGetter(item) || "Unspecified").toString().trim() || "Unspecified";
    bucket[label] = (bucket[label] || 0) + 1;
  });
  const total = items.length || 1;
  return Object.entries(bucket)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({
      label,
      count,
      pct: Math.round((count / total) * 100),
    }));
}

export function normalizeTicket(row, repliesByTicketId, attachmentsByTicketId, language, branchCityByName = {}) {
  const rowId = row.id || null;
  const createdAt = row.created_at ? new Date(row.created_at).getTime() : Date.now();
  const ticketIdLabel = row.ticket_no !== null && row.ticket_no !== undefined
    ? `#${row.ticket_no}`
    : rowId
      ? `#${String(rowId).slice(0, 8)}`
      : "#--";

  const replies = repliesByTicketId[rowId] || [];
  const latestReply = replies.length ? replies[replies.length - 1] : null;
  const attachments = attachmentsByTicketId[rowId] || [];
  const slaDueAt = row.sla_due_at ? new Date(row.sla_due_at).getTime() : null;
  const categoryValues = splitMultiValue(row.feedback_category || row.category);
  const subCategoryValues = splitMultiValue(row.sub_category);
  const city = row.city || row.branch_city || row.city_name || row.branch_city_name || branchCityByName[row.branch_name] || "Unspecified";
  const status = row.status || "Open";
  const priority = row.priority || "Medium";
  const source = row.feedback_type || row.source || "--";
  const categoryLabels = categoryValues.map((value) => getLocalizedCategory(value, language));
  const subCategoryLabels = subCategoryValues.map((value) => getLocalizedSubCategory(value, language));
  const customerName = row.customer_name === "Test Customer" && language === "ar"
    ? "عميل تجريبي"
    : row.customer_name || "--";
  const description = row.description === "test" && language === "ar"
    ? "نص تجريبي"
    : row.description || "--";
  const now = Date.now();

  let slaComputedStatus = row.sla_status || "pending";
  let slaRemainingText = "--";

  if (slaDueAt) {
    const diffMs = slaDueAt - now;
    if ((slaComputedStatus === "pending" || !slaComputedStatus) && diffMs < 0) slaComputedStatus = "breached";
    const abs = Math.abs(diffMs);
    const h = Math.floor(abs / (1000 * 60 * 60));
    const m = Math.floor((abs % (1000 * 60 * 60)) / (1000 * 60));
    slaRemainingText = diffMs >= 0
      ? language === "ar" ? `متبقي ${h}س ${m}د` : `Remaining ${h}h ${m}m`
      : language === "ar" ? `متأخر ${h}س ${m}د` : `Overdue ${h}h ${m}m`;
  }

  return {
    rowId,
    id: ticketIdLabel,
    subject: `${ticketIdLabel} • ${row.branch_name || "--"}`,
    ticketNo: row.ticket_no ?? null,
    status,
    statusLabel: getLocalizedStatus(status, language),
    priority,
    priorityLabel: getLocalizedPriority(priority, language),
    branch: row.branch_name || "--",
    city,
    cityLabel: getLocalizedCity(city, language),
    brand: row.brand || "--",
    category: formatMultiValue(categoryValues),
    categoryLabel: formatMultiValue(categoryLabels),
    categoryValues,
    categoryLabels,
    subCategory: formatMultiValue(subCategoryValues),
    subCategoryLabel: formatMultiValue(subCategoryLabels),
    subCategoryValues,
    subCategoryLabels,
    source,
    sourceLabel: getLocalizedSource(source, language),
    customerName,
    customerPhone: row.customer_phone || "--",
    createdAt,
    assignedTo: row.assign_to || row.assigned_to || "",
    description,
    branchReply: latestReply?.reply_text || "",
    replyBy: latestReply?.reply_by || "",
    replyAt: latestReply?.created_at ? new Date(latestReply.created_at).getTime() : null,
    rawReplies: replies,
    attachments,
    slaDueAt,
    slaComputedStatus,
    slaComputedStatusLabel: getLocalizedSlaStatus(slaComputedStatus, language),
    slaRemainingText,
    raw: row,
  };
}

export function filterDashboardTickets(tickets, filters) {
  const range = filters.range || "7d";
  const status = filters.status || "all";
  const priority = filters.priority || "all";
  const brand = filters.brand || "all";
  const city = filters.city || "all";
  const search = filters.search || "";
  const query = (filters.branchQuery || "").toLowerCase().trim();
  const now = Date.now();
  let list = [...tickets];

  if (range !== "all") {
    let ms = 0;
    if (range === "24h") ms = 24 * 60 * 60 * 1000;
    if (range === "7d") ms = 7 * 24 * 60 * 60 * 1000;
    if (range === "30d") ms = 30 * 24 * 60 * 60 * 1000;
    if (ms > 0) list = list.filter((ticket) => (ticket.createdAt || 0) >= now - ms);
  }

  if (status !== "all") list = list.filter((ticket) => ticket.status === status);
  if (priority !== "all") list = list.filter((ticket) => ticket.priority === priority);
  if (brand !== "all") list = list.filter((ticket) => ticket.brand === brand);
  if (city !== "all") list = list.filter((ticket) => getTicketCity(ticket) === city);
  if (query) {
    list = list.filter((ticket) => {
      const branch = String(ticket.branch || "").toLowerCase();
      const city = String(getTicketCity(ticket) || "").toLowerCase();
      return branch.includes(query) || city.includes(query);
    });
  }
  if (search) list = list.filter((ticket) => matchesTicketSearch(ticket, search));

  return list;
}

export function buildDashboardMetrics(filteredTickets, language) {
  const now = Date.now();
  const total = filteredTickets.length;
  const open = filteredTickets.filter((ticket) => ticket.status !== "Closed").length;
  const closed = filteredTickets.filter((ticket) => ticket.status === "Closed").length;
  const near = filteredTickets.filter((ticket) => {
    if (ticket.status === "Closed" || !ticket.slaDueAt) return false;
    const diff = ticket.slaDueAt - now;
    return diff >= 0 && diff <= 4 * 60 * 60 * 1000;
  }).length;
  const overdue = filteredTickets.filter((ticket) => {
    if (ticket.status === "Closed") return false;
    return ticket.slaComputedStatus === "breached" || (ticket.slaDueAt && ticket.slaDueAt < now);
  }).length;

  const copy = language === "ar"
    ? {
        total: ["إجمالي التذاكر", `${total} ضمن العرض الحالي`],
        open: ["التذاكر المفتوحة", `${open} غير مغلقة`],
        closed: ["التذاكر المغلقة", `${closed} مغلقة`],
        near: ["قرب انتهاء SLA", `${near} معرضة للتأخير`],
        overdue: ["تذاكر متأخرة", `${overdue} متجاوزة SLA`],
      }
    : {
        total: ["Total Tickets", `${total} in current view`],
        open: ["Open Tickets", `${open} unresolved`],
        closed: ["Closed Tickets", `${closed} completed`],
        near: ["Near SLA Breach", `${near} at risk`],
        overdue: ["Overdue Tickets", `${overdue} breached`],
      };

  return [
    { key: "total", icon: "Σ", label: copy.total[0], value: total, meta: copy.total[1] },
    { key: "open", icon: "📂", label: copy.open[0], value: open, meta: copy.open[1] },
    { key: "closed", icon: "✅", label: copy.closed[0], value: closed, meta: copy.closed[1] },
    { key: "near", icon: "⏱", label: copy.near[0], value: near, meta: copy.near[1] },
    { key: "overdue", icon: "⚠", label: copy.overdue[0], value: overdue, meta: copy.overdue[1] },
  ];
}

export function buildVolumeBars(filteredTickets) {
  const now = new Date();
  const byDay = [];
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const key = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    byDay.push({ key, label: `${pad(date.getMonth() + 1)}/${pad(date.getDate())}`, count: 0 });
  }

  filteredTickets.forEach((ticket) => {
    const date = new Date(ticket.createdAt || 0);
    const key = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    const slot = byDay.find((entry) => entry.key === key);
    if (slot) slot.count += 1;
  });

  const peak = Math.max(1, ...byDay.map((entry) => entry.count));
  return byDay.map((entry, index) => ({
    ...entry,
    height: Math.max(8, Math.round((entry.count / peak) * 100)),
    delay: `${0.04 * (index + 1)}s`,
  }));
}

export function buildOperationalAlerts(filteredTickets, language) {
  const now = Date.now();
  const near = filteredTickets.filter((ticket) => ticket.status !== "Closed" && ticket.slaDueAt && ticket.slaDueAt >= now && ticket.slaDueAt - now <= 4 * 60 * 60 * 1000).length;
  const overdue = filteredTickets.filter((ticket) => ticket.status !== "Closed" && (ticket.slaComputedStatus === "breached" || (ticket.slaDueAt && ticket.slaDueAt < now))).length;
  const highOpen = filteredTickets.filter((ticket) => ticket.priority === "High" && ticket.status !== "Closed").length;
  const missingSla = filteredTickets.filter((ticket) => ticket.status !== "Closed" && !ticket.slaDueAt).length;
  const alerts = [];

  if (overdue > 0) alerts.push({
    cls: "bad",
    title: language === "ar" ? "تذاكر تجاوزت SLA" : "Tickets breached SLA",
    meta: language === "ar" ? `${overdue} تحتاج تصعيد فوري` : `${overdue} require immediate escalation`,
  });
  if (near > 0) alerts.push({
    cls: "warn",
    title: language === "ar" ? "تذاكر قرب انتهاء SLA" : "Tickets near SLA breach",
    meta: language === "ar" ? `${near} معرضة للتأخير` : `${near} are at risk`,
  });
  if (highOpen > 0) alerts.push({
    cls: "warn",
    title: language === "ar" ? "أولوية عالية مفتوحة" : "High priority still open",
    meta: language === "ar" ? `${highOpen} تذكرة بانتظار المعالجة` : `${highOpen} tickets waiting for action`,
  });
  if (missingSla > 0) alerts.push({
    cls: "warn",
    title: language === "ar" ? "تذاكر بدون SLA" : "Tickets missing SLA target",
    meta: language === "ar" ? `${missingSla} تحتاج تحديد موعد SLA` : `${missingSla} need SLA due date`,
  });

  return alerts;
}

export function buildRecentActivity(filteredTickets) {
  const rank = { High: 3, Medium: 2, Low: 1 };
  return [...filteredTickets]
    .filter((ticket) => ticket.status !== "Closed")
    .sort((a, b) => {
      const aRisk = a.slaComputedStatus === "breached" || (a.slaDueAt && a.slaDueAt < Date.now()) ? 1 : 0;
      const bRisk = b.slaComputedStatus === "breached" || (b.slaDueAt && b.slaDueAt < Date.now()) ? 1 : 0;
      if (aRisk !== bRisk) return bRisk - aRisk;
      if (a.priority !== b.priority) return (rank[b.priority] || 0) - (rank[a.priority] || 0);
      return (b.createdAt || 0) - (a.createdAt || 0);
    })
    .slice(0, 8);
}

export function getDashboardCollections(filteredTickets) {
  return {
    source: countBy(filteredTickets, (ticket) => ticket.sourceLabel || ticket.raw?.source || ticket.source),
    brand: countBy(filteredTickets, (ticket) => ticket.brand),
    city: countBy(filteredTickets, (ticket) => ticket.cityLabel || getTicketCity(ticket)),
    feedbackType: countBy(filteredTickets, (ticket) => ticket.sourceLabel || ticket.raw?.feedback_type || ticket.source),
    categories: buildMultiValueBreakdown(filteredTickets, (ticket) => ticket.categoryLabels?.length ? ticket.categoryLabels : ticket.categoryValues).rows,
    branches: countBy(filteredTickets, (ticket) => ticket.branch),
  };
}

export function getInsightPresets(copy) {
  return [
    { key: "mostComplaints", title: copy.insightMostComplaintsTitle, sub: copy.insightMostComplaintsSub },
    { key: "mostComplaintsCity", title: copy.insightMostComplaintsCityTitle, sub: copy.insightMostComplaintsCitySub },
    { key: "foodQuality", title: copy.insightFoodQualityTitle, sub: copy.insightFoodQualitySub },
    { key: "foodQualityCity", title: copy.insightFoodQualityCityTitle, sub: copy.insightFoodQualityCitySub },
    { key: "topCategories", title: copy.insightTopCategoriesTitle, sub: copy.insightTopCategoriesSub },
    { key: "topSource", title: copy.insightTopSourceTitle, sub: copy.insightTopSourceSub },
    { key: "slowestReply", title: copy.insightSlowestReplyTitle, sub: copy.insightSlowestReplySub },
    { key: "nearSla", title: copy.insightNearSlaTitle, sub: copy.insightNearSlaSub },
    { key: "highestOpen", title: copy.insightHighestOpenTitle, sub: copy.insightHighestOpenSub },
    { key: "highestOpenCity", title: copy.insightHighestOpenCityTitle, sub: copy.insightHighestOpenCitySub },
    { key: "biggestIssues", title: copy.insightBiggestIssuesTitle, sub: copy.insightBiggestIssuesSub },
  ];
}

export function getInsightsFilteredTickets(tickets, filters) {
  let list = [...tickets];
  const now = Date.now();

  if (filters.range !== "all") {
    let threshold = 0;
    if (filters.range === "7d") threshold = now - 7 * 86400000;
    if (filters.range === "30d") threshold = now - 30 * 86400000;
    if (filters.range === "90d") threshold = now - 90 * 86400000;
    if (filters.range === "month") {
      const dt = new Date();
      threshold = new Date(dt.getFullYear(), dt.getMonth(), 1).getTime();
    }
    if (threshold) list = list.filter((ticket) => (ticket.createdAt || 0) >= threshold);
  }

  if (filters.branch !== "all") list = list.filter((ticket) => ticket.branch === filters.branch);
  if (filters.brand !== "all") list = list.filter((ticket) => ticket.brand === filters.brand);
  if (filters.city !== "all") list = list.filter((ticket) => getTicketCity(ticket) === filters.city);
  return list;
}

export function getInsightPlainText(result) {
  if (!result?.summary) return "";
  const lines = [];
  if (result.title) lines.push(result.title);
  lines.push(result.summary);
  if (result.meta) lines.push(result.meta);
  (result.metrics || []).forEach((entry) => lines.push(`${entry.label}: ${entry.value}`));
  (result.items || []).forEach((entry) => lines.push(`- ${entry.title}${entry.value ? `: ${entry.value}` : ""}${entry.meta ? ` (${entry.meta})` : ""}`));
  return lines.join("\n");
}

export function insightRowsToCsv(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => `"${String(row[header] ?? "").replace(/"/g, '""')}"`).join(",")),
  ].join("\n");
}

function metric(label, value) {
  return { label, value };
}

function listItem(title, value, meta = "") {
  return { title, value, meta };
}

function getPhoneMatches(tickets, phone) {
  const digits = digitsOnly(phone);
  const tail = digits.slice(-8);
  return tickets
    .filter((ticket) => {
      const ticketDigits = digitsOnly(ticket.customerPhone || ticket.raw?.customer_phone || "");
      return tail && ticketDigits.includes(tail);
    })
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export function buildCustomerLookup(tickets, phone, copy, language) {
  const matches = getPhoneMatches(tickets, phone);
  if (!matches.length) return null;
  const latest = matches[0];
  const categoryCounts = buildMultiValueBreakdown(matches, (ticket) => ticket.categoryLabels?.length ? ticket.categoryLabels : ticket.categoryValues, 5).rows;
  const repeated = matches.length > 1;
  return {
    mode: "lookup",
    phone,
    title: copy.lookupTitle,
    summary: language === "ar"
      ? `العميل لديه ${matches.length} تذكرة مسجلة، وآخر شكوى كانت في ${latest.branch}.`
      : `This customer has ${matches.length} recorded ticket(s), and the latest complaint was linked to ${latest.branch}.`,
    metrics: [
      metric(copy.metricTotalTickets, matches.length),
      metric(copy.metricOpenTickets, matches.filter((ticket) => ticket.status !== "Closed").length),
      metric(copy.metricClosedTickets, matches.filter((ticket) => ticket.status === "Closed").length),
      metric(copy.metricLastComplaint, fmtDate(latest.createdAt)),
      metric(copy.metricLastBranch, latest.branch || "--"),
      metric(copy.metricRepeatStatus, repeated ? copy.repeatedYes : copy.repeatedNo),
    ],
    items: [
      listItem(copy.metricTopCategory, categoryCounts[0]?.label || "--", language === "ar"
        ? `الأكثر تكرارًا بعدد ${categoryCounts[0]?.count || 0} تذكرة`
        : `Most repeated across ${categoryCounts[0]?.count || 0} ticket(s)`),
      ...matches.slice(0, 5).map((ticket) => listItem(`${ticket.id} — ${ticket.branch}`, ticket.statusLabel || ticket.status, `${ticket.categoryLabel || ticket.category} • ${fmtDate(ticket.createdAt)}`)),
    ],
    exportRows: matches.map((ticket) => ({
      Ticket: ticket.id,
      Branch: ticket.branch,
      Brand: ticket.brand,
      Status: ticket.statusLabel || ticket.status,
      Category: ticket.categoryLabel || ticket.category,
      Source: ticket.sourceLabel || ticket.source,
      Created: fmtDate(ticket.createdAt),
    })),
  };
}

export function buildInsightResult(key, tickets, repliesByTicketId, copy, language) {
  const makeMostComplaints = (category = "") => {
    const relevant = tickets.filter((ticket) => !category || hasMultiValue(ticket.categoryValues, category));
    const top = countBy(relevant, (ticket) => ticket.branch, 5);
    const leader = top[0];
    const categoryLabel = category ? getLocalizedCategory(category, language) : "";
    return {
      mode: "preset",
      activeKey: category ? "foodQuality" : "mostComplaints",
      title: category ? copy.insightFoodQualityTitle : copy.insightMostComplaintsTitle,
      summary: leader
        ? language === "ar"
          ? `${leader.label} يتصدر بعدد ${leader.count} تذكرة${categoryLabel ? ` ضمن ${categoryLabel}` : ""}.`
          : `${leader.label} leads with ${leader.count} ticket(s)${category ? ` in ${category}` : ""}.`
        : language === "ar" ? "لا توجد بيانات كافية حاليًا." : "Not enough live data right now.",
      metrics: [
        metric(copy.metricBranches, top.length),
        metric(copy.metricTotalTickets, relevant.length),
        metric(copy.metricOpenTickets, relevant.filter((ticket) => ticket.status !== "Closed").length),
      ],
      items: top.map((row) => listItem(row.label, row.count, language === "ar" ? "إجمالي التذاكر" : "Total tickets")),
      exportRows: top.map((row) => ({ Branch: row.label, Tickets: row.count, Category: categoryLabel || category || "All" })),
    };
  };

  const makeTopCities = (category = "") => {
    const relevant = tickets.filter((ticket) => !category || hasMultiValue(ticket.categoryValues, category));
    const top = countBy(relevant, (ticket) => ticket.cityLabel || getTicketCity(ticket), 5);
    const leader = top[0];
    const categoryLabel = category ? getLocalizedCategory(category, language) : "";
    return {
      mode: "preset",
      activeKey: category ? "foodQualityCity" : "mostComplaintsCity",
      title: category ? copy.insightFoodQualityCityTitle : copy.insightMostComplaintsCityTitle,
      summary: leader
        ? language === "ar"
          ? `${leader.label} هي الأعلى بعدد ${leader.count} تذكرة${categoryLabel ? ` ضمن ${categoryLabel}` : ""}.`
          : `${leader.label} leads with ${leader.count} ticket(s)${category ? ` in ${category}` : ""}.`
        : language === "ar" ? "لا توجد بيانات مدن كافية حاليًا." : "Not enough city data is available right now.",
      metrics: [
        metric(copy.metricCities, top.length),
        metric(copy.metricTotalTickets, relevant.length),
        metric(copy.metricOpenTickets, relevant.filter((ticket) => ticket.status !== "Closed").length),
      ],
      items: top.map((row) => listItem(row.label, row.count, language === "ar" ? "إجمالي التذاكر" : "Total tickets")),
      exportRows: top.map((row) => ({ City: row.label, Tickets: row.count, Category: categoryLabel || category || "All" })),
    };
  };

  if (key === "mostComplaints") return makeMostComplaints();
  if (key === "mostComplaintsCity") return makeTopCities();
  if (key === "foodQuality") return makeMostComplaints("Food Quality");
  if (key === "foodQualityCity") return makeTopCities("Food Quality");
  if (key === "topCategories") {
    const top = buildMultiValueBreakdown(tickets, (ticket) => ticket.categoryValues, 5).rows;
    return {
      mode: "preset",
      activeKey: key,
      title: copy.insightTopCategoriesTitle,
      summary: top[0]
        ? language === "ar"
          ? `${top[0].label} هو الأعلى حاليًا بعدد ${top[0].count} تذكرة.`
          : `${top[0].label} is the leading complaint category with ${top[0].count} ticket(s).`
        : language === "ar" ? "لا توجد فئات متاحة بعد." : "No category data is available yet.",
      metrics: [metric(copy.metricTotalTickets, tickets.length), metric(copy.metricTopCategory, top[0]?.label || "--")],
      items: top.map((row) => listItem(row.label, row.count, language === "ar" ? "تذكرة" : "tickets")),
      exportRows: top.map((row) => ({ Category: row.label, Tickets: row.count })),
    };
  }

  if (key === "topSource") {
    const top = countBy(tickets, (ticket) => ticket.sourceLabel || ticket.source, 5);
    return {
      mode: "preset",
      activeKey: key,
      title: copy.insightTopSourceTitle,
      summary: top[0]
        ? language === "ar"
          ? `${top[0].label} هو المصدر الأعلى للشكاوى بعدد ${top[0].count} تذكرة.`
          : `${top[0].label} is the highest complaint source with ${top[0].count} ticket(s).`
        : language === "ar" ? "لا توجد بيانات مصادر بعد." : "No source data is available yet.",
      metrics: [metric(copy.metricSource, top[0]?.label || "--"), metric(copy.metricTotalTickets, tickets.length)],
      items: top.map((row) => listItem(row.label, row.count, language === "ar" ? "تذكرة" : "tickets")),
      exportRows: top.map((row) => ({ Source: row.label, Tickets: row.count })),
    };
  }

  if (key === "slowestReply") {
    const branchRows = countBy(tickets, (ticket) => ticket.branch, 50)
      .map((row) => {
        const branchTickets = tickets.filter((ticket) => ticket.branch === row.label);
        const hours = branchTickets
          .map((ticket) => {
            const reply = (repliesByTicketId[ticket.rowId] || [])[0];
            if (!reply?.created_at || !ticket.createdAt) return null;
            return Math.max(0, (new Date(reply.created_at).getTime() - ticket.createdAt) / 3600000);
          })
          .filter((value) => value !== null);
        const avg = hours.length ? hours.reduce((sum, value) => sum + value, 0) / hours.length : null;
        return { branch: row.label, avg, tickets: branchTickets.length };
      })
      .filter((row) => row.avg !== null)
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 5);

    return {
      mode: "preset",
      activeKey: key,
      title: copy.insightSlowestReplyTitle,
      summary: branchRows[0]
        ? language === "ar"
          ? `${branchRows[0].branch} هو الأبطأ حاليًا بمتوسط أول رد ${branchRows[0].avg.toFixed(1)} ساعة.`
          : `${branchRows[0].branch} is currently the slowest with an average first reply of ${branchRows[0].avg.toFixed(1)}h.`
        : language === "ar" ? "لا توجد ردود كافية لحساب سرعة أول رد." : "There are not enough reply records to calculate first-reply speed.",
      metrics: [metric(copy.metricAvgReply, branchRows[0] ? `${branchRows[0].avg.toFixed(1)}h` : "--")],
      items: branchRows.map((row) => listItem(row.branch, `${row.avg.toFixed(1)}h`, language === "ar" ? `${row.tickets} تذكرة` : `${row.tickets} tickets`)),
      exportRows: branchRows.map((row) => ({ Branch: row.branch, AvgFirstReplyHours: row.avg.toFixed(1), Tickets: row.tickets })),
    };
  }

  if (key === "nearSla") {
    const now = Date.now();
    const near = tickets.filter((ticket) => ticket.status !== "Closed" && ticket.slaDueAt && ticket.slaDueAt >= now && ticket.slaDueAt - now <= 4 * 60 * 60 * 1000);
    const overdue = tickets.filter((ticket) => ticket.status !== "Closed" && (ticket.slaComputedStatus === "breached" || (ticket.slaDueAt && ticket.slaDueAt < now)));
    return {
      mode: "preset",
      activeKey: key,
      title: copy.insightNearSlaTitle,
      summary: language === "ar"
        ? `يوجد ${near.length} تذكرة قريبة من تجاوز SLA و${overdue.length} تذكرة متأخرة حاليًا.`
        : `There are ${near.length} ticket(s) near SLA breach and ${overdue.length} overdue ticket(s) right now.`,
      metrics: [metric(copy.metricNearSla, near.length), metric(copy.metricOverdue, overdue.length)],
      items: near.slice(0, 5).map((ticket) => listItem(`${ticket.id} — ${ticket.branch}`, ticket.priorityLabel || ticket.priority, `${ticket.statusLabel || ticket.status} • ${ticket.slaRemainingText}`)),
      exportRows: [...near, ...overdue].slice(0, 20).map((ticket) => ({
        Ticket: ticket.id,
        Branch: ticket.branch,
        Priority: ticket.priorityLabel || ticket.priority,
        Status: ticket.statusLabel || ticket.status,
        Sla: ticket.slaRemainingText,
        SlaStatus: ticket.slaComputedStatusLabel || ticket.slaComputedStatus,
      })),
    };
  }

  if (key === "highestOpen") {
    const open = tickets.filter((ticket) => ticket.status !== "Closed");
    const top = countBy(open, (ticket) => ticket.branch, 5);
    return {
      mode: "preset",
      activeKey: key,
      title: copy.insightHighestOpenTitle,
      summary: top[0]
        ? language === "ar"
          ? `${top[0].label} لديه أعلى رصيد مفتوح بعدد ${top[0].count} تذكرة.`
          : `${top[0].label} has the highest open backlog with ${top[0].count} ticket(s).`
        : language === "ar" ? "لا توجد تذاكر مفتوحة حاليًا." : "There are no open tickets right now.",
      metrics: [metric(copy.metricOpenTickets, open.length), metric(copy.metricBranches, top.length)],
      items: top.map((row) => listItem(row.label, row.count, language === "ar" ? "تذاكر مفتوحة" : "open tickets")),
      exportRows: top.map((row) => ({ Branch: row.label, OpenTickets: row.count })),
    };
  }

  if (key === "highestOpenCity") {
    const open = tickets.filter((ticket) => ticket.status !== "Closed");
    const top = countBy(open, (ticket) => ticket.cityLabel || getTicketCity(ticket), 5);
    return {
      mode: "preset",
      activeKey: key,
      title: copy.insightHighestOpenCityTitle,
      summary: top[0]
        ? language === "ar"
          ? `${top[0].label} لديها أعلى رصيد مفتوح بعدد ${top[0].count} تذكرة.`
          : `${top[0].label} has the highest open backlog with ${top[0].count} ticket(s).`
        : language === "ar" ? "لا توجد تذاكر مفتوحة على مستوى المدن حاليًا." : "There are no open city backlogs right now.",
      metrics: [metric(copy.metricOpenTickets, open.length), metric(copy.metricCities, top.length)],
      items: top.map((row) => listItem(row.label, row.count, language === "ar" ? "تذاكر مفتوحة" : "open tickets")),
      exportRows: top.map((row) => ({ City: row.label, OpenTickets: row.count })),
    };
  }

  const open = tickets.filter((ticket) => ticket.status !== "Closed");
  const overdue = open.filter((ticket) => ticket.slaComputedStatus === "breached" || (ticket.slaDueAt && ticket.slaDueAt < Date.now()));
  const high = open.filter((ticket) => ticket.priority === "High");
  const topCategory = buildMultiValueBreakdown(open, (ticket) => ticket.categoryValues, 3).rows;
  const topBranch = countBy(open, (ticket) => ticket.branch, 3);
    const topSource = countBy(open, (ticket) => ticket.sourceLabel || ticket.source, 3);

  return {
    mode: "preset",
    activeKey: "biggestIssues",
    title: copy.insightBiggestIssuesTitle,
    summary: language === "ar"
      ? `المشهد الحالي يتركز في ${overdue.length} تذكرة متأخرة، ${high.length} تذكرة عالية، وتصاعد في ${topCategory[0]?.label || "--"}.`
      : `The current picture centers on ${overdue.length} overdue ticket(s), ${high.length} high-priority open ticket(s), and elevated pressure in ${topCategory[0]?.label || "--"}.`,
    metrics: [
      metric(copy.metricOverdue, overdue.length),
      metric(copy.metricOpenTickets, open.length),
      metric(copy.metricTopCategory, topCategory[0]?.label || "--"),
    ],
    items: [
      ...topCategory.map((row) => listItem(row.label, row.count, language === "ar" ? "أعلى تصنيف مفتوح" : "top open category")),
      ...topBranch.slice(0, 1).map((row) => listItem(row.label, row.count, language === "ar" ? "أعلى فرع مفتوح" : "highest open branch")),
      ...topSource.slice(0, 1).map((row) => listItem(row.label, row.count, language === "ar" ? "أعلى مصدر حالي" : "highest active source")),
    ],
    exportRows: open.slice(0, 20).map((ticket) => ({
      Ticket: ticket.id,
      Branch: ticket.branch,
      Brand: ticket.brand,
      Category: ticket.categoryLabel || ticket.category,
      Source: ticket.sourceLabel || ticket.source,
      Priority: ticket.priorityLabel || ticket.priority,
      Status: ticket.statusLabel || ticket.status,
      SlaStatus: ticket.slaComputedStatusLabel || ticket.slaComputedStatus,
    })),
  };
}
