import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BadgeCheck, Building2, ChevronRight, FileCheck2, Gavel, Info, Megaphone, Search, ShieldQuestion } from 'lucide-react';
import { useApp } from '../lib/store';
import { PLACE, fmtDate, useT } from '../lib/i18n';
import type { PlaceType, PublicRecord } from '../lib/types';
import { Chip, Pill, Thread, cx, inputCls } from '../components/ui';

const KIND = {
  notice: { en: 'Official notice', si: 'නිල නිවේදනය', icon: Megaphone, tone: 'navy' as const },
  corrective: { en: 'Corrective action', si: 'නිවැරදි කිරීමේ ක්‍රියාමාර්ගය', icon: FileCheck2, tone: 'teal' as const },
  appeal: { en: 'Appeal outcome', si: 'අභියාචනා ප්‍රතිඵලය', icon: Gavel, tone: 'warn' as const },
  update: { en: 'Update', si: 'යාවත්කාලීනය', icon: Info, tone: 'grey' as const },
};

export function DirectoryList({ compact = false, onOpen }: { compact?: boolean; onOpen?: (id: string) => void }) {
  const { t, tb } = useT();
  const records = useApp((s) => s.records);
  const ORGS = useApp((s) => s.orgs);
  const go = useApp((s) => s.go);
  const [q, setQ] = useState('');
  const [type, setType] = useState<PlaceType | 'all'>('all');
  const open = (id: string) => (onOpen ? onOpen(id) : go('org', { org: id }));
  const list = ORGS.filter((o) => (type === 'all' || o.type === type) && (tb(o.name) + o.name.en + tb(o.district) + o.district.en).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className={cx(compact ? 'px-4 pt-5 pb-8' : '')}>
      <h1 className={cx('font-bold leading-tight', compact ? 'text-[24px]' : 'text-[30px]')}>{t('Organisation directory', 'ආයතන නාමාවලිය')}</h1>
      <p className="text-muted mt-1 max-w-[60ch]">{t('Official notices and verified fixes about workplaces, campuses and venues. Complaints are never shown here.', 'සේවා ස්ථාන, විශ්වවිද්‍යාල හා ස්ථාන පිළිබඳ නිල නිවේදන හා තහවුරු කළ නිවැරදි කිරීම්. පැමිණිලි කිසිදා මෙහි පෙන්වන්නේ නැහැ.')}</p>

      <div className="relative mt-4">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('Search an organisation or district', 'ආයතනයක් හෝ දිස්ත්‍රික්කයක් සොයන්න')} aria-label={t('Search organisations', 'ආයතන සොයන්න')} className={cx(inputCls, 'pl-10')} />
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-3 -mx-1 px-1">
        <Chip selected={type === 'all'} onClick={() => setType('all')}>{t('All', 'සියල්ල')}</Chip>
        {(['workplace', 'university', 'hotel', 'transport'] as PlaceType[]).map((k) => (
          <Chip key={k} className="shrink-0" selected={type === k} onClick={() => setType(k)}>{tb(PLACE[k])}</Chip>
        ))}
      </div>

      <ul className={cx('grid gap-2.5', !compact && 'md:grid-cols-2')}>
        {list.map((o) => {
          const recs = records.filter((r) => r.orgId === o.id).sort((a, b) => b.at - a.at);
          const latest = recs[0];
          return (
            <li key={o.id}>
              <button onClick={() => open(o.id)} className="w-full text-left rounded-card bg-surface border border-line hc-border p-4 hover:border-navy/40 transition-colors flex gap-3">
                <span className="h-11 w-11 rounded-xl bg-navy-50 text-navy grid place-items-center shrink-0"><Building2 size={21} /></span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-1.5 font-bold leading-snug">{tb(o.name)} {o.verified && <BadgeCheck size={16} className="text-teal-deep shrink-0" aria-label={t('Verified organisation account', 'තහවුරු කළ ආයතන ගිණුම')} />}</span>
                  <span className="block text-sm text-muted">{tb(o.sector)} · {tb(o.district)}</span>
                  <span className="block mt-2">
                    {latest ? (
                      <span className="flex flex-wrap items-center gap-1.5">
                        <Pill tone={KIND[latest.kind].tone}>{tb(KIND[latest.kind])}</Pill>
                        <span className="text-[13px] text-muted">{t(`${recs.length} record${recs.length > 1 ? 's' : ''}`, `වාර්තා ${recs.length}`)}</span>
                      </span>
                    ) : (
                      <span className="text-[13px] text-muted italic">{t('No eligible public records available', 'ප්‍රකාශයට පත් කළ හැකි වාර්තා නැත')}</span>
                    )}
                  </span>
                </span>
                <ChevronRight size={18} className="text-muted shrink-0 self-center" />
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-[13px] text-muted flex gap-1.5"><Info size={14} className="shrink-0 mt-0.5" />{t('Demo: all organisations and records are fictional.', 'ආදර්ශනය: සියලු ආයතන හා වාර්තා කල්පිතයි.')}</p>
    </div>
  );
}

export function OrgProfile({ compact = false, orgId, onBack }: { compact?: boolean; orgId?: string; onBack?: () => void }) {
  const { t, tb, lang } = useT();
  const sessionOrg = useApp((s) => s.session.orgView);
  const id = orgId ?? sessionOrg;
  const back = useApp((s) => s.back);
  const flag = useApp((s) => s.flag);
  const records = useApp((s) => s.records);
  const notices = useApp((s) => s.notices);
  const cases = useApp((s) => s.cases);
  const o = useApp((s) => s.orgs.find((x) => x.id === id));
  const recs = useMemo(() => records.filter((r) => r.orgId === id).sort((a, b) => a.at - b.at), [records, id]);

  useEffect(() => {
    const fromMine = recs.some((r) => {
      const n = notices.find((x) => x.id === r.fromNotice);
      return n && cases.find((c) => c.id === n.caseId)?.fresh;
    });
    if (fromMine) flag('directoryViewed');
  }, [recs, notices, cases, flag]);

  if (!o) return null;
  return (
    <div className={cx(compact ? 'px-4 pt-4 pb-8' : '')}>
      <button onClick={onBack ?? back} className="h-10 -ml-2 pl-1.5 pr-3 rounded-full flex items-center gap-1 text-navy font-semibold hover:bg-navy-50">
        <ArrowLeft size={20} /> {t('Directory', 'නාමාවලිය')}
      </button>
      <div className="flex items-start gap-3 mt-3">
        <span className="h-14 w-14 rounded-2xl bg-navy text-white grid place-items-center shrink-0"><Building2 size={26} /></span>
        <div>
          <h1 className={cx('font-bold leading-tight', compact ? 'text-[22px]' : 'text-[28px]')}>{tb(o.name)}</h1>
          <p className="text-muted">{tb(o.sector)} · {tb(o.district)}</p>
          {o.verified ? <Pill tone="teal" className="mt-1.5"><BadgeCheck size={14} /> {t('Verified organisation account', 'තහවුරු කළ ආයතන ගිණුම')}</Pill> : <Pill tone="grey" className="mt-1.5">{t('Not yet registered', 'තවම ලියාපදිංචි නැත')}</Pill>}
        </div>
      </div>

      <div className="mt-5 rounded-card bg-navy-50 p-4 text-[15px] flex gap-3">
        <Info size={20} className="text-navy shrink-0 mt-0.5" />
        <p>{t('Records appear only after an authorised body issues them and a separate approval for publication. Allegations are never published.', 'බලයලත් ආයතනයක් නිකුත් කර, ප්‍රකාශනය සඳහා වෙනම අනුමැතියක් ලැබුණු පසුව පමණක් වාර්තා දිස් වේ. චෝදනා කිසිදා ප්‍රකාශයට පත් නොකෙරේ.')}</p>
      </div>

      <h2 className="font-bold text-lg mt-6 mb-3">{t('Response history', 'ප්‍රතිචාර ඉතිහාසය')}</h2>
      {recs.length === 0 ? (
        <div className="rounded-card border-2 border-dashed border-line bg-surface p-6 text-center">
          <ShieldQuestion size={32} className="mx-auto text-muted" />
          <p className="font-bold mt-2">{t('No eligible public records available', 'ප්‍රකාශයට පත් කළ හැකි වාර්තා නැත')}</p>
          <p className="text-muted text-[15px] mt-1 max-w-[46ch] mx-auto">{t('This does not mean the organisation is safe or unsafe. Many concerns are never reported, and some are resolved privately.', 'මෙයින් අදහස් වන්නේ ආයතනය ආරක්ෂිත හෝ අනාරක්ෂිත බව නොවේ. බොහෝ ගැටලු කිසිදා වාර්තා නොවන අතර සමහරක් පෞද්ගලිකව විසඳේ.')}</p>
        </div>
      ) : (
        <div className="rounded-card bg-surface border border-line p-4">
          <Thread
            steps={recs.map((r, i) => ({
              key: r.id,
              state: 'done',
              title: <RecordTitle r={r} />,
              when: `${fmtDate(r.at, lang)} · ${tb(r.authority)}`,
              detail: (
                <div className="space-y-1.5">
                  <p className="text-ink">{tb(r.body)}</p>
                  <p className="flex flex-wrap items-center gap-2">
                    <Pill tone={r.status.en.startsWith('Verified') ? 'ok' : r.status.en.includes('Appeal') ? 'warn' : 'navy'}>{tb(r.status)}</Pill>
                    <span className="text-[12px]">{t('Source', 'මූලාශ්‍රය')}: <span className="font-mono">{r.source}</span></span>
                  </p>
                  {i === recs.length - 1 && <span className="sr-only">{t('Latest record', 'නවතම වාර්තාව')}</span>}
                </div>
              ),
            }))}
          />
        </div>
      )}
      <p className="mt-4 text-[13px] text-muted">{t('Think a record is wrong? Organisations can appeal, and corrections are shown here.', 'වාර්තාවක් වැරදි යැයි සිතනවාද? ආයතනවලට අභියාචනා කළ හැකි අතර නිවැරදි කිරීම් මෙහි පෙන්වයි.')}</p>
    </div>
  );
}

function RecordTitle({ r }: { r: PublicRecord }) {
  const { tb } = useT();
  const k = KIND[r.kind];
  return (
    <span className="block">
      <span className="flex items-center gap-1.5 text-[13px] font-semibold text-muted"><k.icon size={14} /> {tb(k)}</span>
      <span className="block">{tb(r.title)}</span>
    </span>
  );
}
