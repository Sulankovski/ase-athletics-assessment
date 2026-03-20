import {
  PREFERRED_FOOT_OPTIONS,
  preferredFootSelectValue,
} from '@/constants/playerSearchFilters';
import {
  PLAYER_EDIT_FIELDS,
  STAT_EDIT_KEYS,
  STAT_EDIT_LABELS,
  ATTR_EDIT_KEYS,
  ATTR_EDIT_LABELS,
} from '@/utils/playerEdit';
import MandatoryFieldsNote from '@/components/MandatoryFieldsNote';

/** Digits only (empty allowed while typing). */
function sanitizeUnsignedIntegerInput(raw) {
  return String(raw ?? '').replace(/\D/g, '');
}

/** For `type="number"` when API may send non-numeric strings (e.g. market value "N/A"). */
function unsignedIntegerDisplayForInput(raw) {
  const s = String(raw ?? '').trim();
  if (s === '') return '';
  return /^\d+$/.test(s) ? s : '';
}

/** Digits only, except `pass_accuracy` may include a single decimal point. */
function sanitizeStatInput(key, raw) {
  if (key === 'pass_accuracy') {
    let t = String(raw ?? '').replace(/[^\d.]/g, '');
    const i = t.indexOf('.');
    if (i !== -1) {
      t = `${t.slice(0, i + 1)}${t.slice(i + 1).replace(/\./g, '')}`;
    }
    return t;
  }
  return sanitizeUnsignedIntegerInput(raw);
}

/** Profile fields edited as non-negative integers (native number spinners). */
const PROFILE_UNSIGNED_NUMBER_KEYS = new Set([
  'age',
  'jersey_number',
  'height',
  'weight',
  'market_value',
]);

const profileNumberInputClass =
  'input py-2 text-sm tabular-nums [&::-webkit-inner-spin-button]:opacity-100 [&::-webkit-outer-spin-button]:opacity-100';

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
        {isCreate ? <MandatoryFieldsNote className="mb-2" /> : null}
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
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary-700 mb-3">Profile</h3>
          <div className={fieldGridClass(PLAYER_EDIT_FIELDS.length)}>
            {PLAYER_EDIT_FIELDS.map(([key, label]) => {
              const isUnsignedNumber = PROFILE_UNSIGNED_NUMBER_KEYS.has(key);
              const isPreferredFoot = key === 'preferred_foot';
              return (
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
                  {isPreferredFoot ? (
                    <select
                      id={`${idPrefix}-${key}`}
                      value={preferredFootSelectValue(draft[key])}
                      onChange={(e) => setPlayerField(key, e.target.value)}
                      className="input py-2 text-sm w-full"
                    >
                      <option value="">Select foot…</option>
                      {PREFERRED_FOOT_OPTIONS.map(({ value: v, label: optLabel }) => (
                        <option key={v} value={v}>
                          {optLabel}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={`${idPrefix}-${key}`}
                      type={isUnsignedNumber ? 'number' : 'text'}
                      min={isUnsignedNumber ? 0 : undefined}
                      step={isUnsignedNumber ? 1 : undefined}
                      inputMode={isUnsignedNumber ? 'numeric' : undefined}
                      value={
                        isUnsignedNumber
                          ? unsignedIntegerDisplayForInput(draft[key])
                          : (draft[key] ?? '')
                      }
                      onChange={(e) => {
                        if (!isUnsignedNumber) {
                          setPlayerField(key, e.target.value);
                          return;
                        }
                        const v = e.target.value;
                        if (v === '') {
                          setPlayerField(key, '');
                          return;
                        }
                        setPlayerField(key, sanitizeUnsignedIntegerInput(v));
                      }}
                      className={isUnsignedNumber ? profileNumberInputClass : 'input py-2 text-sm'}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary-700 mb-1">
            Statistics
          </h3>
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
                  type="number"
                  min={0}
                  max={key === 'pass_accuracy' ? 100 : undefined}
                  step={key === 'pass_accuracy' ? '0.1' : 1}
                  inputMode={key === 'pass_accuracy' ? 'decimal' : 'numeric'}
                  value={draft.stats[key] ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === '') {
                      setStat(key, '');
                      return;
                    }
                    setStat(key, sanitizeStatInput(key, v));
                  }}
                  className="input py-2 text-sm tabular-nums [&::-webkit-inner-spin-button]:opacity-100 [&::-webkit-outer-spin-button]:opacity-100"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary-700 mb-1">
            Attributes (0–100)
          </h3>
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
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  inputMode="numeric"
                  value={draft.attributes[key] ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === '') {
                      setAttr(key, '');
                      return;
                    }
                    setAttr(key, sanitizeUnsignedIntegerInput(v));
                  }}
                  className="input py-2 text-sm tabular-nums [&::-webkit-inner-spin-button]:opacity-100 [&::-webkit-outer-spin-button]:opacity-100"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary-700 mb-1">Contract</h3>
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
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                value={unsignedIntegerDisplayForInput(draft.contract.salary)}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === '') {
                    setContract('salary', '');
                    return;
                  }
                  setContract('salary', sanitizeUnsignedIntegerInput(v));
                }}
                className="input py-2 text-sm tabular-nums [&::-webkit-inner-spin-button]:opacity-100 [&::-webkit-outer-spin-button]:opacity-100"
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
