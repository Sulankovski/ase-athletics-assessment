/**
 * Compare-page radar helpers. Stats mix incompatible units (goals vs minutes); we scale each axis
 * by the max value among compared players so every axis reads 0–100 on the chart.
 * Attributes are already 0–100 in the data model; max is still capped at 100 for the denominator.
 */

export function computeStatMaxes(players, keys) {
  const out = {};
  for (const key of keys) {
    let m = 0;
    for (const p of players) {
      const v = p?.stats?.[key];
      const n = Number(v);
      if (Number.isFinite(n) && n > m) m = n;
    }
    out[key] = m > 0 ? m : 1;
  }
  return out;
}

export function computeAttrMaxes(players, keys) {
  const out = {};
  for (const key of keys) {
    let m = 0;
    for (const p of players) {
      const v = p?.attributes?.[key];
      const n = Number(v);
      if (Number.isFinite(n) && n > m) m = n;
    }
    out[key] = Math.max(m, 1, 100);
  }
  return out;
}

/** Map raw stat/attr to 0–100 for Chart.js radial scale (100 = best in current comparison set). */
export function normalizeRadarValue(raw, max) {
  if (raw == null || raw === '') return 0;
  const n = Number(raw);
  if (!Number.isFinite(n)) return 0;
  const denom = max > 0 ? max : 1;
  return (n / denom) * 100;
}

export function formatStatTooltip(key, raw) {
  if (raw == null || raw === '' || !Number.isFinite(Number(raw))) return '—';
  const n = Number(raw);
  if (key === 'pass_accuracy') return `${n.toFixed(1)}%`;
  if (Number.isInteger(n)) return n.toLocaleString();
  return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

export function formatAttrTooltip(raw) {
  if (raw == null || raw === '' || !Number.isFinite(Number(raw))) return '—';
  const n = Number(raw);
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}
