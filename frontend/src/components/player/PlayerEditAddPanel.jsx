import {
  PLAYER_EDIT_FIELDS,
  STAT_EDIT_KEYS,
  STAT_EDIT_LABELS,
  ATTR_EDIT_KEYS,
  ATTR_EDIT_LABELS,
} from '@/utils/playerEdit';

function fieldGridClass(keysLength) {
  return keysLength > 12
    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 tablet:gap-4'
    : 'grid grid-cols-1 sm:grid-cols-2 gap-3 tablet:gap-4';
}

/**
 * Player form: `mode="edit"` (profile) or `mode="create"` (POST /players).
 * Draft shape matches `clonePlayerForEdit` / `cloneEmptyPlayerForCreate`.
 */
export default function PlayerEditAddPanel({ mode = 'edit', draft, setDraft }) {
  const isCreate = mode === 'create';
  const idPrefix = isCreate ? 'create' : 'edit';

  const setPlayerField = (key, value) => {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  };

  const setStat = (key, value) => {
    setDraft((d) =>
      d ? { ...d, stats: { ...d.stats, [key]: value } } : d,
    );
  };

  const setAttr = (key, value) => {
    setDraft((d) =>
      d ? { ...d, attributes: { ...d.attributes, [key]: value } } : d,
    );
  };

  const setContract = (key, value) => {
    setDraft((d) =>
      d ? { ...d, contract: { ...d.contract, [key]: value } } : d,
    );
  };

  if (!draft) return null;

  return (
    <div className="rounded-lg overflow-hidden shadow-md border border-primary-800/25">
      <div className="bg-gradient-to-br from-primary-700 to-primary-900 px-4 py-2.5 tablet:py-3">
        <p className="text-[11px] tablet:text-xs font-bold uppercase tracking-wider text-white/90">
          {isCreate ? 'Add player' : 'Edit player'}
        </p>
      </div>
      <div className="bg-white p-4 tablet:p-6 space-y-8 max-h-[min(70vh,720px)] overflow-y-auto">
        <div>
          {isCreate ? (
            <>
              <label
                htmlFor={`${idPrefix}-name`}
                className="block text-xs font-medium text-neutral-gray700 mb-1"
              >
                Full name <span className="text-red-600">*</span>
              </label>
              <input
                id={`${idPrefix}-name`}
                type="text"
                value={draft.name ?? ''}
                onChange={(e) => setPlayerField('name', e.target.value)}
                className="input py-2 text-sm"
                placeholder="e.g. Harry Kane"
                autoComplete="off"
              />
            </>
          ) : (
            <>
              <p className="text-xs font-medium text-neutral-gray500 mb-1">Name (read-only)</p>
              <p className="text-sm font-semibold text-neutral-gray900">{draft.name || '—'}</p>
            </>
          )}
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary-700 mb-3">
            Profile{' '}
            {isCreate && (
              <span className="font-normal text-neutral-gray500 normal-case tracking-normal">
                (required <span className="text-red-600 font-semibold">*</span>)
              </span>
            )}
          </h3>
          <div className={fieldGridClass(PLAYER_EDIT_FIELDS.length)}>
            {PLAYER_EDIT_FIELDS.map(([key, label]) => (
              <div key={key} className="min-w-0">
                <label
                  htmlFor={`${idPrefix}-${key}`}
                  className="block text-xs font-medium text-neutral-gray600 mb-1"
                >
                  {label}
                  {isCreate && key !== 'market_value' && (
                    <>
                      {' '}
                      <span className="text-red-600">*</span>
                    </>
                  )}
                </label>
                <input
                  id={`${idPrefix}-${key}`}
                  type="text"
                  value={draft[key] ?? ''}
                  onChange={(e) => setPlayerField(key, e.target.value)}
                  className="input py-2 text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary-700 mb-1">
            Statistics
          </h3>
          {isCreate && (
            <p className="text-xs text-neutral-gray500 mb-3">Optional.</p>
          )}
          <div className={fieldGridClass(STAT_EDIT_KEYS.length)}>
            {STAT_EDIT_KEYS.map((key) => (
              <div key={key} className="min-w-0">
                <label
                  htmlFor={`${idPrefix}-stat-${key}`}
                  className="block text-xs font-medium text-neutral-gray600 mb-1"
                >
                  {STAT_EDIT_LABELS[key]}
                </label>
                <input
                  id={`${idPrefix}-stat-${key}`}
                  type="text"
                  inputMode="decimal"
                  value={draft.stats[key] ?? ''}
                  onChange={(e) => setStat(key, e.target.value)}
                  className="input py-2 text-sm tabular-nums"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary-700 mb-1">
            Attributes (0–100)
          </h3>
          {isCreate && (
            <p className="text-xs text-neutral-gray500 mb-3">Optional.</p>
          )}
          <div className={fieldGridClass(ATTR_EDIT_KEYS.length)}>
            {ATTR_EDIT_KEYS.map((key) => (
              <div key={key} className="min-w-0">
                <label
                  htmlFor={`${idPrefix}-attr-${key}`}
                  className="block text-xs font-medium text-neutral-gray600 mb-1"
                >
                  {ATTR_EDIT_LABELS[key]}
                </label>
                <input
                  id={`${idPrefix}-attr-${key}`}
                  type="text"
                  inputMode="numeric"
                  value={draft.attributes[key] ?? ''}
                  onChange={(e) => setAttr(key, e.target.value)}
                  className="input py-2 text-sm tabular-nums"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary-700 mb-1">Contract</h3>
          {isCreate && (
            <p className="text-xs text-neutral-gray500 mb-3">Optional.</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 tablet:gap-4 max-w-xl">
            <div className="min-w-0">
              <label
                htmlFor={`${idPrefix}-salary`}
                className="block text-xs font-medium text-neutral-gray600 mb-1"
              >
                Annual salary
              </label>
              <input
                id={`${idPrefix}-salary`}
                type="text"
                inputMode="numeric"
                value={draft.contract.salary ?? ''}
                onChange={(e) => setContract('salary', e.target.value)}
                className="input py-2 text-sm tabular-nums"
                placeholder="e.g. 4420000"
              />
            </div>
            <div className="min-w-0">
              <label
                htmlFor={`${idPrefix}-contract-end`}
                className="block text-xs font-medium text-neutral-gray600 mb-1"
              >
                Contract end
              </label>
              <input
                id={`${idPrefix}-contract-end`}
                type="date"
                value={draft.contract.contract_end ?? ''}
                onChange={(e) => setContract('contract_end', e.target.value)}
                className="input py-2 text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
