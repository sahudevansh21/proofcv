import { forwardRef, useId } from 'react';

const control =
  'w-full rounded-xl border bg-surface px-3.5 text-sm text-fg placeholder:text-fg-subtle transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-ring/40';
const border = (error) => (error ? 'border-danger focus:border-danger' : 'border-line hover:border-line-strong focus:border-primary');

function Field({ id, label, hint, error, children, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-fg">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-danger-fg">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-fg-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const describedBy = (id, error, hint) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined);

export const Input = forwardRef(function Input({ label, hint, error, className, id: idProp, ...rest }, ref) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <Field id={id} label={label} hint={hint} error={error} className={className}>
      <input
        ref={ref}
        id={id}
        aria-invalid={!!error || undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={`${control} ${border(error)} h-11`}
        {...rest}
      />
    </Field>
  );
});

export const Textarea = forwardRef(function Textarea({ label, hint, error, className, inputClassName = '', id: idProp, ...rest }, ref) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <Field id={id} label={label} hint={hint} error={error} className={className}>
      <textarea
        ref={ref}
        id={id}
        aria-invalid={!!error || undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={`${control} ${border(error)} py-2.5 ${inputClassName}`}
        {...rest}
      />
    </Field>
  );
});

export const Select = forwardRef(function Select({ label, hint, error, className, id: idProp, children, ...rest }, ref) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <Field id={id} label={label} hint={hint} error={error} className={className}>
      <select
        ref={ref}
        id={id}
        aria-invalid={!!error || undefined}
        className={`${control} ${border(error)} h-10 cursor-pointer pr-8`}
        {...rest}
      >
        {children}
      </select>
    </Field>
  );
});
