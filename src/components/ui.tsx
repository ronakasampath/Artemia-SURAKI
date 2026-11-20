import { create } from 'zustand';
import { Check, X } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useEffect } from 'react';

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

/* ---------- Brand mark: a single protective thread looping back on itself ---------- */
export function ThreadMark({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className={className}>
      <rect width="32" height="32" rx="9" fill="rgb(var(--navy))" />
      <path d="M7.5 23c4.5 0 4-7 8.5-7s4-7 8.5-7" fill="none" stroke="#7fd1c8" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="7.5" cy="23" r="2.9" fill="#7fd1c8" />
      <circle cx="16" cy="16" r="2.9" fill="rgb(var(--navy))" stroke="#ffffff" strokeWidth="2.2" />
      <circle cx="24.5" cy="9" r="2.9" fill="#ffffff" />
    </svg>
  );
}

export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <ThreadMark size={28} />
      <span className={cx('font-si font-bold text-[19px] leading-none tracking-tight', light ? 'text-white' : 'text-navy')} lang="si">සුරැකි</span>
    </span>
  );
}

/* ---------- Buttons ---------- */
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'sos' | 'teal' | 'quiet' | 'danger-outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  block?: boolean;
};
export function Button({ variant = 'primary', size = 'md', icon, block, className, children, ...rest }: BtnProps) {
  const v = {
    primary: 'bg-navy text-white hover:bg-navy-700 active:bg-navy-700 disabled:bg-line disabled:text-muted',
    secondary: 'bg-surface text-navy border border-line hc-border hover:border-navy/40 active:bg-navy-50 disabled:text-muted',
    ghost: 'bg-transparent text-navy hover:bg-navy-50',
    sos: 'bg-sos text-white hover:brightness-95 active:brightness-90',
    teal: 'bg-teal-deep text-white hover:brightness-110',
    quiet: 'bg-navy-50 text-navy hover:bg-navy-50/70',
    'danger-outline': 'bg-surface text-sos border border-sos/40 hover:bg-sos-50',
  }[variant];
  const s = { sm: 'min-h-9 py-1.5 px-3 text-sm gap-1.5 rounded-[10px] text-left leading-snug', md: 'min-h-12 px-4 text-[15px] gap-2 rounded-btn', lg: 'min-h-14 px-5 text-base gap-2.5 rounded-btn' }[size];
  return (
    <button
      {...rest}
      className={cx('inline-flex items-center justify-center font-semibold transition-colors select-none disabled:cursor-not-allowed', v, s, block && 'w-full', className)}
    >
      {icon}
      {children}
    </button>
  );
}

export function IconButton({ label, children, className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button aria-label={label} title={label} {...rest} className={cx('inline-grid place-items-center h-11 w-11 rounded-full text-navy hover:bg-navy-50 transition-colors', className)}>
      {children}
    </button>
  );
}

/* ---------- Choice chips & segmented controls ---------- */
export function Chip({ selected, onClick, children, className }: { selected?: boolean; onClick?: () => void; children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={!!selected}
      onClick={onClick}
      className={cx(
        'min-h-11 px-4 rounded-full border text-[15px] font-medium transition-colors inline-flex items-center gap-2 hc-border',
        selected ? 'bg-navy text-white border-navy' : 'bg-surface text-ink border-line hover:border-navy/40',
        className,
      )}
    >
      {selected && <Check size={16} aria-hidden />}
      {children}
    </button>
  );
}

