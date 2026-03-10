import { fmtDate, getTicketCity, matchesTicketSearch, pad } from "../dashboard/dashboardUtils";
import { buildMultiValueBreakdown, formatMultiValue, getUniqueMultiValues, hasMultiValue } from "../../lib/multiValue";
import { CITIES, FEEDBACK_CATEGORIES, FEEDBACK_TYPES, getLocalizedPriority, getLocalizedStatus } from "../portal/newTicketConfig";

export const REPORT_TABS = ["executive", "period", "sla", "branch", "brand", "source", "category", "aging", "trend", "export"];

export const DEFAULT_REPORT_FILTERS = { dateFrom: "", dateTo: "", brand: "all", branch: "all", city: "all", status: "all", source: "all", priority: "all", slaStatus: "all", category: "all" };

export function getReportTickets(tickets, filters) {
  return (tickets || []).filter((ticket) => {
    if (filters.brand !== "all" && ticket.brand !== filters.brand) return false;
    if (filters.branch !== "all" && ticket.branch !== filters.branch) return false;
    if (filters.city !== "all" && getTicketCity(ticket) !== filters.city) return false;
    if (filters.status !== "all" && ticket.status !== filters.status) return false;
    if (filters.source !== "all" && ticket.source !== filters.source) return false;
    if (filters.priority !== "all" && ticket.priority !== filters.priority) return false;
    if (filters.slaStatus !== "all" && ticket.slaComputedStatus !== filters.slaStatus) return false;
    if (filters.category !== "all" && !hasMultiValue(ticket.categoryValues, filters.category)) return false;
    if (filters.dateFrom && ticket.createdAt < new Date(filters.dateFrom).getTime()) return false;
    if (filters.dateTo && ticket.createdAt > new Date(filters.dateTo).getTime() + 86400000) return false;
    if (!matchesTicketSearch(ticket, filters.search)) return false;
    return true;
  });
}

