import { useMemo, useState } from 'react';
import {
  ArrowLeft, Bot, Building2, CheckCircle2, ClipboardList, Eye, EyeOff, FileText, Gauge, HeartHandshake, Inbox, Link2, Lock, Megaphone,
  MessageSquare, Paperclip, PencilLine, PhoneCall, Plus, ScrollText, Send, ShieldAlert, ShieldCheck, Siren, Sparkles, Stamp, Trash2, TriangleAlert, Users,
} from 'lucide-react';
import { useApp, orgById } from '../lib/store';
import { useNav, scrollPortalTop } from '../lib/nav';
import { CATEGORY, DISTRICTS, PLACE, STATUS, URGENCY, VERIFICATION, WHEN, ago, fmtDate, useT } from '../lib/i18n';
import { FLAG_COPY } from '../lib/triage';
import type { CaseFile, CaseStatus, Category, Notice, PlaceType, Urgency, Verification, WhenKey } from '../lib/types';
import { Button, Modal, Pill, Thread, cx, inputCls, toast } from '../components/ui';
import PortalShell, { PageHead, Panel } from './PortalShell';
import { NOTICE_STATUS } from './Org';
import { D } from '../data';

const URG_TONE: Record<Urgency, 'sos' | 'warn' | 'navy' | 'grey'> = { immediate: 'sos', high: 'warn', standard: 'navy', low: 'grey' };
const URG_RANK: Record<Urgency, number> = { immediate: 0, high: 1, standard: 2, low: 3 };
const SOURCE: Record<NonNullable<CaseFile['source']>, { en: string; si: string }> = {
  app: { en: 'Suraki app', si: 'සුරැකි යෙදුම' },
  phone_1938: { en: '1938 call', si: '1938 ඇමතුම' },
  police_109: { en: '109 referral', si: '109 යොමුව' },
  walk_in: { en: 'Walk-in', si: 'පැමිණ කළ' },
  email: { en: 'Email', si: 'ඊමේල්' },
};

export default function Reviewer() {
  const { t } = useT();
  const nav = useNav((s) => s.reviewer);
  const setNav = useNav((s) => s.setReviewer);
  const cases = useApp((s) => s.cases);
  const notices = useApp((s) => s.notices);
  const pendingPub = notices.filter((n) => n.publication === 'pending').length;
  const untriaged = cases.filter((c) => !c.human).length;
  const go = (view: typeof nav.view, caseId?: string) => { setNav({ view, caseId }); scrollPortalTop(); };
  const auth = useApp((s) => s.auth);

  return (
    <PortalShell
      product={t('Independent Review Desk', 'ස්වාධීන සමාලෝචන මේසය')}
      who={`${auth?.name ?? 'K. Silva'} · ${auth?.id ?? 'R-07'}`}
      role={t('Government safeguarding officer', 'රජයේ ආරක්ෂණ නිලධාරී')}
      active={nav.view === 'case' ? 'queue' : nav.view}
      onNav={(k) => go(k as typeof nav.view)}
      nav={[
        { k: 'queue', l: t('Case queue', 'ගොනු පෝලිම'), i: Inbox, badge: untriaged },
        { k: 'notices', l: t('Notices', 'නිවේදන'), i: Megaphone },
        { k: 'publication', l: t('Publication', 'ප්‍රකාශනය'), i: Stamp, badge: pendingPub },
        { k: 'audit', l: t('Audit trail', 'විගණන සටහන'), i: ScrollText },
      ]}
    >
      {nav.view === 'queue' && <Queue open={(id) => go('case', id)} />}
      {nav.view === 'case' && nav.caseId && <CaseDetail id={nav.caseId} back={() => go('queue')} />}
      {nav.view === 'notices' && <Notices open={(id) => go('case', id)} />}
      {nav.view === 'publication' && <Publication />}
      {nav.view === 'audit' && <AuditTable />}
    </PortalShell>
  );
}

