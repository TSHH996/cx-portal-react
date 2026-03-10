export const MULTI_VALUE_SEPARATOR = " | ";

function cleanValue(value) {
  const next = String(value ?? "").trim();
  return next && next !== "--" ? next : "";
}

export function splitMultiValue(value) {
  const source = Array.isArray(value)
    ? value
    : String(value ?? "").split(/\s*\|\s*/g);

  const unique = [];
  source.forEach((entry) => {
    const next = cleanValue(entry);
    if (next && !unique.includes(next)) unique.push(next);
  });
  return unique;
}

export function joinMultiValue(value) {
  return splitMultiValue(value).join(MULTI_VALUE_SEPARATOR);
}

export function formatMultiValue(value, fallback = "--") {
  const entries = splitMultiValue(value);
  return entries.length ? entries.join(MULTI_VALUE_SEPARATOR) : fallback;
}

export function hasMultiValue(value, expected) {
  return splitMultiValue(value).includes(expected);
}

export function getUniqueMultiValues(items, getValue) {
  const unique = new Set();
  items.forEach((item) => {
    splitMultiValue(getValue(item)).forEach((entry) => unique.add(entry));
  });
  return [...unique].sort();
}

export function buildMultiValueBreakdown(items, getValue, limit = Infinity) {
  const counts = {};
  let total = 0;

  items.forEach((item) => {
    splitMultiValue(getValue(item)).forEach((entry) => {
      counts[entry] = (counts[entry] || 0) + 1;
      total += 1;
    });
  });

  const rows = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({
      label,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
    }));

  return { total, rows };
}

export function buildMultiValuePairs(items, getValue, limit = Infinity) {
  const { total, rows } = buildMultiValueBreakdown(items, getValue, limit);
  return {
    total,
    rows: rows.map(({ label, count }) => [label, count]),
  };
}
