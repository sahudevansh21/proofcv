import { forwardRef } from 'react';
import { Link } from 'react-router';
import { LoaderCircle } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-primary text-primary-fg hover:bg-primary-hover',
  secondary: 'bg-transparent text-fg border border-line-strong hover:border-fg hover:bg-band',
  soft: 'bg-chip-on text-[#3a3550] hover:bg-[#fbe46d]',
  ghost: 'text-fg-muted hover:bg-band hover:text-fg',
  danger: 'bg-danger text-white hover:brightness-110',
  'danger-ghost': 'text-danger-fg hover:bg-danger-soft',
};
const SIZES = {
  sm: 'h-8 px-3.5 text-[11px] gap-1.5 rounded-full font-mono uppercase tracking-[0.1em]',
  md: 'h-10 px-5 text-[12px] gap-2 rounded-full font-mono uppercase tracking-[0.1em]',
  lg: 'h-[50px] px-7 text-[16px] gap-2 rounded-none font-display font-medium uppercase tracking-[0.12em]',
};

export const buttonClass = ({ variant = 'primary', size = 'md', className = '' } = {}) =>
  `inline-flex items-center justify-center font-medium whitespace-nowrap select-none transition-[background,color,box-shadow,filter] duration-150 ease-out disabled:pointer-events-none disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

/** Button, or a router Link when `to` is given. */
export const Button = forwardRef(function Button(
  { variant, size, className, loading = false, icon: Icon, iconRight: IconRight, to, children, disabled, type = 'button', ...rest },
  ref,
) {
  const cls = buttonClass({ variant, size, className });
  const content = (
    <>
      {loading ? <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : Icon && <Icon aria-hidden className="h-4 w-4 shrink-0" />}
      {children}
      {IconRight && <IconRight aria-hidden className="h-4 w-4 shrink-0" />}
    </>
  );
  if (to)
    return (
      <Link ref={ref} to={to} className={cls} {...rest}>
        {content}
      </Link>
    );
  return (
    <button ref={ref} type={type} className={cls} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {content}
    </button>
  );
});

export const IconButton = forwardRef(function IconButton(
  { icon: Icon, label, variant = 'ghost', size = 'md', className = '', ...rest },
  ref,
) {
  const dim = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={`inline-grid place-items-center rounded-xl transition-colors duration-150 ${VARIANTS[variant]} ${dim} ${className}`}
      {...rest}
    >
      <Icon aria-hidden className="h-[18px] w-[18px]" />
    </button>
  );
});
