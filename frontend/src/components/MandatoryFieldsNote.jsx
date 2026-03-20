/** Explains red asterisks on form labels. */
export default function MandatoryFieldsNote({ className = '' }) {
  return (
    <p className={['text-xs text-neutral-gray600', className].filter(Boolean).join(' ')}>
      Fields marked with{' '}
      <span className="text-red-600 font-semibold" aria-hidden="true">
        *
      </span>{' '}
      are mandatory.
    </p>
  );
}
