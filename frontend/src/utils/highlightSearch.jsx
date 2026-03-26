/**
 * Renders text with case-insensitive occurrences of query wrapped in <mark> (for search result emphasis).
 */
export function highlightText(text, query) {
  const raw = text == null || text === '' ? '—' : String(text);
  const q = String(query ?? '').trim();
  if (!q) return raw;

  const lower = raw.toLowerCase();
  const qLower = q.toLowerCase();
  if (!lower.includes(qLower)) return raw;

  const parts = [];
  let start = 0;
  let key = 0;
  let idx = 0;
  while ((idx = lower.indexOf(qLower, start)) !== -1) {
    if (idx > start) parts.push(raw.slice(start, idx));
    parts.push(
      <mark
        key={`hl-${key++}`}
        className="rounded-sm bg-amber-200/90 px-0.5 font-inherit text-inherit"
      >
        {raw.slice(idx, idx + q.length)}
      </mark>,
    );
    start = idx + q.length;
  }
  if (start < raw.length) parts.push(raw.slice(start));
  return parts.length === 1 ? parts[0] : <>{parts}</>;
}
