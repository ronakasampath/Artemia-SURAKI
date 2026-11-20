import { STATUS_ORDER } from '../lib/store';
import { cx } from '../components/ui';
import type { CaseStatus } from '../lib/types';

/** A compact version of the case thread: five milestones as dots on one line. */
const STEPS: CaseStatus[] = ['received', 'in_review', 'org_notified', 'org_responded', 'closed'];

export default function MiniThread({ status, label }: { status: CaseStatus; label?: string }) {
  const idx = STATUS_ORDER.indexOf(status);
  const reached = STEPS.map((s) => STATUS_ORDER.indexOf(s) <= idx);
  const current = reached.lastIndexOf(true);
  return (
    <span className="flex items-center gap-1 w-[112px]" role="img" aria-label={label}>
      {STEPS.map((s, i) => (
        <span key={s} className="flex items-center gap-1 flex-1 last:flex-none">
          <span className={cx('h-2.5 w-2.5 rounded-full shrink-0', i < current || status === 'closed' ? 'bg-teal' : i === current ? 'bg-navy ring-[3px] ring-navy/15' : 'bg-line')} />
          {i < STEPS.length - 1 && <span className={cx('h-[2px] flex-1 rounded', i < current || status === 'closed' ? 'bg-teal' : 'bg-line')} />}
        </span>
      ))}
    </span>
  );
}