export function Segmented<T extends string>({ value, options, onChange, label, size = 'md' }: { value: T; options: { v: T; l: ReactNode; aria?: string }[]; onChange: (v: T) => void; label: string; size?: 'sm' | 'md' }) {
  return (
    <div role="radiogroup" aria-label={label} className={cx('inline-flex p-1 rounded-full bg-navy-50 border border-line hc-border', size === 'sm' && 'p-0.5')}>
      {options.map((o) => (
        <button
          key={o.v}
          role="radio"
          aria-checked={value === o.v}
          aria-label={o.aria}
          onClick={() => onChange(o.v)}
          className={cx(
            'rounded-full font-semibold transition-colors',
            size === 'sm' ? 'h-8 px-3 text-[13px]' : 'h-9 px-4 text-sm',
            value === o.v ? 'bg-surface text-navy shadow-sm' : 'text-muted hover:text-navy',
          )}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode; hint?: ReactNode }) {
  return (
    <label className="flex items-start gap-3 py-3 cursor-pointer">
      <span className="flex-1">
        <span className="block font-semibold text-[15px]">{label}</span>
        {hint && <span className="block text-sm text-muted mt-0.5">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cx('relative mt-0.5 h-7 w-12 shrink-0 rounded-full transition-colors', checked ? 'bg-teal-deep' : 'bg-line')}
      >
        <span className={cx('absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform grid place-items-center', checked ? 'translate-x-[22px]' : 'translate-x-0.5')}>
          {checked && <Check size={14} className="text-teal-deep" aria-hidden />}
        </span>
      </button>
    </label>
  );
}

/* ---------- Pills ---------- */
export function Pill({ tone = 'navy', children, className }: { tone?: 'navy' | 'teal' | 'ok' | 'warn' | 'sos' | 'grey'; children: ReactNode; className?: string }) {
  const t = {
    navy: 'bg-navy-50 text-navy',
    teal: 'bg-teal-50 text-teal-deep',
    ok: 'bg-ok-50 text-ok',
    warn: 'bg-warn-50 text-warn',
    sos: 'bg-sos-50 text-sos',
    grey: 'bg-mist text-muted border border-line',
  }[tone];
  return <span className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[13px] font-semibold whitespace-nowrap', t, className)}>{children}</span>;
}

/* ---------- The thread: a case's journey, used everywhere a case appears ---------- */
export type ThreadStep = { key: string; title: ReactNode; detail?: ReactNode; when?: ReactNode; state: 'done' | 'current' | 'next' };
export function Thread({ steps, compact = false }: { steps: ThreadStep[]; compact?: boolean }) {
  return (
    <ol className="relative">
      {steps.map((s, i) => (
        <li key={s.key} className={cx('relative flex gap-3', compact ? 'pb-3' : 'pb-5', i === steps.length - 1 && 'pb-0')}>
          {i < steps.length - 1 && (
            <span
              aria-hidden
              className={cx('absolute left-[11px] top-6 bottom-0 w-[2px]', s.state === 'done' ? 'bg-teal' : 'bg-line')}
              style={s.state !== 'done' ? { backgroundImage: 'linear-gradient(rgb(var(--line)) 50%, transparent 50%)', backgroundSize: '2px 6px', backgroundColor: 'transparent' } : undefined}
            />
          )}
          <span
            aria-hidden
            className={cx(
              'relative z-10 mt-0.5 h-6 w-6 shrink-0 rounded-full grid place-items-center',
              s.state === 'done' && 'bg-teal text-white',
              s.state === 'current' && 'bg-surface border-[3px] border-navy animate-pulse-ring',
              s.state === 'next' && 'bg-surface border-2 border-line',
            )}
          >
            {s.state === 'done' && <Check size={14} strokeWidth={3} />}
          </span>
          <div className="min-w-0 flex-1 -mt-0.5">
            <p className={cx('font-semibold leading-snug', s.state === 'next' ? 'text-muted' : 'text-ink', compact ? 'text-[14px]' : 'text-[15px]')}>
              <span className="sr-only">{s.state === 'done' ? 'Done: ' : s.state === 'current' ? 'Now: ' : 'Later: '}</span>
              {s.title}
            </p>
            {s.when && <p className="text-[13px] text-muted">{s.when}</p>}
            {s.detail && <div className="text-sm text-muted mt-1">{s.detail}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Horizontal thread used as the wizard progress indicator */
export function ThreadBar({ total, current, label }: { total: number; current: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={current + 1} aria-label={label}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className="flex items-center gap-1.5 flex-1 last:flex-none">
          <span className={cx('h-2.5 w-2.5 rounded-full shrink-0 transition-colors', i < current ? 'bg-teal' : i === current ? 'bg-navy ring-4 ring-navy/15' : 'bg-line')} />
          {i < total - 1 && <span className={cx('h-[2px] flex-1 rounded transition-colors', i < current ? 'bg-teal' : 'bg-line')} />}
        </span>
      ))}
    </div>
  );
}

/* ---------- Toasts ---------- */
type ToastT = { id: number; text: ReactNode; tone: 'ok' | 'info' };
const useToasts = create<{ list: ToastT[]; push: (t: ReactNode, tone?: ToastT['tone']) => void; drop: (id: number) => void }>((set) => ({
  list: [],
  push: (text, tone = 'ok') => {
    const id = Date.now() + Math.random();
    set(() => ({ list: [{ id, text, tone }] }));
    setTimeout(() => set((s) => ({ list: s.list.filter((x) => x.id !== id) })), 3200);
  },
  drop: (id) => set((s) => ({ list: s.list.filter((x) => x.id !== id) })),
}));
export const toast = (t: ReactNode, tone?: ToastT['tone']) => useToasts.getState().push(t, tone);
export const clearToasts = () => useToasts.setState({ list: [] });

export function Toaster({ className }: { className?: string }) {
  const list = useToasts((s) => s.list);
  const drop = useToasts((s) => s.drop);
  return (
    <div aria-live="polite" className={cx('pointer-events-none flex flex-col items-center gap-2', className)}>
      {list.map((t) => (
        <div key={t.id} className="pointer-events-auto animate-rise flex items-center gap-2 rounded-full bg-ink text-white pl-3 pr-1.5 py-1.5 shadow-lift text-sm font-medium max-w-[92%]">
          <span className={cx('grid place-items-center h-5 w-5 rounded-full shrink-0', t.tone === 'ok' ? 'bg-ok' : 'bg-teal')}>
            <Check size={13} strokeWidth={3} />
          </span>
          <span className="min-w-0">{t.text}</span>
          <button aria-label="Dismiss" onClick={() => drop(t.id)} className="h-7 w-7 grid place-items-center rounded-full hover:bg-white/10">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ---------- Modal (desktop portals) ---------- */
export function Modal({ open, onClose, title, children, width = 'max-w-2xl', footer }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; width?: string; footer?: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-ink/40 animate-fade" onMouseDown={onClose}>
      <div role="dialog" aria-modal aria-label={typeof title === 'string' ? title : undefined} onMouseDown={(e) => e.stopPropagation()} className={cx('w-full bg-surface rounded-sheet shadow-lift animate-rise max-h-[90vh] flex flex-col', width)}>
        <div className="flex items-center justify-between gap-4 px-6 pt-5 pb-3 border-b border-line">
          <h2 className="text-lg font-bold">{title}</h2>
          <IconButton label="Close" onClick={onClose}><X size={20} /></IconButton>
        </div>
        <div className="px-6 py-5 overflow-y-auto thin-scroll">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-line flex justify-end gap-2 flex-wrap">{footer}</div>}
      </div>
    </div>
  );
}

export function Field({ label, hint, children, id }: { label: ReactNode; hint?: ReactNode; children: ReactNode; id?: string }) {
  return (
    <div>
      <label htmlFor={id} className="block font-semibold text-[15px] mb-1.5">{label}</label>
      {hint && <p className="text-sm text-muted -mt-1 mb-2">{hint}</p>}
      {children}
    </div>
  );
}

export const inputCls = 'w-full min-h-12 rounded-btn border border-line hc-border bg-surface px-3.5 text-[16px] text-ink placeholder:text-muted/70 focus:outline-none focus:border-navy focus:ring-4 focus:ring-navy/10';