export function rptCountBy(tickets, keyFn) {
  const counts = {};
  tickets.forEach((ticket) => {
    const key = keyFn(ticket);
    if (key && key !== "--") counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

function rptCountByMulti(tickets, keyFn, limit = Infinity) {
  const { rows } = buildMultiValueBreakdown(tickets, keyFn, limit);
  return rows.map(({ label, count }) => [label, count]);
}

function rptMultiBreakdown(tickets, keyFn, limit = Infinity) {
  const { total, rows } = buildMultiValueBreakdown(tickets, keyFn, limit);
  return {
    total,
    rows: rows.map(({ label, count }) => [label, count]),
  };
}

function getReportsText(language) {
  if (language === "ar") {
    return {
      totalTickets: "إجمالي التذاكر",
      openTickets: "التذاكر المفتوحة",
      closedTickets: "التذاكر المغلقة",
      highPriority: "أولوية عالية",
      slaCompliance: "الالتزام بـ SLA",
      nearSla: "قريبة من تجاوز SLA",
      slaBreached: "متجاوزة SLA",
      topCategory: "أعلى تصنيف",
      topBranch: "أعلى فرع",
      topSource: "أعلى مصدر",
      allTicketsInScope: "إجمالي التذاكر ضمن النطاق",
      inProgressCount: "قيد المعالجة",
      repliedCount: "تم الرد عليها",
      withinSla: "ضمن SLA",
      urgentAttention: "تحتاج متابعة عاجلة",
      atRiskTickets: "تذاكر معرضة للتجاوز",
      exceededSla: "تذاكر تجاوزت SLA",
      highestVolume: "أعلى حجم للشكاوى",
      highestAffectedBranch: "الفرع الأكثر تأثرًا",
      highestInboundChannel: "أعلى قناة استقبال",
      totalComplaints: "إجمالي الشكاوى",
      openActive: "المفتوحة / النشطة",
      closed: "مغلقة",
      highPriorityCount: "أولوية عالية",
      withinSlaPending: "ضمن SLA / قيد المتابعة",
      atRiskApproaching: "معرضة للتجاوز",
      under24h: "أقل من 24 ساعة",
      oneToThreeDays: "من يوم إلى 3 أيام",
      threeToSevenDays: "من 3 إلى 7 أيام",
      over7Days: "أكثر من 7 أيام",
      weekOf: "أسبوع",
    };
  }

  return {
    totalTickets: "Total Tickets",
    openTickets: "Open Tickets",
    closedTickets: "Closed Tickets",
    highPriority: "High Priority",
    slaCompliance: "SLA Compliance",
    nearSla: "Near SLA Breach",
    slaBreached: "SLA Breached",
    topCategory: "Top Category",
    topBranch: "Top Branch",
    topSource: "Top Source",
    allTicketsInScope: "All tickets in scope",
    inProgressCount: "in progress",
    repliedCount: "replied",
    withinSla: "within SLA",
    urgentAttention: "Requires urgent attention",
    atRiskTickets: "At-risk tickets",
    exceededSla: "Exceeded SLA deadline",
    highestVolume: "Highest complaint volume",
    highestAffectedBranch: "Most affected branch",
    highestInboundChannel: "Highest inbound channel",
    totalComplaints: "Total Complaints",
    openActive: "Open / Active",
    closed: "Closed",
    highPriorityCount: "High Priority",
    withinSlaPending: "Within SLA / Pending",
    atRiskApproaching: "At Risk (approaching)",
    under24h: "Under 24 hours",
    oneToThreeDays: "1 - 3 days",
    threeToSevenDays: "3 - 7 days",
    over7Days: "Over 7 days",
    weekOf: "Week of",
  };
}

function topKey(tickets, keyFn) {
  const sorted = rptCountBy(tickets, keyFn);
  return sorted[0] ? `${sorted[0][0]} (${sorted[0][1]})` : "--";
}

function periodTickets(tickets, daysAgo, windowDays) {
  const now = Date.now();
  const end = now - daysAgo * 86400000;
  const start = end - windowDays * 86400000;
  return tickets.filter((ticket) => ticket.createdAt >= start && ticket.createdAt < end);
}

export function rptTicketToRow(ticket) {
  return {
    "Ticket No": ticket.ticketNo ?? "",
    Status: ticket.statusLabel ?? ticket.status ?? "",
    Priority: ticket.priorityLabel ?? ticket.priority ?? "",
    Branch: ticket.branch ?? "",
    City: ticket.cityLabel ?? getTicketCity(ticket),
    Brand: ticket.brand ?? "",
    Category: ticket.categoryLabel ?? formatMultiValue(ticket.categoryValues || ticket.category, ""),
    "Sub Category": ticket.subCategoryLabel ?? formatMultiValue(ticket.subCategoryValues || ticket.subCategory, ""),
    Source: ticket.sourceLabel ?? ticket.source ?? "",
    Customer: ticket.customerName ?? "",
    Phone: ticket.customerPhone ?? "",
    "SLA Status": ticket.slaComputedStatusLabel ?? ticket.slaComputedStatus ?? "",
    Created: fmtDate(ticket.createdAt),
    Description: (ticket.description || "").replace(/\n/g, " "),
    "Branch Reply": (ticket.branchReply || "").replace(/\n/g, " "),
  };
}

export function downloadCsv(rows, filename) {
  if (!rows?.length) return false;
  const headers = Object.keys(rows[0]);
  const csvRows = [headers.join(","), ...rows.map((row) => headers.map((header) => `"${String(row[header] ?? "").replace(/"/g, '""')}"`).join(","))];
  const blob = new Blob(["\uFEFF" + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}

export function getReportOptions(tickets, branches) {
  const branchCityByName = Object.fromEntries((branches || []).map((branch) => [branch.branch_name, branch.city || ""]));
  return {
    brands: [...new Set((tickets || []).map((ticket) => ticket.brand).filter(Boolean).filter((value) => value !== "--"))].sort(),
    branches: (branches || []).map((branch) => branch.branch_name).filter(Boolean),
    branchCityByName,
    cities: [...new Set([...CITIES, ...(tickets || []).map((ticket) => getTicketCity(ticket)).filter(Boolean).filter((value) => value !== "Unspecified")])],
    sources: FEEDBACK_TYPES,
    categories: FEEDBACK_CATEGORIES,
  };
}

export function buildExecutiveSection(tickets, language = "en") {
  const text = getReportsText(language);
  const total = tickets.length;
  const open = tickets.filter((ticket) => ticket.status === "Open").length;
  const inProgress = tickets.filter((ticket) => ticket.status === "In Progress").length;
  const replied = tickets.filter((ticket) => ticket.status === "Replied").length;
  const closed = tickets.filter((ticket) => ticket.status === "Closed").length;
  const high = tickets.filter((ticket) => ticket.priority === "High").length;
  const breached = tickets.filter((ticket) => ticket.slaComputedStatus === "breached").length;
  const atRisk = tickets.filter((ticket) => ticket.slaComputedStatus === "at_risk").length;
  const slaOk = tickets.filter((ticket) => ["pending", "on_track"].includes(ticket.slaComputedStatus)).length;
  const slaCompliance = total > 0 ? Math.round((slaOk / total) * 100) : 0;
  const topCategories = rptCountByMulti(tickets, (ticket) => ticket.categoryLabels?.length ? ticket.categoryLabels : ticket.categoryValues, 1);
  const topCities = rptCountBy(tickets, (ticket) => {
    const city = ticket.cityLabel || getTicketCity(ticket);
    return city && city !== "Unspecified" ? city : null;
  }).slice(0, 6);

  return {
    total,
    metricsPrimary: [
      { label: text.totalTickets, value: total, sub: text.allTicketsInScope },
      { label: text.openTickets, value: open, sub: `${inProgress} ${text.inProgressCount}`, tone: "warn" },
      { label: text.closedTickets, value: closed, sub: `${replied} ${text.repliedCount}`, tone: "good" },
      { label: text.slaCompliance, value: `${slaCompliance}%`, sub: `${slaOk} ${text.withinSla}`, tone: slaCompliance >= 80 ? "good" : slaCompliance >= 60 ? "warn" : "bad" },
      { label: text.highPriority, value: high, sub: text.urgentAttention, tone: high > 0 ? "bad" : "good" },
    ],
    metricsSecondary: [
      { label: text.nearSla, value: atRisk, sub: text.atRiskTickets, tone: atRisk > 0 ? "warn" : "good" },
      { label: text.slaBreached, value: breached, sub: text.exceededSla, tone: breached > 0 ? "bad" : "good" },
      { label: text.topCategory, value: topCategories[0] ? `${topCategories[0][0]} (${topCategories[0][1]})` : "--", sub: text.highestVolume },
      { label: text.topBranch, value: topKey(tickets, (ticket) => ticket.branch && ticket.branch !== "--" ? ticket.branch : null), sub: text.highestAffectedBranch },
      { label: text.topSource, value: topKey(tickets, (ticket) => (ticket.sourceLabel && ticket.sourceLabel !== "--" ? ticket.sourceLabel : ticket.source) || null), sub: text.highestInboundChannel },
    ],
    statusRows: [[getLocalizedStatus("Open", language), open], [getLocalizedStatus("In Progress", language), inProgress], [getLocalizedStatus("Replied", language), replied], [getLocalizedStatus("Closed", language), closed]].filter((row) => row[1] > 0),
    cityRows: topCities,
    priorityRows: rptCountBy(tickets, (ticket) => ticket.priorityLabel || getLocalizedPriority(ticket.priority, language)).filter(([key]) => key && key !== "--"),
  };
}

export function buildPeriodSection(allTickets, language = "en") {
  const text = getReportsText(language);
  const thisWeek = periodTickets(allTickets, 0, 7);
  const lastWeek = periodTickets(allTickets, 7, 7);
  const thisMonth = periodTickets(allTickets, 0, 30);
  const lastMonth = periodTickets(allTickets, 30, 30);
  const statRows = (current, previous) => {
    const open = (rows) => rows.filter((ticket) => ticket.status === "Open" || ticket.status === "In Progress").length;
    const closed = (rows) => rows.filter((ticket) => ticket.status === "Closed").length;
    const breached = (rows) => rows.filter((ticket) => ticket.slaComputedStatus === "breached").length;
    const high = (rows) => rows.filter((ticket) => ticket.priority === "High").length;
    return [[text.totalComplaints, current.length, previous.length], [text.openActive, open(current), open(previous)], [text.closed, closed(current), closed(previous)], [text.slaBreached, breached(current), breached(previous)], [text.highPriorityCount, high(current), high(previous)]];
  };
  return {
    weekRows: statRows(thisWeek, lastWeek),
    monthRows: statRows(thisMonth, lastMonth),
    thisWeekCategories: rptCountByMulti(thisWeek, (ticket) => ticket.categoryLabels?.length ? ticket.categoryLabels : ticket.categoryValues, 6),
    lastWeekCategories: rptCountByMulti(lastWeek, (ticket) => ticket.categoryLabels?.length ? ticket.categoryLabels : ticket.categoryValues, 6),
    thisWeekCount: thisWeek.length,
    lastWeekCount: lastWeek.length,
  };
}

export function buildSlaSection(tickets, language = "en") {
  const text = getReportsText(language);
  const total = tickets.length;
  const pending = tickets.filter((ticket) => ticket.slaComputedStatus === "pending").length;
  const onTrack = tickets.filter((ticket) => ticket.slaComputedStatus === "on_track").length;
  const atRisk = tickets.filter((ticket) => ticket.slaComputedStatus === "at_risk").length;
  const breached = tickets.filter((ticket) => ticket.slaComputedStatus === "breached").length;
  const compliance = total > 0 ? Math.round(((pending + onTrack) / total) * 100) : 0;
  const branchSla = {};
  const brandSla = {};
  tickets.forEach((ticket) => {
    const branch = ticket.branch && ticket.branch !== "--" ? ticket.branch : null;
    const brand = ticket.brand && ticket.brand !== "--" ? ticket.brand : null;
    if (branch) {
      if (!branchSla[branch]) branchSla[branch] = { total: 0, breached: 0, atRisk: 0 };
      branchSla[branch].total += 1;
      if (ticket.slaComputedStatus === "breached") branchSla[branch].breached += 1;
      if (ticket.slaComputedStatus === "at_risk") branchSla[branch].atRisk += 1;
    }
    if (brand) {
      if (!brandSla[brand]) brandSla[brand] = { total: 0, breached: 0 };
      brandSla[brand].total += 1;
      if (ticket.slaComputedStatus === "breached") brandSla[brand].breached += 1;
    }
  });
  return {
    total,
    compliance,
    statusRows: [
      { label: text.withinSlaPending, count: pending + onTrack, pct: total > 0 ? (((pending + onTrack) / total) * 100).toFixed(1) : 0, color: "#22c55e" },
      { label: text.atRiskApproaching, count: atRisk, pct: total > 0 ? ((atRisk / total) * 100).toFixed(1) : 0, color: "#f59e0b" },
      { label: text.slaBreached, count: breached, pct: total > 0 ? ((breached / total) * 100).toFixed(1) : 0, color: "#ef4444" },
    ],
    branchRows: Object.entries(branchSla).sort((a, b) => b[1].breached - a[1].breached).slice(0, 10).map(([branch, row]) => ({ branch, total: row.total, breached: row.breached, atRisk: row.atRisk, compliance: row.total > 0 ? Math.round(((row.total - row.breached) / row.total) * 100) : 100 })),
    brandRows: Object.entries(brandSla).sort((a, b) => b[1].total - a[1].total).slice(0, 8).map(([brand, row]) => ({ brand, total: row.total, breached: row.breached, compliance: row.total > 0 ? Math.round(((row.total - row.breached) / row.total) * 100) : 100 })),
  };
}

export function buildBranchSection(tickets) {
  const branchMap = {};
  tickets.forEach((ticket) => {
    const branch = ticket.branch && ticket.branch !== "--" ? ticket.branch : null;
    if (!branch) return;
    if (!branchMap[branch]) branchMap[branch] = { total: 0, open: 0, inProgress: 0, closed: 0, breached: 0, categories: {} };
    const row = branchMap[branch];
    row.total += 1;
    if (ticket.status === "Open") row.open += 1;
    if (ticket.status === "In Progress") row.inProgress += 1;
    if (ticket.status === "Closed") row.closed += 1;
    if (ticket.slaComputedStatus === "breached") row.breached += 1;
    (ticket.categoryLabels?.length ? ticket.categoryLabels : ticket.categoryValues || []).forEach((category) => {
      row.categories[category] = (row.categories[category] || 0) + 1;
    });
  });
  return {
    breakdown: rptCountBy(tickets, (ticket) => ticket.branch && ticket.branch !== "--" ? ticket.branch : null).slice(0, 10),
    rows: Object.entries(branchMap).sort((a, b) => b[1].total - a[1].total).slice(0, 15).map(([branch, row]) => ({ branch, total: row.total, active: row.open + row.inProgress, closed: row.closed, breached: row.breached, topCategory: Object.entries(row.categories).sort((a, b) => b[1] - a[1])[0]?.[0] || "--" })),
  };
}

export function buildBrandSection(tickets) {
  const brandMap = {};
  tickets.forEach((ticket) => {
    const brand = ticket.brand && ticket.brand !== "--" ? ticket.brand : null;
    if (!brand) return;
    if (!brandMap[brand]) brandMap[brand] = { total: 0, open: 0, closed: 0, breached: 0, categories: {} };
    const row = brandMap[brand];
    row.total += 1;
    if (ticket.status === "Open" || ticket.status === "In Progress") row.open += 1;
    if (ticket.status === "Closed") row.closed += 1;
    if (ticket.slaComputedStatus === "breached") row.breached += 1;
    (ticket.categoryLabels?.length ? ticket.categoryLabels : ticket.categoryValues || []).forEach((category) => {
      row.categories[category] = (row.categories[category] || 0) + 1;
    });
  });
  return {
    breakdown: rptCountBy(tickets, (ticket) => ticket.brand && ticket.brand !== "--" ? ticket.brand : null),
    rows: Object.entries(brandMap).sort((a, b) => b[1].total - a[1].total).map(([brand, row]) => ({ brand, total: row.total, open: row.open, closed: row.closed, breached: row.breached, compliance: row.total > 0 ? Math.round(((row.total - row.breached) / row.total) * 100) : 100, topIssue: Object.entries(row.categories).sort((a, b) => b[1] - a[1])[0]?.[0] || "--" })),
  };
}

export function buildSourceSection(tickets) {
  const sources = rptCountBy(tickets, (ticket) => ticket.sourceLabel && ticket.sourceLabel !== "--" ? ticket.sourceLabel : ticket.source || null);
  return {
    total: tickets.length,
    sources,
    topCards: sources.slice(0, 3).map(([source, count]) => {
      const rows = tickets.filter((ticket) => (ticket.sourceLabel || ticket.source) === source);
      const categoryBreakdown = rptMultiBreakdown(rows, (ticket) => ticket.categoryLabels?.length ? ticket.categoryLabels : ticket.categoryValues, 5);
      return {
        source,
        count,
        pct: tickets.length > 0 ? ((count / tickets.length) * 100).toFixed(1) : 0,
        categoryTotal: categoryBreakdown.total || count,
        categories: categoryBreakdown.rows,
      };
    }),
  };
}

export function buildCategorySection(tickets) {
  const mainBreakdown = rptMultiBreakdown(tickets, (ticket) => ticket.categoryLabels?.length ? ticket.categoryLabels : ticket.categoryValues);
  const subBreakdown = rptMultiBreakdown(tickets, (ticket) => ticket.subCategoryLabels?.length ? ticket.subCategoryLabels : ticket.subCategoryValues, 10);
  const mainCategories = mainBreakdown.rows;
  return {
    total: mainBreakdown.total || tickets.length,
    mainCategories,
    subCategories: subBreakdown.rows,
    priorityRows: mainCategories.slice(0, 5).map(([category, total]) => {
      const rows = tickets.filter((ticket) => hasMultiValue(ticket.categoryLabels?.length ? ticket.categoryLabels : ticket.categoryValues, category));
      return { category, total, high: rows.filter((ticket) => ticket.priority === "High").length, medium: rows.filter((ticket) => ticket.priority === "Medium").length, low: rows.filter((ticket) => ticket.priority === "Low").length };
    }),
  };
}

export function buildAgingSection(tickets, language = "en") {
  const text = getReportsText(language);
  const now = Date.now();
  const activeTickets = tickets.filter((ticket) => ticket.status === "Open" || ticket.status === "In Progress");
  const ageHours = (ticket) => (now - ticket.createdAt) / 3600000;
  const bucket = (ticket, min, max) => ageHours(ticket) >= min && (max === Infinity || ageHours(ticket) < max);
  return {
    activeCount: activeTickets.length,
    buckets: [
      { label: text.under24h, count: activeTickets.filter((ticket) => bucket(ticket, 0, 24)).length, tone: "ok" },
      { label: text.oneToThreeDays, count: activeTickets.filter((ticket) => bucket(ticket, 24, 72)).length, tone: "mild" },
      { label: text.threeToSevenDays, count: activeTickets.filter((ticket) => bucket(ticket, 72, 168)).length, tone: "warn" },
      { label: text.over7Days, count: activeTickets.filter((ticket) => bucket(ticket, 168, Infinity)).length, tone: "bad" },
    ],
    oldestRows: [...activeTickets].sort((a, b) => a.createdAt - b.createdAt).slice(0, 10).map((ticket) => {
      const hours = Math.floor(ageHours(ticket));
      const days = Math.floor(hours / 24);
      const age = days > 0
        ? language === "ar" ? `${days}ي ${hours % 24}س` : `${days}d ${hours % 24}h`
        : language === "ar" ? `${hours}س` : `${hours}h`;
      return { ticket: ticket.id, branch: ticket.branch, priority: ticket.priorityLabel || ticket.priority, age, category: ticket.categoryLabel && ticket.categoryLabel !== "--" ? ticket.categoryLabel : ticket.category && ticket.category !== "--" ? ticket.category : "--" };
    }),
    byBranch: rptCountBy(activeTickets, (ticket) => ticket.branch && ticket.branch !== "--" ? ticket.branch : null).slice(0, 8),
    byCategory: rptCountByMulti(activeTickets, (ticket) => ticket.categoryLabels?.length ? ticket.categoryLabels : ticket.categoryValues, 8),
  };
}

export function buildTrendSection(tickets, language = "en") {
  const text = getReportsText(language);
  const now = Date.now();
  const days = 21;
  const bars = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const start = now - (i + 1) * 86400000;
    const end = now - i * 86400000;
    const count = tickets.filter((ticket) => ticket.createdAt >= start && ticket.createdAt < end).length;
    const date = new Date(start);
    bars.push({ label: `${pad(date.getMonth() + 1)}/${pad(date.getDate())}`, count });
  }
  const maxCount = Math.max(...bars.map((entry) => entry.count), 1);
  const weeklyRows = [];
  for (let week = 0; week < 4; week += 1) {
    const start = now - (week + 1) * 7 * 86400000;
    const end = now - week * 7 * 86400000;
    const rows = tickets.filter((ticket) => ticket.createdAt >= start && ticket.createdAt < end);
    const date = new Date(start);
    weeklyRows.unshift({ week: `${text.weekOf} ${pad(date.getMonth() + 1)}/${pad(date.getDate())}`, complaints: rows.length, breached: rows.filter((ticket) => ticket.slaComputedStatus === "breached").length });
  }
  const thisWeekTickets = tickets.filter((ticket) => ticket.createdAt >= now - 7 * 86400000);
  const lastWeekTickets = tickets.filter((ticket) => ticket.createdAt >= now - 14 * 86400000 && ticket.createdAt < now - 7 * 86400000);
  const current = {};
  const previous = {};
  thisWeekTickets.forEach((ticket) => {
    (ticket.categoryLabels?.length ? ticket.categoryLabels : ticket.categoryValues || []).forEach((category) => {
      current[category] = (current[category] || 0) + 1;
    });
  });
  lastWeekTickets.forEach((ticket) => {
    (ticket.categoryLabels?.length ? ticket.categoryLabels : ticket.categoryValues || []).forEach((category) => {
      previous[category] = (previous[category] || 0) + 1;
    });
  });
  return {
    days,
    bars: bars.map((entry) => ({ ...entry, height: Math.max(4, Math.round((entry.count / maxCount) * 100)) })),
    weeklyRows,
    risers: Object.entries(current).map(([category, count]) => ({ category, current: count, previous: previous[category] || 0, delta: count - (previous[category] || 0) })).filter((row) => row.delta > 0).sort((a, b) => b.delta - a.delta).slice(0, 5),
    thisWeekCount: thisWeekTickets.length,
    topSources: rptCountBy(thisWeekTickets, (ticket) => ticket.sourceLabel && ticket.sourceLabel !== "--" ? ticket.sourceLabel : ticket.source || null).slice(0, 6),
    topBranches: rptCountBy(thisWeekTickets, (ticket) => ticket.branch && ticket.branch !== "--" ? ticket.branch : null).slice(0, 6),
  };
}

export function buildExportBundles(allTickets, filteredTickets) {
  const all = allTickets.map(rptTicketToRow);
  const open = allTickets.filter((ticket) => ticket.status === "Open" || ticket.status === "In Progress").map(rptTicketToRow);
  const breached = allTickets.filter((ticket) => ticket.slaComputedStatus === "breached").map(rptTicketToRow);
  const high = allTickets.filter((ticket) => ticket.priority === "High").map(rptTicketToRow);
  const filtered = filteredTickets.map(rptTicketToRow);
  const slaSummary = {};
  const branchReport = {};
  const brandReport = {};
  const categoryReport = {};
  allTickets.forEach((ticket) => {
    const branch = ticket.branch && ticket.branch !== "--" ? ticket.branch : null;
    const brand = ticket.brand && ticket.brand !== "--" ? ticket.brand : null;
    if (branch) {
      if (!slaSummary[branch]) slaSummary[branch] = { Branch: branch, Total: 0, Breached: 0, AtRisk: 0, "SLA Compliance %": "100%" };
      if (!branchReport[branch]) branchReport[branch] = { Branch: branch, Total: 0, Open: 0, Closed: 0, Breached: 0 };
      slaSummary[branch].Total += 1;
      branchReport[branch].Total += 1;
      if (ticket.slaComputedStatus === "breached") { slaSummary[branch].Breached += 1; branchReport[branch].Breached += 1; }
      if (ticket.slaComputedStatus === "at_risk") slaSummary[branch].AtRisk += 1;
      if (ticket.status === "Open" || ticket.status === "In Progress") branchReport[branch].Open += 1;
      if (ticket.status === "Closed") branchReport[branch].Closed += 1;
    }
    if (brand) {
      if (!brandReport[brand]) brandReport[brand] = { Brand: brand, Total: 0, Open: 0, Closed: 0, Breached: 0 };
      brandReport[brand].Total += 1;
      if (ticket.status === "Open" || ticket.status === "In Progress") brandReport[brand].Open += 1;
      if (ticket.status === "Closed") brandReport[brand].Closed += 1;
      if (ticket.slaComputedStatus === "breached") brandReport[brand].Breached += 1;
    }
    (ticket.categoryLabels?.length ? ticket.categoryLabels : ticket.categoryValues || []).forEach((category) => {
      if (!categoryReport[category]) categoryReport[category] = { Category: category, Total: 0, High: 0, Medium: 0, Low: 0 };
      categoryReport[category].Total += 1;
      if (ticket.priority === "High") categoryReport[category].High += 1;
      if (ticket.priority === "Medium") categoryReport[category].Medium += 1;
      if (ticket.priority === "Low") categoryReport[category].Low += 1;
    });
  });
  Object.values(slaSummary).forEach((row) => { row["SLA Compliance %"] = row.Total > 0 ? `${Math.round(((row.Total - row.Breached) / row.Total) * 100)}%` : "100%"; });
  return { all, open, breached, high, filtered, slaSummary: Object.values(slaSummary), branchReport: Object.values(branchReport), brandReport: Object.values(brandReport), categoryReport: Object.values(categoryReport) };
}
