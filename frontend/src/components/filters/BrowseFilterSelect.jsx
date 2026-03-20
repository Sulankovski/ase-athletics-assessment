import { useEffect, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

const NARROW_QUERY = '(max-width: 639px)';

function useNarrowBrowseSelect() {
  const [narrow, setNarrow] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(NARROW_QUERY).matches : false,
  );

  useEffect(() => {
    const mq = window.matchMedia(NARROW_QUERY);
    const onChange = () => setNarrow(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return narrow;
}

const BASE_SELECT_CLASSES =
  'input w-full min-h-[44px] touch-manipulation py-2.5 text-base sm:min-h-0 sm:py-2 sm:text-sm disabled:opacity-60';

/**
 * Browse filters: native `<select>` from `sm` breakpoint up; on small screens, a tappable
 * control opens a bottom sheet with larger touch targets (team / position / foot).
 *
 * `options`: `{ value, label }[]` — does not include the empty placeholder; that uses `placeholderLabel`.
 */
export default function BrowseFilterSelect({
  id,
  fieldLabel,
  value,
  onChange,
  disabled,
  placeholderLabel,
  options,
}) {
  const narrow = useNarrowBrowseSelect();
  const [open, setOpen] = useState(false);

  const selectedLabel =
    value === '' || value == null
      ? placeholderLabel
      : (options.find((o) => o.value === value)?.label ?? String(value));

  useEffect(() => {
    if (!open || !narrow) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, narrow]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!narrow) {
    return (
      <select
        id={id}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={BASE_SELECT_CLASSES}
      >
        <option value="">{placeholderLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <>
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen(true)}
        className={`${BASE_SELECT_CLASSES} flex items-center justify-between gap-2 text-left`}
      >
        <span className="truncate text-neutral-gray900">{selectedLabel}</span>
        <ChevronDown className="h-5 w-5 shrink-0 text-neutral-gray500" strokeWidth={2} aria-hidden />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[120] flex flex-col justify-end sm:hidden"
          aria-modal="true"
          role="dialog"
          aria-labelledby={`${id}-sheet-title`}
        >
          <button
            type="button"
            className="absolute inset-0 bg-neutral-gray900/45 backdrop-blur-[1px]"
            aria-label="Close list"
            onClick={() => setOpen(false)}
          />
          <div
            className="relative flex max-h-[min(78dvh,560px)] flex-col rounded-t-2xl border-t border-neutral-200 bg-white shadow-2xl"
            style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom, 0px))' }}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3">
              <h2 id={`${id}-sheet-title`} className="text-base font-semibold text-neutral-gray900">
                {fieldLabel}
              </h2>
              <button
                type="button"
                className="rounded-lg p-2 text-neutral-gray600 hover:bg-neutral-gray100 hover:text-neutral-gray900"
                aria-label="Close"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
            <ul className="min-h-0 flex-1 divide-y divide-neutral-100 overflow-y-auto overscroll-contain" role="listbox">
              <li role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={value === '' || value == null}
                  className={[
                    'flex w-full min-h-[48px] items-center px-4 py-3.5 text-left text-base text-neutral-gray900',
                    'active:bg-primary-100/60',
                    (value === '' || value == null) && 'bg-primary-50 font-semibold text-primary-800',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => {
                    onChange('');
                    setOpen(false);
                  }}
                >
                  {placeholderLabel}
                </button>
              </li>
              {options.map((o) => {
                const selected = o.value === value;
                return (
                  <li key={o.value} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      className={[
                        'flex w-full min-h-[48px] items-center px-4 py-3.5 text-left text-base text-neutral-gray900',
                        'active:bg-primary-100/60',
                        selected && 'bg-primary-50 font-semibold text-primary-800',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => {
                        onChange(o.value);
                        setOpen(false);
                      }}
                    >
                      {o.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
