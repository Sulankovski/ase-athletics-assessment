/** Labels for ratings table + form (order matches backend). */
export const REPORT_RATING_EDIT_ROWS = [
  ['technical', 'Technical'],
  ['physical', 'Physical'],
  ['mental', 'Mental'],
  ['tactical', 'Tactical'],
  ['finishing', 'Finishing'],
  ['passing', 'Passing'],
  ['dribbling', 'Dribbling'],
  ['defending', 'Defending'],
  ['leadership', 'Leadership'],
  ['workRate', 'Work rate'],
];

export const REPORT_RATING_KEYS = REPORT_RATING_EDIT_ROWS.map(([k]) => k);

function toInputString(v) {
  if (v == null || v === '') return '';
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : '';
  return String(v).trim();
}

function formatDateForInput(raw) {
  if (raw == null || raw === '') return '';
  const s = String(raw);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  try {
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  } catch {
    /* ignore */
  }
  return '';
}

/** Local calendar date as YYYY-MM-DD (avoids UTC skew vs `toISOString().slice(0, 10)`). */
export function todayLocalISODate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function normalizeReportDateString(raw) {
  const s = String(raw ?? '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return '';
}

function arrayToLines(arr) {
  if (!Array.isArray(arr)) return '';
  return arr.map((s) => String(s ?? '').trim()).filter(Boolean).join('\n');
}

function linesToArray(text) {
  return String(text ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

function emptyRatingsDraft() {
  return Object.fromEntries(REPORT_RATING_KEYS.map((k) => [k, '']));
}

/** API report row → form draft (strings for inputs). */
export function cloneReportForEdit(report) {
  const m = report?.matchDetails ?? {};
  const r = report?.ratings ?? {};
  return {
    scoutName: toInputString(report?.scoutName),
    date: formatDateForInput(report?.date),
    playerName: toInputString(report?.playerName),
    matchDetails: {
      opponent: toInputString(m.opponent),
      competition: toInputString(m.competition),
      result: toInputString(m.result),
      minutesPlayed:
        m.minutesPlayed != null && m.minutesPlayed !== '' ? String(m.minutesPlayed) : '',
      position: toInputString(m.position),
    },
    ratings: { ...emptyRatingsDraft(), ...Object.fromEntries(
      REPORT_RATING_KEYS.map((k) => [k, r[k] != null && r[k] !== '' ? String(r[k]) : '']),
    ) },
    strengthsText: arrayToLines(report?.strengths),
    weaknessesText: arrayToLines(report?.weaknesses),
    keyMomentsText: arrayToLines(report?.keyMoments),
    overallRating:
      report?.overallRating != null && report?.overallRating !== ''
        ? String(report.overallRating)
        : '',
    recommendation: toInputString(report?.recommendation),
    notes: toInputString(report?.notes),
  };
}

/** Empty draft for POST /players/:id/reports — pair with `buildReportCreatePayload`. */
export function cloneEmptyReportForCreate(defaultPlayerName = '') {
  return {
    scoutName: '',
    date: todayLocalISODate(),
    playerName: toInputString(defaultPlayerName),
    matchDetails: {
      opponent: '',
      competition: '',
      result: '',
      minutesPlayed: '',
      position: '',
    },
    ratings: emptyRatingsDraft(),
    strengthsText: '',
    weaknessesText: '',
    keyMomentsText: '',
    overallRating: '',
    recommendation: '',
    notes: '',
  };
}

export function areReportMatchFieldsComplete(draft) {
  const m = draft?.matchDetails ?? {};
  const opponent = String(m.opponent ?? '').trim();
  const competition = String(m.competition ?? '').trim();
  const result = String(m.result ?? '').trim();
  const position = String(m.position ?? '').trim();
  const minRaw = m.minutesPlayed;
  if (!opponent || !competition || !result || !position) return false;
  if (minRaw === '' || minRaw == null) return false;
  const minStr = String(minRaw).trim();
  if (!/^\d+$/.test(minStr)) return false;
  const n = parseInt(minStr, 10);
  return Number.isFinite(n) && n >= 0;
}

/** Create or edit: scout + match block (date optional; defaults to today in payload / server). */
export function isReportCreateDraftValid(draft) {
  if (!draft) return false;
  const scout = String(draft.scoutName ?? '').trim();
  if (scout === '') return false;
  return areReportMatchFieldsComplete(draft);
}

export const isReportDraftValidForSave = isReportCreateDraftValid;

/**
 * Full camelCase body for PUT /players/:id/reports/:reportId
 * (sends all sections so the backend can apply a broad update).
 */
export function buildReportUpdatePayload(draft) {
  const md = draft.matchDetails ?? {};
  const minutesRaw = md.minutesPlayed;
  let minutesPlayed;
  const minutesParsed = parseInt(String(minutesRaw ?? '').trim(), 10);
  if (minutesRaw !== '' && minutesRaw != null && Number.isFinite(minutesParsed) && minutesParsed >= 0) {
    minutesPlayed = minutesParsed;
  }

  const matchDetails = {
    opponent: String(md.opponent ?? '').trim(),
    competition: String(md.competition ?? '').trim(),
    result: String(md.result ?? '').trim(),
    position: String(md.position ?? '').trim(),
  };
  if (minutesPlayed !== undefined) matchDetails.minutesPlayed = minutesPlayed;

  const ratings = {};
  for (const key of REPORT_RATING_KEYS) {
    const raw = draft.ratings?.[key];
    if (raw === '' || raw == null) continue;
    const n = parseInt(String(raw).trim(), 10);
    if (Number.isFinite(n) && n >= 0 && n <= 10) ratings[key] = n;
  }

  const overallRaw = draft.overallRating;
  let overallRating;
  if (overallRaw !== '' && overallRaw != null) {
    const n = parseInt(String(overallRaw).trim(), 10);
    if (Number.isFinite(n) && n >= 0 && n <= 10) overallRating = n;
  }

  const payload = {
    scoutName: String(draft.scoutName ?? '').trim(),
    date: normalizeReportDateString(draft.date) || todayLocalISODate(),
    playerName: String(draft.playerName ?? '').trim(),
    matchDetails,
    ratings,
    strengths: linesToArray(draft.strengthsText),
    weaknesses: linesToArray(draft.weaknessesText),
    keyMoments: linesToArray(draft.keyMomentsText),
    recommendation: String(draft.recommendation ?? '').trim(),
    notes: String(draft.notes ?? '').trim(),
  };
  if (overallRating !== undefined) payload.overallRating = overallRating;
  return payload;
}

/** Same JSON shape as update; backend create enforces scoutName + date. */
export function buildReportCreatePayload(draft) {
  return buildReportUpdatePayload(draft);
}
