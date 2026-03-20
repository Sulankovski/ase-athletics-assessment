import { formatAge, formatMarketValue, formatSalary, formatShortDate } from '@/utils/format';

export function formatPdfStat(key, raw) {
  if (raw == null || raw === '') return '—';
  if (key === 'pass_accuracy') {
    const n = Number(raw);
    if (!Number.isFinite(n)) return '—';
    return `${n.toFixed(1)}%`;
  }
  if (typeof raw === 'number') {
    if (!Number.isFinite(raw)) return '—';
    if (Number.isInteger(raw)) return raw.toLocaleString();
    return raw.toLocaleString(undefined, { maximumFractionDigits: 1 });
  }
  const asNum = Number(raw);
  if (typeof raw === 'string' && raw.trim() !== '' && Number.isFinite(asNum)) {
    if (Number.isInteger(asNum)) return asNum.toLocaleString();
    return asNum.toLocaleString(undefined, { maximumFractionDigits: 1 });
  }
  return String(raw);
}

export function formatPdfAttr(raw) {
  if (raw == null || raw === '') return '—';
  const n = Number(raw);
  if (!Number.isFinite(n)) return '—';
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export function formatPdfPlayerBasics(player) {
  return [
    ['Name', player?.name ?? '—'],
    ['Team', player?.team ?? '—'],
    ['Position', player?.position ?? '—'],
    ['Age', formatAge(player?.age)],
    ['Jersey number', player?.jersey_number != null ? String(player.jersey_number) : '—'],
    ['Preferred foot', player?.preferred_foot ?? '—'],
    ['Height (cm)', player?.height != null ? String(player.height) : '—'],
    ['Weight (kg)', player?.weight != null ? String(player.weight) : '—'],
    ['Market value', formatMarketValue(player?.market_value)],
  ];
}

export function formatPdfContract(player) {
  const c = player?.contract ?? {};
  return [
    ['Annual salary', formatSalary(c.salary)],
    ['Contract end', formatShortDate(c.contract_end)],
  ];
}
