import { useState } from 'react';
import { ShieldAlert, Check } from 'lucide-react';
import { useApp } from '../lib/store';
import { useT } from '../lib/i18n';
import { Button, Chip, inputCls, toast } from '../components/ui';

export default function Retaliation() {
  const { t } = useT();
  const active = useApp((s) => s.session.activeCase ?? s.saved);
  const c = useApp((s) => s.cases.find((x) => x.ref === active?.ref));
  const report = useApp((s) => s.reportRetaliation);
  const go = useApp((s) => s.go);
  const [kind, setKind] = useState<string[]>([]);
  const [text, setText] = useState('');
  if (!c) return null;
  const kinds = [
    t('Shifts or duties changed', 'මුර හෝ රාජකාරි වෙනස් කළා'),
    t('Threatened or shouted at', 'තර්ජනය කළා හෝ කෑගැසුවා'),
    t('Marks or pay cut', 'ලකුණු හෝ වැටුප් අඩු කළා'),
    t('Left out or ignored', 'බැහැර කළා හෝ නොසලකා හැරියා'),
    t('Other', 'වෙනත්'),
  ];
  return (
    <div className="px-4 pt-6 pb-8">
      <span className="h-14 w-14 rounded-2xl bg-sos-50 text-sos grid place-items-center"><ShieldAlert size={26} /></span>
      <h1 className="text-[24px] font-bold leading-tight mt-4">{t('Tell us about retaliation', 'පළිගැනීම ගැන අපට කියන්න')}</h1>
      <p className="text-muted mt-1">{t('Being punished for reporting is serious. Your reviewer sees this first, before anything else in your case.', 'පැමිණිලි කිරීම නිසා දඬුවම් ලැබීම බරපතළයි. ඔබේ සමාලෝචකයා මෙය අනෙක් සියල්ලටම පෙර දකියි.')}</p>
      <p className="font-semibold mt-5 mb-2">{t('What is happening?', 'මොකක්ද සිදු වෙන්නේ?')}</p>
      <div className="flex flex-wrap gap-2">
        {kinds.map((k) => <Chip key={k} selected={kind.includes(k)} onClick={() => setKind(kind.includes(k) ? kind.filter((x) => x !== k) : [...kind, k])}>{k}</Chip>)}
      </div>
      <label htmlFor="rt" className="font-semibold block mt-5 mb-1.5">{t('Anything else? (optional)', 'වෙනත් යමක්? (අත්‍යවශ්‍ය නැත)')}</label>
      <textarea id="rt" rows={4} value={text} onChange={(e) => setText(e.target.value)} className={`${inputCls} py-3 resize-none`} />
      <Button block size="lg" className="mt-5" disabled={!kind.length && !text.trim()} icon={<Check size={18} />}
        onClick={() => { report(c.id, [...kind, text.trim()].filter(Boolean).join(' · ')); toast(t('Sent to your reviewer as a priority', 'ප්‍රමුඛතාවයක් ලෙස සමාලෝචකයාට යැව්වා')); go('case', { replace: true }); }}>
        {t('Send to my reviewer', 'මගේ සමාලෝචකයාට යවන්න')}
      </Button>
    </div>
  );
}
