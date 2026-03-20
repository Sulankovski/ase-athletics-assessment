import MandatoryFieldsNote from '@/components/MandatoryFieldsNote';
import { REPORT_RATING_EDIT_ROWS } from '@/utils/reportEdit';

const fieldGridClass = 'grid grid-cols-1 sm:grid-cols-2 gap-3 tablet:gap-4';

/**
 * Scout report form for PUT (edit) or POST (create).
 * Draft shape: `cloneReportForEdit` / `cloneEmptyReportForCreate`.
 * @param {'card' | 'plain'} [variant='card'] — `plain` = fields only (e.g. inside a modal shell).
 */
export default function ReportEditAddPanel({ mode = 'edit', draft, setDraft, variant = 'card' }) {
  const isCreate = mode === 'create';
  const idPrefix = isCreate ? 'report-create' : 'report-edit';
  const isPlain = variant === 'plain';

  const setTop = (key, value) => setDraft((d) => (d ? { ...d, [key]: value } : d));
  const setMatch = (key, value) =>
    setDraft((d) => (d ? { ...d, matchDetails: { ...d.matchDetails, [key]: value } } : d));
  const setRating = (key, value) =>
    setDraft((d) => (d ? { ...d, ratings: { ...d.ratings, [key]: value } } : d));

  if (!draft) return null;

  const formBody = (
    <div
      className={`space-y-8 ${isPlain ? '' : 'bg-white p-4 tablet:p-6 max-h-[min(70vh,720px)] overflow-y-auto'}`}
    >
      <MandatoryFieldsNote className="mb-2" />
      <div className={fieldGridClass}>
        <div className="sm:col-span-2">
          <label
            htmlFor={`${idPrefix}-scout`}
            className="block text-xs font-medium text-neutral-gray700 mb-1"
          >
            Scout name <span className="text-red-600">*</span>
          </label>
          <input
            id={`${idPrefix}-scout`}
            type="text"
            value={draft.scoutName ?? ''}
            onChange={(e) => setTop('scoutName', e.target.value)}
            className="input py-2 text-sm w-full"
            autoComplete="off"
          />
        </div>
        <div>
          <label
            htmlFor={`${idPrefix}-date`}
            className="block text-xs font-medium text-neutral-gray700 mb-1"
          >
            Date (YYYY-MM-DD){' '}
          </label>
          <input
            id={`${idPrefix}-date`}
            type="date"
            value={draft.date ?? ''}
            onChange={(e) => setTop('date', e.target.value)}
            className="input py-2 text-sm w-full"
          />
        </div>
        <div>
          {isCreate ? (
            <>
              <label
                htmlFor={`${idPrefix}-player`}
                className="block text-xs font-medium text-neutral-gray700 mb-1"
              >
                Player name
              </label>
              <input
                id={`${idPrefix}-player`}
                type="text"
                value={draft.playerName ?? ''}
                onChange={(e) => setTop('playerName', e.target.value)}
                className="input py-2 text-sm w-full"
                autoComplete="off"
              />
            </>
          ) : (
            <>
              <p className="text-xs font-medium text-neutral-gray500 mb-1">Player (read-only)</p>
              <p className="text-sm font-semibold text-neutral-gray900">{draft.playerName || '—'}</p>
            </>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-primary-700 mb-1">Match</h3>
        <div className={fieldGridClass}>
          {[
            ['opponent', 'Opponent'],
            ['competition', 'Competition'],
            ['result', 'Result'],
            ['minutesPlayed', 'Minutes played'],
            ['position', 'Position'],
          ].map(([key, label]) => (
            <div key={key} className={key === 'position' ? 'sm:col-span-2' : ''}>
              <label
                htmlFor={`${idPrefix}-m-${key}`}
                className="block text-xs font-medium text-neutral-gray600 mb-1"
              >
                {label} <span className="text-red-600">*</span>
              </label>
              <input
                id={`${idPrefix}-m-${key}`}
                type="text"
                inputMode={key === 'minutesPlayed' ? 'numeric' : undefined}
                value={draft.matchDetails?.[key] ?? ''}
                onChange={(e) => setMatch(key, e.target.value)}
                className="input py-2 text-sm w-full"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-primary-700 mb-3">
          Ratings (0–10)
        </h3>
        <div className={fieldGridClass}>
          {REPORT_RATING_EDIT_ROWS.map(([key, label]) => (
            <div key={key}>
              <label
                htmlFor={`${idPrefix}-r-${key}`}
                className="block text-xs font-medium text-neutral-gray600 mb-1"
              >
                {label}
              </label>
              <input
                id={`${idPrefix}-r-${key}`}
                type="number"
                min={0}
                max={10}
                step={1}
                value={draft.ratings?.[key] ?? ''}
                onChange={(e) => setRating(key, e.target.value)}
                className="input py-2 text-sm w-full"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-primary-700 mb-3">
          Strengths, weaknesses &amp; key moments
        </h3>
       <div className="grid grid-cols-1 gap-4">
          <div>
            <label
              htmlFor={`${idPrefix}-strengths`}
              className="block text-xs font-medium text-neutral-gray600 mb-1"
            >
              Strengths
            </label>
            <textarea
              id={`${idPrefix}-strengths`}
              value={draft.strengthsText ?? ''}
              onChange={(e) => setTop('strengthsText', e.target.value)}
              className="input py-2 text-sm w-full min-h-[88px] resize-y"
            />
          </div>
          <div>
            <label
              htmlFor={`${idPrefix}-weaknesses`}
              className="block text-xs font-medium text-neutral-gray600 mb-1"
            >
              Weaknesses
            </label>
            <textarea
              id={`${idPrefix}-weaknesses`}
              value={draft.weaknessesText ?? ''}
              onChange={(e) => setTop('weaknessesText', e.target.value)}
              className="input py-2 text-sm w-full min-h-[88px] resize-y"
            />
          </div>
          <div>
            <label
              htmlFor={`${idPrefix}-moments`}
              className="block text-xs font-medium text-neutral-gray600 mb-1"
            >
              Key moments
            </label>
            <textarea
              id={`${idPrefix}-moments`}
              value={draft.keyMomentsText ?? ''}
              onChange={(e) => setTop('keyMomentsText', e.target.value)}
              className="input py-2 text-sm w-full min-h-[88px] resize-y"
            />
          </div>
        </div>
      </div>

      <div className={fieldGridClass}>
        <div>
          <label
            htmlFor={`${idPrefix}-overall`}
            className="block text-xs font-medium text-neutral-gray700 mb-1"
          >
            Overall (0–10)
          </label>
          <input
            id={`${idPrefix}-overall`}
            type="number"
            min={0}
            max={10}
            step={1}
            value={draft.overallRating ?? ''}
            onChange={(e) => setTop('overallRating', e.target.value)}
            className="input py-2 text-sm w-full"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor={`${idPrefix}-rec`}
          className="block text-xs font-medium text-neutral-gray700 mb-1"
        >
          Recommendation
        </label>
        <textarea
          id={`${idPrefix}-rec`}
          value={draft.recommendation ?? ''}
          onChange={(e) => setTop('recommendation', e.target.value)}
          className="input py-2 text-sm w-full min-h-[80px] resize-y"
        />
      </div>

      <div>
        <label
          htmlFor={`${idPrefix}-notes`}
          className="block text-xs font-medium text-neutral-gray700 mb-1"
        >
          Notes
        </label>
        <textarea
          id={`${idPrefix}-notes`}
          value={draft.notes ?? ''}
          onChange={(e) => setTop('notes', e.target.value)}
          className="input py-2 text-sm w-full min-h-[72px] resize-y"
        />
      </div>
    </div>
  );

  if (isPlain) return formBody;

  return (
    <div className="rounded-lg overflow-hidden shadow-md border border-primary-800/25">
      <div className="bg-gradient-to-br from-primary-700 to-primary-900 px-4 py-2.5 tablet:py-3">
        <p className="text-[11px] tablet:text-xs font-bold uppercase tracking-wider text-white/90">
          {isCreate ? 'Add scout report' : 'Edit scout report'}
        </p>
      </div>
      {formBody}
    </div>
  );
}
