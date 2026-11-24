import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react';
import { IconButton } from './Button.jsx';

/** Native <dialog> gives focus trapping, Esc to close and inert background for free. */
function useDialog(open, onClose) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const handle = (e) => {
      e.preventDefault();
      onClose();
    };
    el.addEventListener('cancel', handle);
    return () => el.removeEventListener('cancel', handle);
  }, [onClose]);
  const onBackdrop = (e) => {
    if (e.target === ref.current) onClose();
  };
  return { ref, onBackdrop };
}

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  const { ref, onBackdrop } = useDialog(open, onClose);
  const width = size === 'lg' ? 'max-w-3xl' : size === 'sm' ? 'max-w-sm' : 'max-w-lg';
  return (
    <dialog
      ref={ref}
      onClick={onBackdrop}
      aria-labelledby="modal-title"
      className={`m-auto w-[calc(100%-2rem)] ${width} rounded-[var(--radius-card)] border border-line bg-surface p-0 text-fg shadow-[var(--shadow-pop)]`}
    >
      {open && (
        <div className="animate-fade-up">
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div>
              <h2 id="modal-title" className="text-lg font-semibold">
                {title}
              </h2>
              {description && <p className="mt-0.5 text-sm text-fg-muted">{description}</p>}
            </div>
            <IconButton icon={X} label="Close" size="sm" onClick={onClose} />
          </div>
          <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
          {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-3">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}

export function Drawer({ open, onClose, title, children, side = 'right' }) {
  const { ref, onBackdrop } = useDialog(open, onClose);
  const pos = side === 'right' ? 'ml-auto mr-0' : 'ml-0 mr-auto';
  return (
    <dialog
      ref={ref}
      onClick={onBackdrop}
      aria-label={title}
      className={`${pos} my-0 h-dvh max-h-dvh w-[min(22rem,90vw)] border-line bg-surface p-0 text-fg shadow-[var(--shadow-pop)]`}
    >
      {open && (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="font-semibold">{title}</h2>
            <IconButton icon={X} label="Close menu" size="sm" onClick={onClose} />
          </div>
          <div className="flex-1 overflow-y-auto p-4">{children}</div>
        </div>
      )}
    </dialog>
  );
}

/* ---------------- Toasts ---------------- */

const ToastContext = createContext(null);
const TOAST_ICON = { success: CircleCheck, error: CircleAlert, info: Info, warning: CircleAlert };
const TOAST_TONE = {
  success: 'border-success/40 text-success-fg',
  error: 'border-danger/40 text-danger-fg',
  warning: 'border-warning/50 text-warning-fg',
  info: 'border-line text-fg',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback(
    (message, { tone = 'info', duration = 3500 } = {}) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((t) => [...t.slice(-3), { id, message, tone }]);
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );
  const api = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        role="status"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 no-print"
      >
        {toasts.map((t) => {
          const Icon = TOAST_ICON[t.tone];
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex w-full max-w-sm animate-fade-up items-start gap-2.5 rounded-xl border bg-surface px-4 py-3 text-sm shadow-[var(--shadow-pop)] ${TOAST_TONE[t.tone]}`}
            >
              <Icon aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="flex-1 text-fg">{t.message}</p>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="text-fg-subtle hover:text-fg"
                aria-label="Dismiss notification"
              >
                <X aria-hidden className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx.toast;
}