function Queue({ open }: { open: (id: string) => void }) {
  const { t, tb, lang } = useT();
  const cases = useApp((s) => s.cases);
  const [f, setF] = useState<'all' | 'triage' | 'immediate' | 'waiting' | 'org'>('all');
  const [logOpen, setLogOpen] = useState(false);
  const urg = (c: CaseFile) => c.human?.urgency ?? c.ai.urgency;
  const list = useMemo(
    () =>
      cases
        .filter((c) =>
          f === 'all' ? c.status !== 'closed'
            : f === 'triage' ? !c.human
            : f === 'immediate' ? urg(c) === 'immediate'
            : f === 'waiting' ? c.status === 'awaiting_reporter'
            : ['org_notified', 'org_responded', 'outcome_recorded'].includes(c.status),
        )
        .sort((a, b) => Number(!!a.human) - Number(!!b.human) || URG_RANK[urg(a)] - URG_RANK[urg(b)] || b.createdAt - a.createdAt),
    [cases, f],
  );
  const stats = [
    { l: t('Need first review', 'මුල් සමාලෝචනය අවශ්‍ය'), v: cases.filter((c) => !c.human).length, i: Inbox },
    { l: t('Immediate', 'වහාම'), v: cases.filter((c) => urg(c) === 'immediate' && c.status !== 'closed').length, i: Siren },
    { l: t('Waiting for reporter', 'පැමිණිලිකරුගේ පිළිතුරට'), v: cases.filter((c) => c.status === 'awaiting_reporter').length, i: MessageSquare },
    { l: t('With organisations', 'ආයතන සමඟ'), v: cases.filter((c) => ['org_notified', 'org_responded'].includes(c.status)).length, i: Building2 },
  ];
  return (
    <>
      <PageHead
        title={t('Case queue', 'ගොනු පෝලිම')}
        sub={t('New reports are sorted by suggested urgency. Suggestions are a starting point; your assessment is what counts.', 'නව පැමිණිලි යෝජිත හදිසි බව අනුව පෙළගස්වා ඇත. යෝජනා ආරම්භයක් පමණි; වැදගත් වන්නේ ඔබේ තක්සේරුවයි.')}
        right={<Button icon={<Plus size={18} />} onClick={() => setLogOpen(true)}>{t('Log a case', 'ගොනුවක් ඇතුළත් කරන්න')}</Button>}
      />
      {logOpen && <LogCaseModal onClose={() => setLogOpen(false)} onCreated={open} />}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.l} className="rounded-card bg-surface border border-line px-4 py-3 flex items-center gap-3">
            <s.i size={20} className="text-teal-deep shrink-0" />
            <span className="text-[24px] font-bold tabular-nums">{s.v}</span>
            <span className="text-sm text-muted leading-tight">{s.l}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-3" role="tablist">
        {([['all', t('Open', 'විවෘත')], ['triage', t('Needs first review', 'මුල් සමාලෝචනය අවශ්‍ය')], ['immediate', t('Immediate', 'වහාම')], ['waiting', t('Waiting for reporter', 'පිළිතුරට')], ['org', t('Organisation stage', 'ආයතන අදියර')]] as const).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={f === k} onClick={() => setF(k)} className={cx('h-9 px-3.5 rounded-full text-sm font-semibold border', f === k ? 'bg-navy text-white border-navy' : 'bg-surface border-line text-ink')}>{l}</button>
        ))}
      </div>
      <div className="rounded-card bg-surface border border-line overflow-x-auto thin-scroll">
        <table className="w-full text-[14px] min-w-[860px]">
          <thead className="text-left text-muted text-[13px] border-b border-line">
            <tr>
              {[t('Reference', 'යොමුව'), t('Received', 'ලැබුණේ'), t('Category', 'වර්ගය'), t('Urgency', 'හදිසි බව'), t('Privacy', 'පෞද්ගලිකත්වය'), t('Organisation', 'ආයතනය'), t('Status', 'තත්ත්වය')].map((h) => (
                <th key={h} className="font-semibold px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.map((c) => {
              const u = urg(c);
              const cat = c.human?.category ?? c.ai.category;
              const youFlags = c.ai.privacyFlags.filter((x) => FLAG_COPY[x.kind].risk === 'you').length;
              return (
                <tr key={c.id} onClick={() => open(c.id)} className={cx('cursor-pointer hover:bg-mist', c.fresh && 'bg-teal-50/60')}>
                  <td className="px-4 py-3">
                    <button onClick={(e) => { e.stopPropagation(); open(c.id); }} className="font-mono font-semibold text-navy hover:underline">{c.ref}</button>
                    <div className="flex gap-1 mt-0.5">
                      {c.fresh && <Pill tone="teal">{t('New', 'නව')}</Pill>}
                      {c.source && c.source !== 'app' && <Pill tone="grey"><PhoneCall size={11} /> {tb(SOURCE[c.source])}</Pill>}
                      {c.reviewerUnread > 0 && <Pill tone="navy"><MessageSquare size={12} /> {c.reviewerUnread}</Pill>}
                      {c.retaliation && <Pill tone="sos">{t('Retaliation', 'පළිගැනීම')}</Pill>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted whitespace-nowrap">{ago(c.createdAt, lang)}</td>
                  <td className="px-4 py-3">
                    {tb(CATEGORY[cat])}
                    {!c.human && <span className="flex items-center gap-1 text-[12px] text-muted"><Bot size={12} /> {t('AI suggestion', 'AI යෝජනාව')}</span>}
                  </td>
                  <td className="px-4 py-3"><Pill tone={URG_TONE[u]}>{tb(URGENCY[u])}</Pill></td>
                  <td className="px-4 py-3">{youFlags ? <span className="text-warn font-semibold flex items-center gap-1"><TriangleAlert size={14} /> {youFlags}</span> : <span className="text-muted">—</span>}</td>
                  <td className="px-4 py-3">{tb(orgById(c.orgId)?.name) || <span className="text-muted">{t('Not named', 'නම් කර නැත')}</span>}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{tb(STATUS[c.status])}</td>
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-muted">{t('Nothing here. Pick another filter.', 'මෙහි කිසිවක් නැත. වෙනත් පෙරහනක් තෝරන්න.')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Redacted({ c, reveal }: { c: CaseFile; reveal: boolean }) {
  const { tb } = useT();
  if (reveal) return <p className="whitespace-pre-wrap leading-relaxed">{c.description}</p>;
  const parts: React.ReactNode[] = [];
  let i = 0;
  c.ai.privacyFlags.forEach((f) => {
    if (f.start > i) parts.push(c.description.slice(i, f.start));
    parts.push(<span key={f.id} className="rounded bg-ink/80 text-white px-1.5 text-[13px] font-semibold mx-0.5" title={tb(FLAG_COPY[f.kind].title)}>{tb(FLAG_COPY[f.kind].title).toLowerCase()}</span>);
    i = f.end;
  });
  parts.push(c.description.slice(i));
  return <p className="whitespace-pre-wrap leading-relaxed">{parts}</p>;
}

function CaseDetail({ id, back }: { id: string; back: () => void }) {
  const { t, tb, lang } = useT();
  const c = useApp((s) => s.cases.find((x) => x.id === id));
  const notice = useApp((s) => s.notices.find((n) => n.id === c?.noticeId));
  const a = useApp();
  const [reveal, setReveal] = useState(false);
  const [askReveal, setAskReveal] = useState(false);
  const [override, setOverride] = useState(false);
  const [cat, setCat] = useState<Category>(c?.ai.category ?? 'other');
  const [urg, setUrg] = useState<Urgency>(c?.ai.urgency ?? 'standard');
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [outcomeOpen, setOutcomeOpen] = useState(false);
  const [referOpen, setReferOpen] = useState<null | '1938' | '109'>(null);
  const [delOpen, setDelOpen] = useState(false);
  if (!c) return null;
  const org = orgById(c.orgId);
  const u = c.human?.urgency ?? c.ai.urgency;
  const triaged = !!c.human;

  return (
    <>
      <button onClick={back} className="h-10 -ml-2 pl-1.5 pr-3 rounded-full flex items-center gap-1 text-navy font-semibold hover:bg-navy-50 mb-2"><ArrowLeft size={20} /> {t('Queue', 'පෝලිම')}</button>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-5">
        <h1 className="text-[26px] font-bold font-mono tracking-tight">{c.ref}</h1>
        {c.fresh && <Pill tone="teal">{t('New', 'නව')}</Pill>}
        {c.source && c.source !== 'app' && <Pill tone="grey"><PhoneCall size={12} /> {tb(SOURCE[c.source])}</Pill>}
        <span className="text-muted text-sm">{t('Received', 'ලැබුණේ')} {fmtDate(c.createdAt, lang, true)} · {t('Assigned to', 'පවරා ඇත්තේ')} {c.assignedTo}</span>
      </div>

      {/* Three separate fields — urgency is never a finding */}
      <div className="grid md:grid-cols-3 gap-3">
        <FieldCard icon={Gauge} label={t('Urgency', 'හදිසි බව')} caption={t('How fast we act', 'අප කෙතරම් ඉක්මනින් ක්‍රියා කරනවාද')}>
          <Pill tone={URG_TONE[u]} className="text-[14px]">{tb(URGENCY[u])}</Pill>
          {!triaged && <span className="text-[12px] text-muted ml-2">{t('suggested', 'යෝජිත')}</span>}
        </FieldCard>
        <FieldCard icon={ShieldCheck} label={t('Verification', 'තහවුරු කිරීම')} caption={t('What has been independently established', 'ස්වාධීනව තහවුරු වූ දේ')}>
          <select value={c.verification} onChange={(e) => a.setVerification(c.id, e.target.value as Verification)} className="h-10 rounded-[10px] border border-line px-2 bg-surface font-semibold text-[14px] w-full" aria-label={t('Verification status', 'තහවුරු කිරීමේ තත්ත්වය')}>
            {(Object.keys(VERIFICATION) as Verification[]).map((k) => <option key={k} value={k}>{tb(VERIFICATION[k])}</option>)}
          </select>
        </FieldCard>
        <FieldCard icon={ClipboardList} label={t('Case status', 'ගොනුවේ තත්ත්වය')} caption={t('Where it is in the process', 'ක්‍රියාවලියේ ඇති ස්ථානය')}>
          <select value={c.status} onChange={(e) => a.setStatus(c.id, e.target.value as CaseStatus)} className="h-10 rounded-[10px] border border-line px-2 bg-surface font-semibold text-[14px] w-full" aria-label={t('Case status', 'ගොනුවේ තත්ත්වය')}>
            {(Object.keys(STATUS) as CaseStatus[]).map((k) => <option key={k} value={k}>{tb(STATUS[k])}</option>)}
          </select>
        </FieldCard>
      </div>
      <p className="text-[13px] text-muted mt-2 mb-6 flex gap-1.5"><Lock size={14} className="mt-0.5" />{t('Urgency describes how quickly to act. It does not mean anyone has been found responsible.', 'හදිසි බව යනු කෙතරම් ඉක්මනින් ක්‍රියා කළ යුතුද යන්නයි. එයින් කිසිවෙකු වගකිව යුතු බව අදහස් නොවේ.')}</p>

      <div className="grid lg:grid-cols-[1fr_380px] gap-5 items-start">
        <div className="space-y-5 min-w-0">
          <Panel
            title={<><FileText size={18} className="text-teal-deep" /> {t('Report', 'පැමිණිල්ල')}</>}
            right={
              <Button size="sm" variant="secondary" icon={reveal ? <EyeOff size={15} /> : <Eye size={15} />} onClick={() => (reveal ? setReveal(false) : setAskReveal(true))}>
                {reveal ? t('Hide details', 'විස්තර සඟවන්න') : t('Reveal identifying details', 'හඳුනාගැනීමේ විස්තර පෙන්වන්න')}
              </Button>
            }
          >
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[14px] mb-4">
              {[
                [t('Reported as', 'වර්ගය'), tb(CATEGORY[c.category])],
                [t('Place', 'ස්ථානය'), `${tb(PLACE[c.placeType])}${org ? ' · ' + tb(org.name) : ''}`],
                [t('When', 'කවදාද'), `${tb(WHEN[c.when])}${c.ongoing ? ' · ' + t('ongoing', 'දිගටම') : ''}`],
                [t('Contact', 'සම්බන්ධතාව'), c.contact === 'messages' ? t('In-app only', 'යෙදුම තුළ පමණි') : c.contact === 'counsellor' ? t('Counsellor may call', 'උපදේශක ඇමතිය හැක') : t('No contact', 'සම්බන්ධ නොවන්න')],
              ].map(([k, v]) => (
                <div key={k}><dt className="text-muted text-[12px] font-semibold">{k}</dt><dd className="font-semibold">{v}</dd></div>
              ))}
            </dl>
            <div className="rounded-xl bg-mist border border-line p-4 text-[15px]"><Redacted c={c} reveal={reveal} /></div>
            {c.wantsSupport && <p className="mt-3 text-sm flex items-center gap-1.5 text-teal-deep font-semibold"><HeartHandshake size={16} /> {t('Reporter asked for support as well as action.', 'පැමිණිලිකාරිය ක්‍රියාමාර්ගයට අමතරව සහායද ඉල්ලා ඇත.')}</p>}
            {c.evidence.length > 0 && (
              <ul className="mt-4 grid sm:grid-cols-2 gap-2">
                {c.evidence.map((e) => (
                  <li key={e.id} className="flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm">
                    <Paperclip size={16} className="text-muted" /> <span className="flex-1 truncate font-semibold">{e.name}</span>
                    <span className="text-[12px] text-muted flex items-center gap-1"><Lock size={12} /> {t('logged', 'සටහන් වේ')}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <MessagesPanel c={c} />

          <Panel title={<><ScrollText size={18} className="text-teal-deep" /> {t('Case history', 'ගොනු ඉතිහාසය')}</>}>
            <Thread compact steps={c.timeline.map((e, i) => ({
              key: e.id, state: i === c.timeline.length - 1 && c.status !== 'closed' ? 'current' : 'done',
              title: <span>{tb(e.label)} {!e.reporterVisible && <Pill tone="grey" className="ml-1">{t('internal', 'අභ්‍යන්තර')}</Pill>}</span>,
              when: fmtDate(e.at, lang, true),
            }))} />
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title={<><Sparkles size={18} className="text-teal-deep" /> {t('AI assistance', 'AI සහාය')}</>} right={<Pill tone="grey">{t('Suggestion only', 'යෝජනාවක් පමණි')}</Pill>}>
            <div className="grid grid-cols-2 gap-3 text-[14px]">
              <div><p className="text-muted text-[12px] font-semibold">{t('Category', 'වර්ගය')}</p><p className="font-bold">{tb(CATEGORY[c.ai.category])}</p>{c.ai.secondary && <p className="text-[12px] text-muted">+ {tb(CATEGORY[c.ai.secondary])}</p>}</div>
              <div><p className="text-muted text-[12px] font-semibold">{t('Urgency', 'හදිසි බව')}</p><Pill tone={URG_TONE[c.ai.urgency]}>{tb(URGENCY[c.ai.urgency])}</Pill></div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-[12px] text-muted font-semibold"><span>{t('Confidence', 'විශ්වාසය')}</span><span>{Math.round(c.ai.confidence * 100)}%</span></div>
              <div className="h-1.5 rounded-full bg-line mt-1"><div className="h-full rounded-full bg-teal" style={{ width: `${c.ai.confidence * 100}%` }} /></div>
            </div>
            <p className="text-[12px] text-muted font-semibold mt-4 mb-1">{t('Why', 'හේතු')}</p>
            <ul className="space-y-1 text-[14px]">
              {c.ai.reasons.map((r) => <li key={r.en} className="flex gap-2"><span className="text-teal-deep">•</span>{tb(r)}</li>)}
              {!c.ai.reasons.length && <li className="text-muted">{t('No strong signals found.', 'ප්‍රබල සංඥා හමු නොවීය.')}</li>}
            </ul>
            {c.ai.matched.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">{c.ai.matched.slice(0, 8).map((m) => <mark key={m} className="kw text-[13px]">{m}</mark>)}</div>
            )}
            {c.ai.privacyFlags.length > 0 && (
              <p className="mt-3 text-[14px] flex gap-2 text-warn"><TriangleAlert size={16} className="shrink-0 mt-0.5" />{t(`${c.ai.privacyFlags.length} identifying detail(s) hidden by default`, `හඳුනාගැනීමේ විස්තර ${c.ai.privacyFlags.length}ක් පෙරනිමියෙන් සඟවා ඇත`)}</p>
            )}
            {c.ai.duplicateOf && (
              <p className="mt-2 text-[14px] flex gap-2"><Link2 size={16} className="shrink-0 mt-0.5 text-navy" /><span>{t('Possibly related to', 'සම්බන්ධ විය හැකි')} <span className="font-mono font-semibold whitespace-nowrap">{c.ai.duplicateOf}</span> <span className="text-muted">({t('same organisation, 30 days', 'එකම ආයතනය, දින 30')})</span></span></p>
            )}

            <div className="border-t border-line mt-4 pt-4">
              {triaged ? (
                <p className="text-[14px] flex gap-2 text-ok font-semibold"><CheckCircle2 size={18} className="shrink-0" />
                  {c.human!.overridden ? t(`Changed by ${c.human!.by}: ${CATEGORY[c.human!.category].en}, ${URGENCY[c.human!.urgency].en}`, `${c.human!.by} වෙනස් කළා: ${CATEGORY[c.human!.category].si}, ${URGENCY[c.human!.urgency].si}`) : t(`Confirmed by ${c.human!.by}`, `${c.human!.by} තහවුරු කළා`)}
                </p>
              ) : override ? (
                <div className="space-y-2">
                  <select value={cat} onChange={(e) => setCat(e.target.value as Category)} className={cx(inputCls, 'min-h-10 text-[14px]')} aria-label={t('Category', 'වර්ගය')}>
                    {(Object.keys(CATEGORY) as Category[]).map((k) => <option key={k} value={k}>{tb(CATEGORY[k])}</option>)}
                  </select>
                  <select value={urg} onChange={(e) => setUrg(e.target.value as Urgency)} className={cx(inputCls, 'min-h-10 text-[14px]')} aria-label={t('Urgency', 'හදිසි බව')}>
                    {(Object.keys(URGENCY) as Urgency[]).map((k) => <option key={k} value={k}>{tb(URGENCY[k])}</option>)}
                  </select>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => { a.confirmTriage(c.id, cat, urg); setOverride(false); toast(t('Your assessment is saved', 'ඔබේ තක්සේරුව සුරැකුණා')); }}>{t('Save my assessment', 'මගේ තක්සේරුව සුරකින්න')}</Button>
                    <Button size="sm" variant="ghost" onClick={() => setOverride(false)}>{t('Cancel', 'අවලංගු')}</Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" icon={<CheckCircle2 size={15} />} onClick={() => { a.confirmTriage(c.id, c.ai.category, c.ai.urgency); toast(t('Suggestion confirmed', 'යෝජනාව තහවුරු කළා')); }}>{t('Confirm', 'තහවුරු කරන්න')}</Button>
                  <Button size="sm" variant="secondary" onClick={() => setOverride(true)}>{t('Change', 'වෙනස් කරන්න')}</Button>
                </div>
              )}
            </div>
          </Panel>

          <Panel title={<><ShieldAlert size={18} className="text-teal-deep" /> {t('Next steps', 'ඊළඟ පියවර')}</>}>
            <div className="grid gap-2">
              <Button variant="secondary" icon={<HeartHandshake size={17} />} disabled={!triaged} onClick={() => setReferOpen('1938')}>{t('Arrange support · 1938', 'සහාය සලසන්න · 1938')}</Button>
              <Button variant="secondary" icon={<Siren size={17} />} disabled={!triaged} onClick={() => setReferOpen('109')}>{t('Refer to police · 109', 'පොලිසියට යොමු කරන්න · 109')}</Button>
              <Button icon={<Megaphone size={17} />} disabled={!triaged || !c.orgId || !!c.noticeId} onClick={() => setNoticeOpen(true)}>{t('Prepare organisation notice', 'ආයතන නිවේදනය සකසන්න')}</Button>
              {notice?.status === 'responded' && <Button variant="teal" icon={<ClipboardList size={17} />} onClick={() => setOutcomeOpen(true)}>{t('Review response & record outcome', 'පිළිතුර සලකා ප්‍රතිඵලය සටහන් කරන්න')}</Button>}
              {notice?.status === 'verified' && notice.publication === 'none' && (
                <Button variant="teal" icon={<Stamp size={17} />} onClick={() => { a.requestPublication(notice.id); toast(t('Sent for separate publication approval', 'වෙනම ප්‍රකාශන අනුමැතියට යැව්වා')); }}>{t('Send for publication approval', 'ප්‍රකාශන අනුමැතියට යවන්න')}</Button>
              )}
              {notice?.publication === 'pending' && <p className="text-sm text-muted flex gap-1.5"><Stamp size={15} className="mt-0.5" />{t('Waiting for the publication officer (P-02).', 'ප්‍රකාශන නිලධාරියා (P-02) බලාපොරොත්තුවෙන්.')}</p>}
              {notice?.publication === 'approved' && <p className="text-sm text-ok font-semibold flex gap-1.5"><CheckCircle2 size={15} className="mt-0.5" />{t('Published to the directory.', 'නාමාවලියේ ප්‍රකාශයට පත් කළා.')}</p>}
            </div>
            {!triaged && <p className="text-[13px] text-muted mt-3">{t('Confirm or change the AI suggestion first.', 'පළමුව AI යෝජනාව තහවුරු කරන්න හෝ වෙනස් කරන්න.')}</p>}
            {triaged && !c.orgId && <p className="text-[13px] text-muted mt-3">{t('No organisation named, so no notice can be sent.', 'ආයතනයක් නම් කර නැති බැවින් නිවේදනයක් යැවිය නොහැක.')}</p>}
            {c.source && c.source !== 'app' && (
              <div className="border-t border-line mt-4 pt-4">
                <Button size="sm" variant="ghost" className="text-sos hover:bg-sos-50" icon={<Trash2 size={15} />} onClick={() => setDelOpen(true)}>{t('Delete this logged case', 'ඇතුළත් කළ මෙම ගොනුව මකන්න')}</Button>
                <p className="text-[12px] text-muted mt-1">{t('Only for cases an officer logged by mistake or twice. Reports from the app can’t be deleted by officers.', 'නිලධාරියෙකු වැරදීමකින් හෝ දෙවරක් ඇතුළත් කළ ගොනු සඳහා පමණි. යෙදුමෙන් ලැබෙන පැමිණිලි නිලධාරීන්ට මැකිය නොහැක.')}</p>
              </div>
            )}
            {notice && (
              <div className="mt-4 rounded-xl bg-mist border border-line p-3 text-[14px]">
                <p className="font-semibold flex items-center gap-1.5"><Megaphone size={15} /> {tb(notice.title)}</p>
                <p className="text-muted text-[13px]">{tb(orgById(notice.orgId)?.name)} · {t('due', 'නියමිත')} {fmtDate(notice.dueAt, lang)} · {tb(NOTICE_STATUS[notice.status])}</p>
              </div>
            )}
          </Panel>
        </div>
      </div>

      <Modal open={askReveal} onClose={() => setAskReveal(false)} title={t('Why do you need to see this?', 'මෙය බැලීමට හේතුව කුමක්ද?')} width="max-w-md">
        <p className="text-muted text-[15px] mb-4">{t('Opening identifying details is recorded in the audit trail with your reason.', 'හඳුනාගැනීමේ විස්තර විවෘත කිරීම ඔබේ හේතුව සමඟ විගණන සටහනේ සටහන් වේ.')}</p>
        <div className="grid gap-2">
          {[t('Safety check: risk of immediate harm', 'ආරක්ෂක පරීක්ෂාව: වහාම හානියේ අවදානම'), t('Needed for a referral', 'යොමු කිරීමකට අවශ්‍යයි'), t('Linking related reports', 'සම්බන්ධ පැමිණිලි සම්බන්ධ කිරීම')].map((r) => (
            <Button key={r} variant="secondary" onClick={() => { setReveal(true); setAskReveal(false); a.viewedSensitive(c.ref); toast(t('Access recorded in audit trail', 'ප්‍රවේශය විගණන සටහනේ සටහන් විය'), 'info'); }}>{r}</Button>
          ))}
        </div>
      </Modal>

      <Modal open={!!referOpen} onClose={() => setReferOpen(null)} title={referOpen === '1938' ? t('Arrange support through 1938', '1938 හරහා සහාය සලසන්න') : t('Refer to the police bureau (109)', 'පොලිස් කාර්යාංශයට යොමු කරන්න (109)')} width="max-w-lg"
        footer={<><Button variant="ghost" onClick={() => setReferOpen(null)}>{t('Cancel', 'අවලංගු')}</Button><Button onClick={() => { a.refer(c.id, referOpen!); setReferOpen(null); toast(t('Referral recorded (simulated)', 'යොමු කිරීම සටහන් විය (අනුකරණය)')); }}>{t('Confirm referral', 'යොමු කිරීම තහවුරු කරන්න')}</Button></>}>
        <ul className="space-y-2 text-[15px]">
          <li className="flex gap-2"><CheckCircle2 size={18} className="text-teal-deep shrink-0 mt-0.5" />{t('Only the details needed for this referral are shared.', 'මෙම යොමු කිරීමට අවශ්‍ය විස්තර පමණක් බෙදා ගැනේ.')}</li>
          <li className="flex gap-2"><CheckCircle2 size={18} className="text-teal-deep shrink-0 mt-0.5" />{c.wantsSupport ? t('The reporter asked for support.', 'පැමිණිලිකාරිය සහාය ඉල්ලා ඇත.') : t('The reporter did not ask for support. Message her first unless there is a safety risk.', 'පැමිණිලිකාරිය සහාය ඉල්ලා නැත. ආරක්ෂක අවදානමක් නැත්නම් මුලින්ම ඇයට පණිවිඩයක් යවන්න.')}</li>
          <li className="flex gap-2"><TriangleAlert size={18} className="text-warn shrink-0 mt-0.5" />{t('Demo only: 109 and 1938 are not connected to this prototype. Real referrals need formal agreements.', 'ආදර්ශනය පමණි: 109 හා 1938 මෙම මූලාකෘතියට සම්බන්ධ නැත. සැබෑ යොමු කිරීම්වලට විධිමත් ගිවිසුම් අවශ්‍යයි.')}</li>
        </ul>
      </Modal>

      <Modal open={delOpen} onClose={() => setDelOpen(false)} width="max-w-md" title={t('Delete this logged case?', 'ඇතුළත් කළ මෙම ගොනුව මකන්නද?')}
        footer={<><Button variant="secondary" onClick={() => setDelOpen(false)}>{t('Cancel', 'අවලංගු')}</Button><Button variant="sos" icon={<Trash2 size={16} />} onClick={() => { a.deleteCase(c.id); setDelOpen(false); toast(t('Case deleted. The deletion is in the audit trail.', 'ගොනුව මැකුවා. මැකීම විගණන සටහනේ ඇත.')); back(); }}>{t('Delete case', 'ගොනුව මකන්න')}</Button></>}>
        <p className="text-[15px]"><span className="font-mono font-semibold">{c.ref}</span> · {tb(CATEGORY[c.category])}</p>
        <p className="text-muted mt-2">{t('This removes the case and any notice linked to it. It cannot be undone.', 'මෙය ගොනුව හා එයට සම්බන්ධ ඕනෑම නිවේදනයක් ඉවත් කරයි. එය ආපසු හැරවිය නොහැක.')}</p>
      </Modal>
      {noticeOpen && <NoticeWizard c={c} onClose={() => setNoticeOpen(false)} />}
      {outcomeOpen && notice && <OutcomeModal n={notice} onClose={() => setOutcomeOpen(false)} />}
    </>
  );
}

function FieldCard({ icon: I, label, caption, children }: { icon: typeof Gauge; label: string; caption: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card bg-surface border border-line hc-border p-4">
      <p className="flex items-center gap-1.5 text-[13px] font-bold text-navy"><I size={15} /> {label}</p>
      <p className="text-[12px] text-muted mb-2">{caption}</p>
      <div className="flex items-center">{children}</div>
    </div>
  );
}

function MessagesPanel({ c }: { c: CaseFile }) {
  const { t, tb, lang } = useT();
  const send = useApp((s) => s.reviewerMessage);
  const read = useApp((s) => s.markReviewerRead);
  const [text, setText] = useState('');
  const [clar, setClar] = useState(true);
  const templates = [
    t('Thank you for trusting us. Could you tell me roughly how many times this has happened, and over what period?', 'අපව විශ්වාස කළාට ස්තූතියි. මෙය ආසන්න වශයෙන් කී වතාවක්, කොපමණ කාලයක් තුළ සිදු වූවාද කියා කිව හැකිද?'),
    t('Are you safe right now? If not, please call 119.', 'ඔබ දැන් ආරක්ෂිතද? නැත්නම් කරුණාකර 119 අමතන්න.'),
    t('Would you be comfortable if we ask the organisation to act, without sharing who you are?', 'ඔබ කවුදැයි නොකියා, ක්‍රියා කරන ලෙස ආයතනයෙන් ඉල්ලීමට ඔබ කැමතිද?'),
  ];
  return (
    <Panel title={<><MessageSquare size={18} className="text-teal-deep" /> {t('Secure messages', 'ආරක්ෂිත පණිවිඩ')}</>} right={c.reviewerUnread > 0 ? <Button size="sm" variant="ghost" onClick={() => read(c.id)}>{t('Mark read', 'කියවූ ලෙස සලකුණු')}</Button> : undefined}>
      <div className="space-y-2.5 max-h-80 overflow-y-auto thin-scroll pr-1">
        {c.messages.map((m) => (
          <div key={m.id} className={cx('flex', m.from === 'reviewer' ? 'justify-end' : 'justify-start')}>
            <div className={cx('max-w-[80%] rounded-2xl px-3.5 py-2 text-[14px]', m.from === 'reviewer' ? 'bg-navy text-white rounded-br-md' : m.from === 'system' ? 'bg-teal-50 rounded-bl-md' : 'bg-mist border border-line rounded-bl-md')}>
              <p className={cx('text-[11px] font-bold mb-0.5', m.from === 'reviewer' ? 'text-white/70' : 'text-muted')}>{m.from === 'reviewer' ? 'R-07' : m.from === 'system' ? t('Automatic', 'ස්වයංක්‍රීය') : t('Reporter', 'පැමිණිලිකරු')} · {ago(m.at, lang)}</p>
              <p className="whitespace-pre-wrap">{tb(m.text)}</p>
            </div>
          </div>
        ))}
        {!c.messages.length && <p className="text-muted text-sm">{t('No messages yet.', 'තවම පණිවිඩ නැත.')}</p>}
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar mt-3 pb-1">
        {templates.map((x, i) => <button key={i} onClick={() => setText(x)} className="shrink-0 max-w-[260px] truncate h-8 px-3 rounded-full border border-line text-[13px] text-navy bg-mist">{x}</button>)}
      </div>
      {c.contact === 'none' && <p className="text-[13px] text-warn mt-2">{t('Reporter chose no contact. She will only see this if she checks her report.', 'පැමිණිලිකාරිය සම්බන්ධ නොවීමට තෝරා ඇත. ඇය පැමිණිල්ල බැලුවහොත් පමණක් මෙය දකියි.')}</p>}
      <form onSubmit={(e) => { e.preventDefault(); if (!text.trim()) return; send(c.id, text.trim(), clar); setText(''); toast(clar ? t('Question sent. Case is waiting for reporter.', 'ප්‍රශ්නය යැව්වා. පිළිතුර බලාපොරොත්තුවෙන්.') : t('Message sent', 'පණිවිඩය යැව්වා')); }} className="mt-2">
        <label htmlFor="rv-msg" className="sr-only">{t('Message to reporter', 'පැමිණිලිකරුට පණිවිඩය')}</label>
        <textarea id="rv-msg" rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder={t('Write to the reporter…', 'පැමිණිලිකරුට ලියන්න…')} className={cx(inputCls, 'py-2.5 resize-none text-[15px]')} />
        <div className="flex items-center justify-between mt-2 gap-2">
          <label className="flex items-center gap-2 text-[14px] cursor-pointer"><input type="checkbox" checked={clar} onChange={(e) => setClar(e.target.checked)} className="h-4 w-4 accent-[rgb(var(--navy))]" />{t('This is a clarification request', 'මෙය පැහැදිලි කිරීමේ ඉල්ලීමකි')}</label>
          <Button size="sm" type="submit" icon={<Send size={15} />} disabled={!text.trim()}>{t('Send', 'යවන්න')}</Button>
        </div>
      </form>
    </Panel>
  );
}

function NoticeWizard({ c, onClose }: { c: CaseFile; onClose: () => void }) {
  const { t, tb, lang } = useT();
  const issue = useApp((s) => s.issueNotice);
  const org = orgById(c.orgId)!;
  const [step, setStep] = useState(0);
  const [checks, setChecks] = useState<boolean[]>([false, false, false, false]);
  const cat = c.human?.category ?? c.category;
  const [title, setTitle] = useState({
    harassment: { en: 'Preventing sexual harassment at work', si: 'සේවා ස්ථානයේ ලිංගික හිරිහැර වැළැක්වීම' },
    intimidation: { en: 'Protection from intimidation', si: 'බිය ගැන්වීම්වලින් ආරක්ෂාව' },
    discrimination: { en: 'Fair treatment of women staff', si: 'කාන්තා කාර්ය මණ්ඩලයට සාධාරණ ලෙස සැලකීම' },
    physical: { en: 'Physical safety of staff', si: 'කාර්ය මණ්ඩලයේ ශාරීරික ආරක්ෂාව' },
    unsafe: { en: 'Safe premises for women', si: 'කාන්තාවන්ට ආරක්ෂිත පරිශ්‍ර' },
    other: { en: 'Safeguarding concern', si: 'ආරක්ෂණ ගැටලුවක්' },
  }[cat]);
  const summary = {
    en: `A concern was raised about ${CATEGORY[cat].en.toLowerCase()} involving a person in a supervisory role, reported as ${c.ongoing ? 'ongoing' : 'recent'}. Details that could identify the person who raised it have been removed.`,
    si: `අධීක්ෂණ තනතුරක සිටින පුද්ගලයෙකු සම්බන්ධ ${CATEGORY[cat].si} පිළිබඳ ගැටලුවක් ${c.ongoing ? 'දිගටම සිදුවන' : 'මෑත'} බව වාර්තා විය. එය මතු කළ පුද්ගලයා හඳුනාගත හැකි විස්තර ඉවත් කර ඇත.`,
  };
  const SUGGEST = [
    { en: 'Appoint an independent anti-harassment committee', si: 'ස්වාධීන හිරිහැර විරෝධී කමිටුවක් පත් කිරීම' },
    { en: 'Train all supervisors within 30 days', si: 'දින 30ක් ඇතුළත සියලු අධීක්ෂකයින් පුහුණු කිරීම' },
    { en: 'Make sure no one works alone in isolated areas', si: 'හුදෙකලා ප්‍රදේශවල කිසිවෙකු තනිව වැඩ නොකරන බව සහතික කිරීම' },
    { en: 'Confirm in writing that retaliation is prohibited', si: 'පළිගැනීම තහනම් බව ලිඛිතව තහවුරු කිරීම' },
  ];
  const [req, setReq] = useState<boolean[]>([true, true, true, true]);
  const [due, setDue] = useState(14);
  const checkList = [
    t('Notice contains no name, contact or unique detail of the reporter', 'නිවේදනයේ පැමිණිලිකරුගේ නම, සම්බන්ධතා හෝ අනන්‍ය විස්තර නැත'),
    t('Retaliation risk assessed and reporter informed before sending', 'පළිගැනීමේ අවදානම තක්සේරු කර, යැවීමට පෙර පැමිණිලිකරුට දැනුම් දුන්නා'),
    t('Reporter agreed to the organisation being contacted', 'ආයතනය හා සම්බන්ධ වීමට පැමිණිලිකරු එකඟ විය'),
    t('Issuing authority confirmed (simulated for this demo)', 'නිකුත් කරන අධිකාරිය තහවුරුයි (මෙම ආදර්ශනයට අනුකරණය කළා)'),
  ];
  const required = SUGGEST.filter((_, i) => req[i]);
  const steps = [t('Safeguards', 'ආරක්ෂණ'), t('Write notice', 'නිවේදනය ලියන්න'), t('Preview', 'පෙරදසුන')];
  return (
    <Modal open onClose={onClose} width="max-w-3xl" title={<span className="flex items-center gap-2"><Megaphone size={20} className="text-teal-deep" />{t('Notice to', 'නිවේදනය:')} {tb(org.name)}</span>}
      footer={
        <>
          {step > 0 && <Button variant="ghost" onClick={() => setStep(step - 1)}>{t('Back', 'ආපසු')}</Button>}
          {step < 2 ? (
            <Button disabled={step === 0 && checks.some((x) => !x)} onClick={() => setStep(step + 1)}>{t('Continue', 'ඉදිරියට')}</Button>
          ) : (
            <Button icon={<Send size={16} />} onClick={() => { issue(c.id, { title, summary, required, dueAt: Date.now() + due * D }); toast(t('Notice issued to the organisation', 'ආයතනයට නිවේදනය නිකුත් කළා')); onClose(); }}>{t('Issue notice', 'නිවේදනය නිකුත් කරන්න')}</Button>
          )}
        </>
      }>
      <ol className="flex gap-2 mb-5">
        {steps.map((s, i) => (
          <li key={s} className={cx('flex-1 rounded-full h-9 px-3 flex items-center gap-2 text-[13px] font-semibold', i === step ? 'bg-navy text-white' : i < step ? 'bg-teal-50 text-teal-deep' : 'bg-mist text-muted')}>
            <span className="h-5 w-5 rounded-full bg-white/20 grid place-items-center text-[11px]">{i < step ? '✓' : i + 1}</span>{s}
          </li>
        ))}
      </ol>
      {step === 0 && (
        <>
          <p className="text-muted mb-3">{t('Every box must be ticked before a notice can be written.', 'නිවේදනයක් ලිවීමට පෙර සියලු කොටු සලකුණු කළ යුතුය.')}</p>
          <div className="space-y-2">
            {checkList.map((l, i) => (
              <label key={i} className={cx('flex gap-3 items-start rounded-xl border p-3.5 cursor-pointer', checks[i] ? 'border-teal bg-teal-50' : 'border-line')}>
                <input type="checkbox" checked={checks[i]} onChange={() => setChecks(checks.map((x, j) => (j === i ? !x : x)))} className="h-5 w-5 mt-0.5 accent-[rgb(var(--teal-deep))]" />
                <span className="text-[15px]">{l}</span>
              </label>
            ))}
          </div>
        </>
      )}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="font-semibold block mb-1.5" htmlFor="nt">{t('Title', 'මාතෘකාව')}</label>
            <input id="nt" value={tb(title)} onChange={(e) => setTitle({ ...title, [lang]: e.target.value })} className={inputCls} />
          </div>
          <div>
            <p className="font-semibold mb-1.5">{t('What the organisation will be told', 'ආයතනයට කියන දේ')}</p>
            <p className="rounded-xl bg-mist border border-line p-3.5 text-[15px]">{tb(summary)}</p>
          </div>
          <div>
            <p className="font-semibold mb-1.5">{t('Required actions', 'අවශ්‍ය ක්‍රියාමාර්ග')}</p>
            <div className="space-y-1.5">
              {SUGGEST.map((s, i) => (
                <label key={i} className="flex gap-3 items-center text-[15px] cursor-pointer py-1">
                  <input type="checkbox" checked={req[i]} onChange={() => setReq(req.map((x, j) => (j === i ? !x : x)))} className="h-5 w-5 accent-[rgb(var(--navy))]" />{tb(s)}
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="font-semibold mb-1.5">{t('Response due in', 'පිළිතුරු දීමට කාලය')}</p>
            <div className="flex gap-2">{[14, 30].map((d) => <button key={d} onClick={() => setDue(d)} className={cx('h-10 px-4 rounded-full border font-semibold text-sm', due === d ? 'bg-navy text-white border-navy' : 'border-line')}>{t(`${d} days`, `දින ${d}`)}</button>)}</div>
          </div>
        </div>
      )}
      {step === 2 && (
        <>
          <p className="text-muted mb-3 flex items-center gap-1.5"><Users size={16} />{t('This is exactly what the organisation will see.', 'ආයතනය දකින්නේ හරියටම මෙයයි.')}</p>
          <div className="rounded-card border-2 border-navy p-5">
            <p className="text-[13px] text-muted">{t('Independent Safeguarding Panel (fictional)', 'ස්වාධීන ආරක්ෂණ මණ්ඩලය (කල්පිත)')} · {fmtDate(Date.now(), lang)}</p>
            <h3 className="text-xl font-bold mt-1">{tb(title)}</h3>
            <p className="mt-3 text-[15px]">{tb(summary)}</p>
            <p className="font-semibold mt-4 mb-1">{t('You are asked to', 'ඔබෙන් ඉල්ලා සිටින්නේ')}</p>
            <ul className="list-disc pl-5 space-y-1 text-[15px]">{required.map((r) => <li key={r.en}>{tb(r)}</li>)}</ul>
            <p className="mt-4 text-[14px] rounded-xl bg-warn-50 text-ink p-3"><strong>{t('Retaliation is prohibited.', 'පළිගැනීම තහනම්.')}</strong> {t('Any action against anyone believed to have raised this concern will be treated as a separate, serious matter.', 'මෙම ගැටලුව මතු කළ යැයි සැලකෙන ඕනෑම අයෙකුට එරෙහි ක්‍රියාවක් වෙනම බරපතළ කරුණක් ලෙස සලකනු ලැබේ.')}</p>
            <p className="mt-3 text-[14px] text-muted">{t('Respond within', 'පිළිතුරු දිය යුතු කාලය')} {due} {t('days', 'දින')}.</p>
          </div>
        </>
      )}
    </Modal>
  );
}

function OutcomeModal({ n, onClose }: { n: Notice; onClose: () => void }) {
  const { t, tb } = useT();
  const record = useApp((s) => s.recordOutcome);
  const [v, setV] = useState<Verification>('corroborated');
  const [ok, setOk] = useState<boolean[]>(n.response?.actions.map(() => true) ?? []);
  const outcome = {
    en: 'The organisation’s plan was reviewed against its evidence. Committee appointed and supervisor training scheduled; follow-up check in 3 months.',
    si: 'ආයතනයේ සැලැස්ම එහි සාක්ෂි සමඟ සලකා බැලුවා. කමිටුව පත් කර, අධීක්ෂක පුහුණුව සැලසුම් කර ඇත; මාස 3කින් නැවත පරීක්ෂා කෙරේ.',
  };
  return (
    <Modal open onClose={onClose} width="max-w-3xl" title={t('Review response and record outcome', 'පිළිතුර සලකා ප්‍රතිඵලය සටහන් කරන්න')}
      footer={<><Button variant="ghost" onClick={onClose}>{t('Cancel', 'අවලංගු')}</Button><Button onClick={() => { record(n.id, outcome, v); toast(t('Outcome recorded. Reporter can see it.', 'ප්‍රතිඵලය සටහන් විය. පැමිණිලිකාරියට දැකිය හැකියි.')); onClose(); }}>{t('Record verified outcome', 'තහවුරු කළ ප්‍රතිඵලය සටහන් කරන්න')}</Button></>}>
      <p className="font-semibold">{t('Organisation’s explanation', 'ආයතනයේ පැහැදිලි කිරීම')}</p>
      <p className="rounded-xl bg-mist border border-line p-3.5 text-[15px] mt-1.5">{n.response?.text}</p>
      <p className="font-semibold mt-4 mb-1.5">{t('Corrective actions', 'නිවැරදි කිරීමේ ක්‍රියාමාර්ග')}</p>
      <ul className="space-y-1.5">
        {n.response?.actions.map((a, i) => (
          <li key={a.id} className="flex items-center gap-3 rounded-xl border border-line p-3">
            <input type="checkbox" checked={ok[i]} onChange={() => setOk(ok.map((x, j) => (j === i ? !x : x)))} className="h-5 w-5 accent-[rgb(var(--teal-deep))]" aria-label={t('Accept this action as evidenced', 'මෙම ක්‍රියාව සාක්ෂි සහිතව පිළිගන්න')} />
            <span className="flex-1 text-[15px]">{tb(a.title)}</span>
            <Pill tone={a.status === 'done' ? 'ok' : 'navy'}>{a.status === 'done' ? t('Done', 'අවසන්') : t('Planned', 'සැලසුම්')}</Pill>
          </li>
        ))}
      </ul>
      {!!n.response?.evidence.length && (
        <p className="text-sm text-muted mt-2 flex flex-wrap gap-2">{n.response.evidence.map((e) => <span key={e} className="flex items-center gap-1"><Paperclip size={13} />{e}</span>)}</p>
      )}
      <label className="font-semibold block mt-4 mb-1.5" htmlFor="vf">{t('Verification status', 'තහවුරු කිරීමේ තත්ත්වය')}</label>
      <select id="vf" value={v} onChange={(e) => setV(e.target.value as Verification)} className={inputCls}>
        {(Object.keys(VERIFICATION) as Verification[]).map((k) => <option key={k} value={k}>{tb(VERIFICATION[k])}</option>)}
      </select>
      <p className="font-semibold mt-4 mb-1.5">{t('Outcome shared with the reporter', 'පැමිණිලිකාරියට පෙන්වන ප්‍රතිඵලය')}</p>
      <p className="rounded-xl bg-teal-50 p-3.5 text-[15px]">{tb(outcome)}</p>
    </Modal>
  );
}

function Notices({ open }: { open: (caseId: string) => void }) {
  const { t, tb, lang } = useT();
  const notices = useApp((s) => s.notices);
  const edit = useApp((s) => s.editNotice);
  const withdraw = useApp((s) => s.withdrawNotice);
  const [editing, setEditing] = useState<Notice | null>(null);
  const [title, setTitle] = useState('');
  const [days, setDays] = useState(14);
  const [removing, setRemoving] = useState<Notice | null>(null);
  const editable = (n: Notice) => n.status === 'sent' || n.status === 'acknowledged';
  return (
    <>
      <PageHead title={t('Organisation notices', 'ආයතන නිවේදන')} sub={t('Notices are issued only within the authority’s legal powers, after privacy and retaliation checks. They can be edited or withdrawn until the organisation responds.', 'නිවේදන නිකුත් කරන්නේ පෞද්ගලිකත්ව හා පළිගැනීම් පරීක්ෂාවෙන් පසුව, අධිකාරියේ නීතිමය බලතල තුළ පමණි. ආයතනය පිළිතුරු දෙන තුරු සංස්කරණය හෝ ඉවත් කළ හැකිය.')} />
      <div className="rounded-card bg-surface border border-line divide-y divide-line">
        {notices.map((n) => (
          <div key={n.id} className="p-4 md:px-5 flex flex-wrap items-center gap-3">
            <button onClick={() => open(n.caseId)} className="flex-1 min-w-[240px] text-left flex items-center gap-3 group">
              <Megaphone size={20} className="text-teal-deep shrink-0" />
              <span>
                <span className="block font-bold group-hover:underline">{tb(n.title)}</span>
                <span className="block text-sm text-muted">{tb(orgById(n.orgId)?.name)} · {t('issued', 'නිකුත් කළේ')} {fmtDate(n.issuedAt, lang)} · {t('due', 'නියමිත')} {fmtDate(n.dueAt, lang)}</span>
              </span>
            </button>
            <Pill tone={n.status === 'verified' ? 'ok' : n.status === 'responded' ? 'teal' : 'navy'}>{tb(NOTICE_STATUS[n.status])}</Pill>
            {n.publication && n.publication !== 'none' && <Pill tone={n.publication === 'approved' ? 'ok' : 'warn'}>{n.publication === 'approved' ? t('Published', 'ප්‍රකාශිතයි') : n.publication === 'pending' ? t('Awaiting publication approval', 'ප්‍රකාශන අනුමැතියට') : t('Not published', 'ප්‍රකාශ නොකළා')}</Pill>}
            <div className="flex gap-1">
              <button aria-label={t('Edit notice', 'නිවේදනය සංස්කරණය')} title={t('Edit notice', 'නිවේදනය සංස්කරණය')} disabled={!editable(n)} onClick={() => { setEditing(n); setTitle(tb(n.title)); setDays(Math.max(1, Math.round((n.dueAt - Date.now()) / D))); }} className="h-10 w-10 grid place-items-center rounded-full text-navy hover:bg-navy-50 disabled:opacity-30"><PencilLine size={18} /></button>
              <button aria-label={t('Withdraw notice', 'නිවේදනය ඉවත් කරන්න')} title={t('Withdraw notice', 'නිවේදනය ඉවත් කරන්න')} disabled={!editable(n)} onClick={() => setRemoving(n)} className="h-10 w-10 grid place-items-center rounded-full text-sos hover:bg-sos-50 disabled:opacity-30"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
        {notices.length === 0 && <p className="p-8 text-center text-muted">{t('No notices yet.', 'තවම නිවේදන නැත.')}</p>}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} width="max-w-lg" title={t('Edit notice', 'නිවේදනය සංස්කරණය')}
        footer={<><Button variant="secondary" onClick={() => setEditing(null)}>{t('Cancel', 'අවලංගු')}</Button><Button disabled={!title.trim()} onClick={() => { edit(editing!.id, { title: { ...editing!.title, [lang]: title.trim() }, dueAt: Date.now() + days * D }); setEditing(null); toast(t('Notice updated', 'නිවේදනය යාවත්කාලීන කළා')); }}>{t('Save changes', 'වෙනස්කම් සුරකින්න')}</Button></>}>
        <label htmlFor="nt-t" className="font-semibold block mb-1.5">{t('Title', 'මාතෘකාව')}</label>
        <input id="nt-t" value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
        <label htmlFor="nt-d" className="font-semibold block mt-4 mb-1.5">{t('Days left to respond', 'පිළිතුරු දීමට ඉතිරි දින')}</label>
        <input id="nt-d" type="number" min={1} max={90} value={days} onChange={(e) => setDays(Math.max(1, Number(e.target.value) || 1))} className={cx(inputCls, 'max-w-[140px]')} />
        <p className="text-[13px] text-muted mt-3">{t('The organisation sees the change straight away. The edit is recorded in the audit trail.', 'ආයතනයට වෙනස ක්ෂණිකව පෙනේ. සංස්කරණය විගණන සටහනේ සටහන් වේ.')}</p>
      </Modal>
      <Modal open={!!removing} onClose={() => setRemoving(null)} width="max-w-md" title={t('Withdraw this notice?', 'මෙම නිවේදනය ඉවත් කරන්නද?')}
        footer={<><Button variant="secondary" onClick={() => setRemoving(null)}>{t('Keep notice', 'නිවේදනය තබාගන්න')}</Button><Button variant="sos" icon={<Trash2 size={16} />} onClick={() => { withdraw(removing!.id); setRemoving(null); toast(t('Notice withdrawn. The case is back in review.', 'නිවේදනය ඉවත් කළා. ගොනුව නැවත සමාලෝචනයට.')); }}>{t('Withdraw', 'ඉවත් කරන්න')}</Button></>}>
        <p className="font-semibold">{removing && tb(removing.title)}</p>
        <p className="text-muted mt-2">{t('The organisation will no longer see it, and the case goes back to review.', 'ආයතනයට එය තවදුරටත් නොපෙනෙන අතර ගොනුව නැවත සමාලෝචනයට යයි.')}</p>
      </Modal>
    </>
  );
}

function Publication() {
  const { t, tb, lang } = useT();
  const allNotices = useApp((s) => s.notices);
  const notices = allNotices.filter((n) => n.publication && n.publication !== 'none');
  const decide = useApp((s) => s.decidePublication);
  return (
    <>
      <PageHead
        title={t('Publication approval', 'ප්‍රකාශන අනුමැතිය')}
        sub={t('A separate officer decides what can be published. Only official findings and verified fixes, never allegations or anything about the reporter.', 'ප්‍රකාශයට පත් කළ හැකි දේ වෙනම නිලධාරියෙක් තීරණය කරයි. නිල තීන්දු හා තහවුරු කළ නිවැරදි කිරීම් පමණි; චෝදනා හෝ පැමිණිලිකරු ගැන කිසිවක් නොවේ.')}
        right={<Pill tone="navy" className="text-[14px] py-1.5 px-3"><Stamp size={15} /> {t('Signed in as P-02 · Publication officer', 'P-02 ලෙස · ප්‍රකාශන නිලධාරී')}</Pill>}
      />
      {notices.length === 0 && (
        <div className="rounded-card border-2 border-dashed border-line bg-surface p-10 text-center">
          <Stamp size={30} className="mx-auto text-muted" />
          <p className="font-bold mt-2">{t('Nothing waiting for approval', 'අනුමැතියට කිසිවක් නැත')}</p>
          <p className="text-muted">{t('Records arrive here after a reviewer records a verified outcome.', 'සමාලෝචකයෙක් තහවුරු කළ ප්‍රතිඵලයක් සටහන් කළ පසු වාර්තා මෙහි පැමිණේ.')}</p>
        </div>
      )}
      <div className="space-y-4">
        {notices.map((n) => (
          <div key={n.id} className="grid lg:grid-cols-[1fr_320px] gap-4 rounded-card bg-surface border border-line p-5">
            <div>
              <p className="text-[13px] text-muted font-semibold mb-1">{t('Public preview', 'පොදු පෙරදසුන')}</p>
              <div className="rounded-xl border border-line p-4">
                <p className="text-[13px] text-muted">{tb(orgById(n.orgId)?.name)} · {fmtDate(n.issuedAt, lang)} · {tb(n.authority)}</p>
                <p className="font-bold text-lg">{t('Notice', 'නිවේදනය')}: {tb(n.title)}</p>
                <p className="text-[15px] mt-1">{tb(n.summary)}</p>
                {n.response?.actions.map((a) => <p key={a.id} className="text-[14px] mt-1 flex gap-1.5"><CheckCircle2 size={16} className="text-teal-deep mt-0.5" />{tb(a.title)}</p>)}
              </div>
            </div>
            <div>
              <p className="text-[13px] text-muted font-semibold mb-1">{t('Checks', 'පරීක්ෂා')}</p>
              <ul className="space-y-1.5 text-[14px]">
                {[t('Lawful basis to publish (simulated)', 'ප්‍රකාශයට නීතිමය පදනම (අනුකරණය)'), t('No personal data about anyone', 'කිසිවෙකු ගැන පුද්ගලික දත්ත නැත'), t('Organisation had the right to respond', 'ආයතනයට පිළිතුරු දීමේ අයිතිය ලැබුණා'), t('Outcome independently verified', 'ප්‍රතිඵලය ස්වාධීනව තහවුරුයි')].map((x) => (
                  <li key={x} className="flex gap-2"><CheckCircle2 size={17} className="text-ok shrink-0" />{x}</li>
                ))}
              </ul>
              {n.publication === 'pending' ? (
                <div className="flex gap-2 mt-4">
                  <Button icon={<Stamp size={16} />} onClick={() => { decide(n.id, true); toast(t('Approved. Now visible in the public directory.', 'අනුමත කළා. දැන් පොදු නාමාවලියේ දිස් වේ.')); }}>{t('Approve & publish', 'අනුමත කර ප්‍රකාශ කරන්න')}</Button>
                  <Button variant="secondary" onClick={() => decide(n.id, false)}>{t('Decline', 'ප්‍රතික්ෂේප')}</Button>
                </div>
              ) : (
                <Pill tone={n.publication === 'approved' ? 'ok' : 'grey'} className="mt-4">{n.publication === 'approved' ? t('Published', 'ප්‍රකාශිතයි') : t('Declined', 'ප්‍රතික්ෂේපිතයි')}</Pill>
              )}
            </div>
          </div>
        ))}
      </div>
      <PublishedRecords />
    </>
  );
}

function PublishedRecords() {
  const { t, tb, lang } = useT();
  const records = useApp((s) => s.records);
  const orgs = useApp((s) => s.orgs);
  const remove = useApp((s) => s.removeRecord);
  const [del, setDel] = useState<string | null>(null);
  const sorted = [...records].sort((a, b) => b.at - a.at);
  return (
    <section className="mt-10">
      <h2 className="text-[20px] font-bold">{t('Published records', 'ප්‍රකාශිත වාර්තා')}</h2>
      <p className="text-muted mb-3">{t('Everything the public directory shows. Remove a record if a correction or appeal requires it.', 'පොදු නාමාවලිය පෙන්වන සියල්ල. නිවැරදි කිරීමක් හෝ අභියාචනයක් අවශ්‍ය නම් වාර්තාවක් ඉවත් කරන්න.')}</p>
      <div className="rounded-card bg-surface border border-line overflow-x-auto thin-scroll">
        <table className="w-full text-[14px] min-w-[720px]">
          <thead className="text-left text-muted text-[13px] border-b border-line">
            <tr>{[t('Organisation', 'ආයතනය'), t('Record', 'වාර්තාව'), t('Published', 'ප්‍රකාශිත'), t('Status', 'තත්ත්වය'), ''].map((h, i) => <th key={i} className="font-semibold px-4 py-3">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-line">
            {sorted.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-2.5 font-semibold">{tb(orgs.find((o) => o.id === r.orgId)?.name) || r.orgId}</td>
                <td className="px-4 py-2.5">{tb(r.title)}<span className="block text-[12px] text-muted font-mono">{r.source}</span></td>
                <td className="px-4 py-2.5 text-muted whitespace-nowrap">{fmtDate(r.at, lang)}</td>
                <td className="px-4 py-2.5"><Pill tone={r.status.en.startsWith('Verified') ? 'ok' : 'navy'}>{tb(r.status)}</Pill></td>
                <td className="px-4 py-2.5 text-right">
                  <button onClick={() => setDel(r.id)} aria-label={t('Remove from directory', 'නාමාවලියෙන් ඉවත් කරන්න')} title={t('Remove from directory', 'නාමාවලියෙන් ඉවත් කරන්න')} className="h-9 w-9 inline-grid place-items-center rounded-full text-sos hover:bg-sos-50"><Trash2 size={17} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={!!del} onClose={() => setDel(null)} width="max-w-md" title={t('Remove this record from the directory?', 'මෙම වාර්තාව නාමාවලියෙන් ඉවත් කරන්නද?')}
        footer={<><Button variant="secondary" onClick={() => setDel(null)}>{t('Cancel', 'අවලංගු')}</Button><Button variant="sos" icon={<Trash2 size={16} />} onClick={() => { remove(del!); setDel(null); toast(t('Record removed from the public directory', 'වාර්තාව පොදු නාමාවලියෙන් ඉවත් කළා')); }}>{t('Remove', 'ඉවත් කරන්න')}</Button></>}>
        <p className="text-muted">{t('The public will no longer see it. The removal is recorded in the audit trail.', 'මහජනතාවට එය තවදුරටත් නොපෙනේ. ඉවත් කිරීම විගණන සටහනේ සටහන් වේ.')}</p>
      </Modal>
    </section>
  );
}

export function AuditTable({ title }: { title?: string }) {
  const { t, tb, lang } = useT();
  const audit = useApp((s) => s.audit);
  return (
    <>
      <PageHead title={title ?? t('Audit trail', 'විගණන සටහන')} sub={t('Every sensitive action is recorded with who, what and when. Entries cannot be edited.', 'සෑම සංවේදී ක්‍රියාවක්ම කවුද, මොකක්ද, කවදාද යන්න සමඟ සටහන් වේ. ඇතුළත් කිරීම් සංස්කරණය කළ නොහැක.')} />
      <div className="rounded-card bg-surface border border-line overflow-x-auto thin-scroll">
        <table className="w-full text-[14px] min-w-[640px]">
          <thead className="text-left text-muted text-[13px] border-b border-line">
            <tr>{[t('When', 'කවදාද'), t('Who', 'කවුද'), t('Action', 'ක්‍රියාව'), t('Item', 'අයිතමය')].map((h) => <th key={h} className="font-semibold px-4 py-3">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-line">
            {audit.slice(0, 60).map((e) => (
              <tr key={e.id}>
                <td className="px-4 py-2.5 text-muted whitespace-nowrap">{fmtDate(e.at, lang, true)}</td>
                <td className="px-4 py-2.5 font-semibold whitespace-nowrap">{e.actor} <span className="text-muted font-normal text-[12px]">{e.role}</span></td>
                <td className="px-4 py-2.5">{tb(e.action)}</td>
                <td className="px-4 py-2.5 font-mono text-[13px]">{e.target}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/** An officer logs a report that came in by phone, police referral, walk-in or email. */
function LogCaseModal({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const { t, tb } = useT();
  const orgs = useApp((s) => s.orgs);
  const logCase = useApp((s) => s.logCase);
  const [f, setF] = useState({
    source: 'phone_1938' as NonNullable<CaseFile['source']>, category: 'harassment' as Category, placeType: 'workplace' as PlaceType,
    orgId: '' as string, district: 'Colombo', when: 'week' as WhenKey, ongoing: false, urgency: 'standard' as Urgency, description: '',
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));
  const valid = f.description.trim().length >= 15;
  const sel = cx(inputCls, 'min-h-11 text-[15px]');
  return (
    <Modal open onClose={onClose} width="max-w-2xl" title={t('Log a case received outside the app', 'යෙදුමෙන් පිටත ලැබුණු ගොනුවක් ඇතුළත් කරන්න')}
      footer={<><Button variant="secondary" onClick={onClose}>{t('Cancel', 'අවලංගු')}</Button><Button icon={<Plus size={16} />} disabled={!valid} onClick={() => { const c = logCase({ ...f, orgId: f.orgId || undefined }); toast(t(`Case ${c.ref} logged`, `${c.ref} ගොනුව ඇතුළත් කළා`)); onClose(); onCreated(c.id); }}>{t('Log case', 'ගොනුව ඇතුළත් කරන්න')}</Button></>}>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="lc-src" className="font-semibold block mb-1.5">{t('Received through', 'ලැබුණේ')}</label>
          <select id="lc-src" value={f.source} onChange={(e) => set('source', e.target.value as typeof f.source)} className={sel}>
            {(['phone_1938', 'police_109', 'walk_in', 'email'] as const).map((k) => <option key={k} value={k}>{tb(SOURCE[k])}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="lc-cat" className="font-semibold block mb-1.5">{t('Category', 'වර්ගය')}</label>
          <select id="lc-cat" value={f.category} onChange={(e) => set('category', e.target.value as Category)} className={sel}>
            {(Object.keys(CATEGORY) as Category[]).map((k) => <option key={k} value={k}>{tb(CATEGORY[k])}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="lc-pl" className="font-semibold block mb-1.5">{t('Place', 'ස්ථානය')}</label>
          <select id="lc-pl" value={f.placeType} onChange={(e) => set('placeType', e.target.value as PlaceType)} className={sel}>
            {(Object.keys(PLACE) as PlaceType[]).map((k) => <option key={k} value={k}>{tb(PLACE[k])}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="lc-org" className="font-semibold block mb-1.5">{t('Organisation', 'ආයතනය')}</label>
          <select id="lc-org" value={f.orgId} onChange={(e) => set('orgId', e.target.value)} className={sel}>
            <option value="">{t('Not named', 'නම් කර නැත')}</option>
            {orgs.map((o) => <option key={o.id} value={o.id}>{tb(o.name)}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="lc-ds" className="font-semibold block mb-1.5">{t('District', 'දිස්ත්‍රික්කය')}</label>
          <select id="lc-ds" value={f.district} onChange={(e) => set('district', e.target.value)} className={sel}>
            {DISTRICTS.map((d) => <option key={d.en} value={d.en}>{tb(d)}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="lc-ur" className="font-semibold block mb-1.5">{t('Your urgency assessment', 'ඔබේ හදිසි බව තක්සේරුව')}</label>
          <select id="lc-ur" value={f.urgency} onChange={(e) => set('urgency', e.target.value as Urgency)} className={sel}>
            {(Object.keys(URGENCY) as Urgency[]).map((k) => <option key={k} value={k}>{tb(URGENCY[k])}</option>)}
          </select>
        </div>
      </div>
      <label htmlFor="lc-d" className="font-semibold block mt-4 mb-1.5">{t('Summary of what was reported', 'වාර්තා කළ දේහි සාරාංශය')}</label>
      <textarea id="lc-d" rows={4} value={f.description} onChange={(e) => set('description', e.target.value)} className={cx(inputCls, 'py-3 resize-y')}
        placeholder={t('Record roles, not names, unless they are needed.', 'අවශ්‍ය නොවේ නම් නම් වෙනුවට තනතුරු සටහන් කරන්න.')} />
      <label className="flex items-center gap-2 mt-3 text-[15px] cursor-pointer"><input type="checkbox" checked={f.ongoing} onChange={(e) => set('ongoing', e.target.checked)} className="h-4 w-4 accent-[rgb(var(--navy))]" />{t('Still happening', 'තවමත් සිදු වෙමින්')}</label>
      <p className="text-[13px] text-muted mt-3">{t('The AI suggestion is still produced for comparison. Your assessment is what counts.', 'සංසන්දනය සඳහා AI යෝජනාව තවමත් සෑදේ. වැදගත් වන්නේ ඔබේ තක්සේරුවයි.')}</p>
    </Modal>
  );
}
