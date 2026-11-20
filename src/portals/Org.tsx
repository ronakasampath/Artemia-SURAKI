import { useState } from 'react';
import {
  ArrowLeft, Building2, CalendarClock, CheckCircle2, ClipboardCheck, Eye, FileUp, Gavel, LayoutDashboard, Megaphone, Paperclip, PencilLine, Plus, Send,
  ShieldOff, Trash2, Inbox, Undo2, Users,
} from 'lucide-react';
import { useApp, orgById } from '../lib/store';
import { useNav, scrollPortalTop } from '../lib/nav';
import { fmtDate, useT } from '../lib/i18n';
import { uid } from '../lib/triage';
import type { Appeal, Bi, Branch, CorrectiveAction, Notice } from '../lib/types';
import { Button, Modal, Pill, Thread, cx, inputCls, toast } from '../components/ui';
import PortalShell, { PageHead, Panel } from './PortalShell';
import { OrgProfile } from './Directory';
import { D } from '../data';

const DEFAULT_ORG = 'org-a';
/** The organisation the signed-in representative belongs to. */
const useOrgId = () => useApp((s) => s.auth?.orgId) ?? DEFAULT_ORG;
export const NOTICE_STATUS: Record<Notice['status'], Bi> = {
  sent: { en: 'Response needed', si: 'පිළිතුරක් අවශ්‍යයි' },
  acknowledged: { en: 'Acknowledged', si: 'පිළිගත්තා' },
  responded: { en: 'Response submitted', si: 'පිළිතුර ඉදිරිපත් කළා' },
  verified: { en: 'Verified by reviewer', si: 'සමාලෝචකයා තහවුරු කළා' },
  appealed: { en: 'Under appeal', si: 'අභියාචනයේ' },
};

export default function Org() {
  const { t, tb } = useT();
  const ORG_ID = useOrgId();
  const nav = useNav((s) => s.org);
  const setNav = useNav((s) => s.setOrg);
  const allNotices = useApp((s) => s.notices);
  const notices = allNotices.filter((n) => n.orgId === ORG_ID);
  const open = notices.filter((n) => n.status === 'sent' || n.status === 'acknowledged').length;
  const go = (view: typeof nav.view, noticeId?: string) => { setNav({ view, noticeId }); scrollPortalTop(); };
  return (
    <PortalShell
      tone="teal"
      product={t('Organisation portal', 'ආයතන ද්වාරය')}
      who={tb(orgById(ORG_ID)?.name) || 'Organisation'}
      role={t('HR representative · verified', 'මානව සම්පත් නියෝජිත · තහවුරුයි')}
      active={nav.view === 'notice' ? 'overview' : nav.view}
      onNav={(k) => go(k as typeof nav.view)}
      nav={[
        { k: 'overview', l: t('Notices', 'නිවේදන'), i: Inbox, badge: open },
        { k: 'actions', l: t('Corrective actions', 'නිවැරදි කිරීම්'), i: ClipboardCheck },
        { k: 'branches', l: t('Branches', 'ශාඛා'), i: Building2 },
        { k: 'profile', l: t('Public profile', 'පොදු පැතිකඩ'), i: Eye },
        { k: 'appeals', l: t('Appeals', 'අභියාචනා'), i: Gavel },
      ]}
    >
      {nav.view === 'overview' && <Overview open={(id) => go('notice', id)} />}
      {nav.view === 'notice' && nav.noticeId && <NoticeView id={nav.noticeId} back={() => go('overview')} />}
      {nav.view === 'actions' && <Actions />}
      {nav.view === 'profile' && (
        <>
          <PageHead title={t('Your public profile', 'ඔබේ පොදු පැතිකඩ')} sub={t('This is how the public directory shows your organisation. Only approved official records appear.', 'පොදු නාමාවලිය ඔබේ ආයතනය පෙන්වන ආකාරය මෙයයි. අනුමත නිල වාර්තා පමණක් දිස් වේ.')} />
          <div className="rounded-card bg-surface border border-line p-6 max-w-3xl"><OrgProfile orgId={ORG_ID} onBack={() => go('overview')} /></div>
        </>
      )}
      {nav.view === 'appeals' && <Appeals />}
      {nav.view === 'branches' && <Branches />}
    </PortalShell>
  );
}

function Overview({ open }: { open: (id: string) => void }) {
  const { t, tb, lang } = useT();
  const ORG_ID = useOrgId();
  const allNotices = useApp((s) => s.notices);
  const notices = allNotices.filter((n) => n.orgId === ORG_ID);
  return (
    <>
      <PageHead title={t('Notices from the review panel', 'සමාලෝචන මණ්ඩලයෙන් නිවේදන')} sub={t('Respond on time with a clear plan. You will never be told who raised a concern.', 'පැහැදිලි සැලැස්මක් සමඟ නියමිත වේලාවට පිළිතුරු දෙන්න. ගැටලුව මතු කළේ කවුදැයි ඔබට කිසිදා නොකියනු ඇත.')} />
      <div className="grid lg:grid-cols-[1fr_340px] gap-5 items-start">
        <div className="space-y-3">
          {notices.length === 0 && (
            <div className="rounded-card border-2 border-dashed border-line bg-surface p-10 text-center">
              <Megaphone size={30} className="mx-auto text-muted" />
              <p className="font-bold mt-2">{t('No notices right now', 'දැනට නිවේදන නැත')}</p>
              <p className="text-muted max-w-[46ch] mx-auto">{t('When an authorised reviewer issues a notice, it appears here with what you need to do and by when.', 'බලයලත් සමාලෝචකයෙක් නිවේදනයක් නිකුත් කළ විට, ඔබ කළ යුතු දේ හා නියමිත දිනය සමඟ එය මෙහි දිස් වේ.')}</p>
              <p className="text-[13px] text-teal-deep mt-3">{t('Demo: issue one from the Reviewer console.', 'ආදර්ශනය: සමාලෝචක කොන්සෝලයෙන් එකක් නිකුත් කරන්න.')}</p>
            </div>
          )}
          {notices.map((n) => {
            const days = Math.ceil((n.dueAt - Date.now()) / D);
            return (
              <button key={n.id} onClick={() => open(n.id)} className="w-full text-left rounded-card bg-surface border border-line hc-border p-5 hover:border-navy/40 flex gap-4 animate-rise">
                <span className="h-12 w-12 rounded-xl bg-teal-50 text-teal-deep grid place-items-center shrink-0"><Megaphone size={22} /></span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone={n.status === 'sent' ? 'warn' : n.status === 'verified' ? 'ok' : 'teal'}>{tb(NOTICE_STATUS[n.status])}</Pill>
                    {(n.status === 'sent' || n.status === 'acknowledged') && <span className="text-sm text-muted flex items-center gap-1"><CalendarClock size={14} /> {t(`${days} days left`, `දින ${days}ක් ඉතිරියි`)}</span>}
                  </div>
                  <p className="font-bold text-lg mt-1.5">{tb(n.title)}</p>
                  <p className="text-sm text-muted">{tb(n.authority)} · {fmtDate(n.issuedAt, lang)}</p>
                </div>
              </button>
            );
          })}
        </div>
        <Panel title={t('How this works', 'මෙය ක්‍රියා කරන ආකාරය')}>
          <Thread compact steps={[
            { key: '1', state: 'done', title: t('A notice is issued after independent review', 'ස්වාධීන සමාලෝචනයෙන් පසු නිවේදනයක් නිකුත් වේ') },
            { key: '2', state: 'done', title: t('You acknowledge it', 'ඔබ එය ලැබුණු බව පිළිගන්නවා') },
            { key: '3', state: 'current', title: t('You respond with a corrective plan and evidence', 'නිවැරදි කිරීමේ සැලැස්මක් හා සාක්ෂි සමඟ ඔබ පිළිතුරු දෙනවා') },
            { key: '4', state: 'next', title: t('The reviewer verifies what you did', 'ඔබ කළ දේ සමාලෝචකයා තහවුරු කරයි') },
            { key: '5', state: 'next', title: t('Approved records appear in the public directory, including your fixes', 'ඔබේ නිවැරදි කිරීම් ඇතුළු අනුමත වාර්තා පොදු නාමාවලියේ දිස් වේ') },
          ]} />
          <p className="text-[13px] text-muted mt-4">{t('You can appeal any notice or ask for a correction.', 'ඕනෑම නිවේදනයකට අභියාචනා කිරීමට හෝ නිවැරදි කිරීමක් ඉල්ලීමට ඔබට හැකියි.')}</p>
        </Panel>
      </div>
    </>
  );
}

function NoticeView({ id, back }: { id: string; back: () => void }) {
  const { t, tb, lang } = useT();
  const n = useApp((s) => s.notices.find((x) => x.id === id));
  const ack = useApp((s) => s.orgAcknowledge);
  const respond = useApp((s) => s.orgRespond);
  const SUGG: Bi[] = [
    { en: 'Independent anti-harassment committee with an external member', si: 'බාහිර සාමාජිකයෙකු සහිත ස්වාධීන හිරිහැර විරෝධී කමිටුවක්' },
    { en: 'Mandatory training for all supervisors', si: 'සියලු අධීක්ෂකයින්ට අනිවාර්ය පුහුණුව' },
    { en: 'Paired access to the stores room', si: 'ගබඩා කාමරයට යුගල වශයෙන් ප්‍රවේශය' },
    { en: 'Written no-retaliation policy shared with all staff', si: 'පළිගැනීම් නොකිරීමේ ලිඛිත ප්‍රතිපත්තිය සියලු කාර්ය මණ්ඩලයට' },
  ];
  const [text, setText] = useState('');
  const [actions, setActions] = useState<CorrectiveAction[]>([]);
  const [files, setFiles] = useState<string[]>([]);
  const [custom, setCustom] = useState('');
  if (!n) return null;
  const canRespond = n.status === 'sent' || n.status === 'acknowledged';
  const add = (title: Bi | string, days = 30) => setActions((a) => [...a, { id: uid(), title, due: Date.now() + days * D, status: 'planned' }]);
  const fill = () => {
    setText(lang === 'si'
      ? 'නිවේදනය ලැබුණා. අපි මෙය බරපතළ ලෙස සලකනවා. බාහිර සාමාජිකයෙකු සහිත කමිටුවක් පත් කර ඇති අතර, අධීක්ෂක පුහුණුව නොවැම්බර් අවසානයේ ආරම්භ වේ.'
      : 'We received the notice and take it seriously. A committee with an external member has been appointed, and supervisor training begins at the end of the month.');
    setActions([
      { id: uid(), title: SUGG[0], due: Date.now() + 7 * D, status: 'done' },
      { id: uid(), title: SUGG[1], due: Date.now() + 30 * D, status: 'in_progress' },
      { id: uid(), title: SUGG[2], due: Date.now() + 3 * D, status: 'done' },
    ]);
    setFiles(['committee_appointment_letter.pdf', 'training_schedule.pdf']);
  };

  return (
    <>
      <button onClick={back} className="h-10 -ml-2 pl-1.5 pr-3 rounded-full flex items-center gap-1 text-navy font-semibold hover:bg-navy-50 mb-2"><ArrowLeft size={20} /> {t('Notices', 'නිවේදන')}</button>
      <div className="grid lg:grid-cols-[1fr_360px] gap-5 items-start">
        <div className="space-y-5 min-w-0">
          <section className="rounded-card bg-surface border-2 border-navy p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone={n.status === 'sent' ? 'warn' : 'teal'}>{tb(NOTICE_STATUS[n.status])}</Pill>
              <span className="text-sm text-muted">{tb(n.authority)} · {fmtDate(n.issuedAt, lang)}</span>
            </div>
            <h1 className="text-[26px] font-bold leading-tight mt-2">{tb(n.title)}</h1>
            <p className="mt-3 text-[16px]">{tb(n.summary)}</p>
            <p className="font-bold mt-5 mb-1.5">{t('You are asked to', 'ඔබෙන් ඉල්ලා සිටින්නේ')}</p>
            <ul className="space-y-1.5">{n.required.map((r) => <li key={r.en} className="flex gap-2 text-[15px]"><CheckCircle2 size={18} className="text-teal-deep shrink-0 mt-0.5" />{tb(r)}</li>)}</ul>
            <div className="mt-5 rounded-xl bg-warn-50 p-4 text-[15px] flex gap-3">
              <ShieldOff className="text-warn shrink-0" />
              <p><strong>{t('Not shared with you:', 'ඔබට බෙදා නොදෙන දේ:')}</strong> {t('who raised this concern, or anything that could identify them. Trying to find out, or acting against anyone you suspect, is retaliation and will be treated as a serious matter.', 'මෙම ගැටලුව මතු කළේ කවුද, හෝ ඔවුන් හඳුනාගත හැකි ඕනෑම දෙයක්. සොයා බැලීමට උත්සාහ කිරීම හෝ ඔබ සැක කරන අයෙකුට එරෙහිව ක්‍රියා කිරීම පළිගැනීමක් වන අතර බරපතළ කරුණක් ලෙස සලකනු ලැබේ.')}</p>
            </div>
            {n.status === 'sent' && <Button className="mt-5" variant="secondary" icon={<CheckCircle2 size={17} />} onClick={() => { ack(n.id); toast(t('Acknowledged. The panel can see you received it.', 'පිළිගත්තා. ඔබට ලැබුණු බව මණ්ඩලයට පෙනේ.')); }}>{t('Acknowledge receipt', 'ලැබුණු බව පිළිගන්න')}</Button>}
          </section>

          {canRespond ? (
            <Panel title={<><Send size={18} className="text-teal-deep" /> {t('Your response', 'ඔබේ පිළිතුර')}</>} right={<Button size="sm" variant="ghost" onClick={fill}>{t('Fill sample (demo)', 'නියැදිය (ආදර්ශ)')}</Button>}>
              <label htmlFor="exp" className="font-semibold block mb-1.5">{t('Explanation', 'පැහැදිලි කිරීම')}</label>
              <textarea id="exp" rows={4} value={text} onChange={(e) => setText(e.target.value)} className={cx(inputCls, 'py-3 resize-none')} placeholder={t('What have you done or will you do?', 'ඔබ කළ හෝ කරන්නේ කුමක්ද?')} />

              <p className="font-semibold mt-5 mb-1.5">{t('Corrective-action plan', 'නිවැරදි කිරීමේ සැලැස්ම')}</p>
              <ul className="space-y-2">
                {actions.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-line p-3 animate-rise">
                    <ClipboardCheck size={18} className="text-teal-deep" />
                    <span className="flex-1 min-w-[180px] text-[15px] font-semibold">{tb(a.title)}</span>
                    <select value={a.status} onChange={(e) => setActions(actions.map((x) => (x.id === a.id ? { ...x, status: e.target.value as CorrectiveAction['status'] } : x)))} className="h-9 rounded-lg border border-line px-2 text-sm" aria-label={t('Status', 'තත්ත්වය')}>
                      <option value="planned">{t('Planned', 'සැලසුම්')}</option>
                      <option value="in_progress">{t('In progress', 'ක්‍රියාත්මකයි')}</option>
                      <option value="done">{t('Done', 'අවසන්')}</option>
                    </select>
                    <span className="text-sm text-muted">{fmtDate(a.due, lang)}</span>
                    <button aria-label={t('Remove', 'ඉවත් කරන්න')} onClick={() => setActions(actions.filter((x) => x.id !== a.id))} className="h-9 w-9 grid place-items-center rounded-full hover:bg-mist text-muted"><Trash2 size={16} /></button>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2 mt-3">
                {SUGG.filter((s) => !actions.some((a) => typeof a.title !== 'string' && a.title.en === s.en)).map((s) => (
                  <button key={s.en} onClick={() => add(s)} className="h-9 px-3 rounded-full border border-dashed border-navy/40 text-sm text-navy font-semibold flex items-center gap-1.5 hover:bg-navy-50"><Plus size={14} />{tb(s)}</button>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder={t('Add your own action', 'ඔබේම ක්‍රියාවක් එකතු කරන්න')} className={cx(inputCls, 'min-h-10 text-[15px]')} />
                <Button size="sm" variant="secondary" disabled={!custom.trim()} onClick={() => { add(custom.trim()); setCustom(''); }} className="h-12">{t('Add', 'එකතු')}</Button>
              </div>

              <p className="font-semibold mt-5 mb-1.5">{t('Evidence', 'සාක්ෂි')}</p>
              <div className="flex flex-wrap gap-2">
                {files.map((f) => <Pill key={f} tone="grey"><Paperclip size={13} />{f}</Pill>)}
                <button onClick={() => setFiles([...files, `evidence_${files.length + 1}.pdf`])} className="h-8 px-3 rounded-full border border-line text-sm font-semibold flex items-center gap-1.5 hover:bg-mist"><FileUp size={14} />{t('Upload file', 'ගොනුව උඩුගත කරන්න')}</button>
              </div>

              <div className="flex justify-end mt-6">
                <Button icon={<Send size={17} />} disabled={!text.trim() || !actions.length} onClick={() => { respond(n.id, text, actions, files); toast(t('Response submitted to the review panel', 'පිළිතුර සමාලෝචන මණ්ඩලයට ඉදිරිපත් කළා')); }}>{t('Submit response', 'පිළිතුර ඉදිරිපත් කරන්න')}</Button>
              </div>
            </Panel>
          ) : (
            <Panel title={<><CheckCircle2 size={18} className="text-ok" /> {t('Response submitted', 'පිළිතුර ඉදිරිපත් කළා')}</>}>
              <p className="text-[15px]">{n.response?.text}</p>
              <ul className="mt-3 space-y-1.5">{n.response?.actions.map((a) => <li key={a.id} className="flex items-center gap-2 text-[15px]"><ClipboardCheck size={17} className="text-teal-deep" />{tb(a.title)} <Pill tone={a.status === 'done' ? 'ok' : 'navy'}>{a.status === 'done' ? t('Done', 'අවසන්') : a.status === 'in_progress' ? t('In progress', 'ක්‍රියාත්මකයි') : t('Planned', 'සැලසුම්')}</Pill></li>)}</ul>
              {n.outcome && <p className="mt-4 rounded-xl bg-ok-50 p-3.5 text-[15px]"><strong>{t('Reviewer’s outcome:', 'සමාලෝචකයාගේ ප්‍රතිඵලය:')}</strong> {tb(n.outcome.text)}</p>}
            </Panel>
          )}
        </div>
        <Panel title={t('Deadline', 'නියමිත දිනය')}>
          <p className="text-[28px] font-bold">{fmtDate(n.dueAt, lang)}</p>
          <p className="text-muted text-sm">{t('Ask for an extension through Appeals if you need more time.', 'වැඩි කාලයක් අවශ්‍ය නම් අභියාචනා හරහා දීර්ඝ කිරීමක් ඉල්ලන්න.')}</p>
          <div className="mt-4 rounded-xl bg-mist p-3 text-[14px] flex gap-2"><Building2 size={17} className="text-navy shrink-0 mt-0.5" />{t('Records are published only after independent verification and a separate approval. You will see them in your public profile.', 'වාර්තා ප්‍රකාශයට පත් කරන්නේ ස්වාධීන තහවුරු කිරීමෙන් හා වෙනම අනුමැතියකින් පසුව පමණි. ඔබේ පොදු පැතිකඩෙහි ඒවා දකිනු ඇත.')}</div>
        </Panel>
      </div>
    </>
  );
}

function Actions() {
  const { t, tb, lang } = useT();
  const ORG_ID = useOrgId();
  const allNotices = useApp((s) => s.notices);
  const update = useApp((s) => s.updateActions);
  const notices = allNotices.filter((n) => n.orgId === ORG_ID && n.response);
  const [adding, setAdding] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [days, setDays] = useState(30);
  const [del, setDel] = useState<{ n: string; a: CorrectiveAction } | null>(null);
  const label = (st: CorrectiveAction['status']) => (st === 'done' || st === 'verified' ? t('Done', 'අවසන්') : st === 'in_progress' ? t('In progress', 'ක්‍රියාත්මකයි') : t('Planned', 'සැලසුම්'));
  return (
    <>
      <PageHead title={t('Corrective actions', 'නිවැරදි කිරීමේ ක්‍රියාමාර්ග')} sub={t('Keep your plan up to date. The reviewer sees every change, and overdue items are flagged.', 'ඔබේ සැලැස්ම යාවත්කාලීනව තබාගන්න. සමාලෝචකයාට සෑම වෙනසක්ම පෙනෙන අතර කල් ඉකුත් වූ අයිතම දැනුම් දේ.')} />
      {notices.length === 0 ? (
        <div className="rounded-card border-2 border-dashed border-line bg-surface p-10 text-center text-muted">{t('No actions yet. They appear after you respond to a notice.', 'තවම ක්‍රියාමාර්ග නැත. නිවේදනයකට පිළිතුරු දුන් පසු ඒවා දිස් වේ.')}</div>
      ) : (
        <div className="space-y-5">
          {notices.map((n) => {
            const locked = n.status === 'verified';
            const acts = n.response!.actions;
            const done = acts.filter((a) => a.status === 'done' || a.status === 'verified').length;
            return (
              <section key={n.id} className="rounded-card bg-surface border border-line">
                <div className="flex flex-wrap items-center gap-3 px-5 pt-4 pb-3 border-b border-line">
                  <div className="flex-1 min-w-[220px]">
                    <h2 className="font-bold">{tb(n.title)}</h2>
                    <p className="text-sm text-muted">{t(`${done} of ${acts.length} done`, `${acts.length}න් ${done}ක් අවසන්`)} · {tb(NOTICE_STATUS[n.status])}</p>
                  </div>
                  {!locked && <Button size="sm" variant="secondary" icon={<Plus size={15} />} onClick={() => { setAdding(n.id); setTitle(''); setDays(30); }}>{t('Add action', 'ක්‍රියාවක් එකතු කරන්න')}</Button>}
                </div>
                <ul className="divide-y divide-line">
                  {acts.map((a) => {
                    const pct = a.status === 'done' || a.status === 'verified' ? 100 : a.status === 'in_progress' ? 50 : 10;
                    return (
                      <li key={a.id} className="px-5 py-3 flex flex-wrap items-center gap-4">
                        <div className="flex-1 min-w-[220px]">
                          <p className="font-semibold">{tb(a.title)}</p>
                          <p className="text-sm text-muted">{t('due', 'නියමිත')} {fmtDate(a.due, lang)}</p>
                        </div>
                        <div className="w-32"><div className="h-2 rounded-full bg-line"><div className="h-full rounded-full bg-teal transition-all" style={{ width: `${pct}%` }} /></div></div>
                        {locked ? (
                          <Pill tone="ok">{t('Verified', 'තහවුරුයි')}</Pill>
                        ) : (
                          <>
                            <select value={a.status} aria-label={t('Status', 'තත්ත්වය')} onChange={(e) => { update(n.id, (list) => list.map((x) => (x.id === a.id ? { ...x, status: e.target.value as CorrectiveAction['status'] } : x))); toast(t('Status updated', 'තත්ත්වය යාවත්කාලීන කළා')); }}
                              className="h-10 rounded-[10px] border border-line px-2 bg-surface text-[14px] font-semibold">
                              {(['planned', 'in_progress', 'done'] as const).map((st) => <option key={st} value={st}>{label(st)}</option>)}
                            </select>
                            <button aria-label={t('Delete action', 'ක්‍රියාව මකන්න')} title={t('Delete action', 'ක්‍රියාව මකන්න')} onClick={() => setDel({ n: n.id, a })} className="h-10 w-10 grid place-items-center rounded-full text-sos hover:bg-sos-50"><Trash2 size={17} /></button>
                          </>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}
      <Modal open={!!adding} onClose={() => setAdding(null)} width="max-w-lg" title={t('Add a corrective action', 'නිවැරදි කිරීමේ ක්‍රියාවක් එකතු කරන්න')}
        footer={<><Button variant="secondary" onClick={() => setAdding(null)}>{t('Cancel', 'අවලංගු')}</Button><Button disabled={!title.trim()} icon={<Plus size={16} />} onClick={() => { update(adding!, (list) => [...list, { id: uid(), title: title.trim(), due: Date.now() + days * D, status: 'planned' }]); setAdding(null); toast(t('Action added', 'ක්‍රියාව එකතු කළා')); }}>{t('Add action', 'ක්‍රියාව එකතු කරන්න')}</Button></>}>
        <label htmlFor="ca-t" className="font-semibold block mb-1.5">{t('What will you do?', 'ඔබ කරන්නේ කුමක්ද?')}</label>
        <input id="ca-t" value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder={t('e.g. Install lighting in the car park', 'උදා: වාහන නැවැත්වීමේ ස්ථානයේ ආලෝකය සවි කිරීම')} />
        <label htmlFor="ca-d" className="font-semibold block mt-4 mb-1.5">{t('Due in (days)', 'නියමිත කාලය (දින)')}</label>
        <input id="ca-d" type="number" min={1} max={180} value={days} onChange={(e) => setDays(Math.max(1, Number(e.target.value) || 1))} className={cx(inputCls, 'max-w-[140px]')} />
      </Modal>
      <Modal open={!!del} onClose={() => setDel(null)} width="max-w-md" title={t('Delete this action?', 'මෙම ක්‍රියාව මකන්නද?')}
        footer={<><Button variant="secondary" onClick={() => setDel(null)}>{t('Keep', 'තබාගන්න')}</Button><Button variant="sos" icon={<Trash2 size={16} />} onClick={() => { update(del!.n, (list) => list.filter((x) => x.id !== del!.a.id)); setDel(null); toast(t('Action deleted', 'ක්‍රියාව මැකුවා')); }}>{t('Delete', 'මකන්න')}</Button></>}>
        <p className="font-semibold">{del && tb(del.a.title)}</p>
        <p className="text-muted mt-2">{t('The reviewer will see that this action was removed from your plan.', 'මෙම ක්‍රියාව ඔබේ සැලැස්මෙන් ඉවත් කළ බව සමාලෝචකයාට පෙනේ.')}</p>
      </Modal>
    </>
  );
}

function Branches() {
  const { t } = useT();
  const ORG_ID = useOrgId();
  const all = useApp((s) => s.branches);
  const save = useApp((s) => s.saveBranch);
  const remove = useApp((s) => s.deleteBranch);
  const branches = all.filter((b) => b.orgId === ORG_ID);
  const [form, setForm] = useState<(Omit<Branch, 'id'> & { id?: string }) | null>(null);
  const [del, setDel] = useState<Branch | null>(null);
  const blank = { orgId: ORG_ID, name: '', city: '', staff: 0, contact: '' };
  const valid = !!form && form.name.trim() && form.city.trim();
  return (
    <>
      <PageHead title={t('Branches', 'ශාඛා')} sub={t('Notices can name a branch. Keep this list correct so the right site is asked to act.', 'නිවේදනවලට ශාඛාවක් නම් කළ හැකිය. නිවැරදි ස්ථානයට දැනුම් දීමට මෙම ලැයිස්තුව නිවැරදිව තබාගන්න.')}
        right={<Button icon={<Plus size={18} />} onClick={() => setForm(blank)}>{t('Add branch', 'ශාඛාවක් එකතු කරන්න')}</Button>} />
      <div className="rounded-card bg-surface border border-line overflow-x-auto thin-scroll">
        <table className="w-full text-[15px] min-w-[640px]">
          <thead className="text-left text-muted text-[13px] border-b border-line">
            <tr>{[t('Branch', 'ශාඛාව'), t('Location', 'ස්ථානය'), t('Staff', 'කාර්ය මණ්ඩලය'), t('Safeguarding contact', 'ආරක්ෂණ සම්බන්ධතාව'), ''].map((h, i) => <th key={i} className="font-semibold px-4 py-3">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-line">
            {branches.map((b) => (
              <tr key={b.id}>
                <td className="px-4 py-3 font-semibold">{b.name}</td>
                <td className="px-4 py-3">{b.city}</td>
                <td className="px-4 py-3 tabular-nums">{b.staff.toLocaleString('en-US')}</td>
                <td className="px-4 py-3 text-muted">{b.contact || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button aria-label={t('Edit branch', 'ශාඛාව සංස්කරණය')} title={t('Edit branch', 'ශාඛාව සංස්කරණය')} onClick={() => setForm({ ...b })} className="h-10 w-10 grid place-items-center rounded-full text-navy hover:bg-navy-50"><PencilLine size={17} /></button>
                    <button aria-label={t('Delete branch', 'ශාඛාව මකන්න')} title={t('Delete branch', 'ශාඛාව මකන්න')} onClick={() => setDel(b)} className="h-10 w-10 grid place-items-center rounded-full text-sos hover:bg-sos-50"><Trash2 size={17} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {branches.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-muted">{t('No branches yet. Add your first one.', 'තවම ශාඛා නැත. පළමු එක එකතු කරන්න.')}</td></tr>}
          </tbody>
        </table>
      </div>
      <Modal open={!!form} onClose={() => setForm(null)} width="max-w-lg" title={form?.id ? t('Edit branch', 'ශාඛාව සංස්කරණය') : t('Add branch', 'ශාඛාවක් එකතු කරන්න')}
        footer={<><Button variant="secondary" onClick={() => setForm(null)}>{t('Cancel', 'අවලංගු')}</Button><Button disabled={!valid} onClick={() => { save({ ...form!, name: form!.name.trim(), city: form!.city.trim() }); toast(form!.id ? t('Branch updated', 'ශාඛාව යාවත්කාලීන කළා') : t('Branch added', 'ශාඛාව එකතු කළා')); setForm(null); }}>{t('Save', 'සුරකින්න')}</Button></>}>
        {form && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label htmlFor="b-n" className="font-semibold block mb-1.5">{t('Branch name', 'ශාඛාවේ නම')}</label><input id="b-n" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} /></div>
            <div><label htmlFor="b-c" className="font-semibold block mb-1.5">{t('Location', 'ස්ථානය')}</label><input id="b-c" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputCls} /></div>
            <div><label htmlFor="b-s" className="font-semibold block mb-1.5">{t('Staff', 'කාර්ය මණ්ඩලය')}</label><input id="b-s" type="number" min={0} value={form.staff} onChange={(e) => setForm({ ...form, staff: Math.max(0, Number(e.target.value) || 0) })} className={inputCls} /></div>
            <div><label htmlFor="b-ct" className="font-semibold block mb-1.5">{t('Safeguarding contact', 'ආරක්ෂණ සම්බන්ධතාව')}</label><input id="b-ct" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className={inputCls} /></div>
          </div>
        )}
      </Modal>
      <Modal open={!!del} onClose={() => setDel(null)} width="max-w-md" title={t('Delete this branch?', 'මෙම ශාඛාව මකන්නද?')}
        footer={<><Button variant="secondary" onClick={() => setDel(null)}>{t('Keep', 'තබාගන්න')}</Button><Button variant="sos" icon={<Trash2 size={16} />} onClick={() => { remove(del!.id); setDel(null); toast(t('Branch deleted', 'ශාඛාව මැකුවා')); }}>{t('Delete', 'මකන්න')}</Button></>}>
        <p className="font-semibold">{del?.name} · {del?.city}</p>
      </Modal>
    </>
  );
}

function Appeals() {
  const { t, tb, lang } = useT();
  const ORG_ID = useOrgId();
  const all = useApp((s) => s.appeals);
  const allNotices = useApp((s) => s.notices);
  const add = useApp((s) => s.addAppeal);
  const withdraw = useApp((s) => s.withdrawAppeal);
  const appeals = all.filter((a) => a.orgId === ORG_ID);
  const notices = allNotices.filter((n) => n.orgId === ORG_ID);
  const [kind, setKind] = useState<Appeal['kind']>('extension');
  const [noticeId, setNoticeId] = useState(notices[0]?.id ?? '');
  const [reason, setReason] = useState('');
  const KIND: Record<Appeal['kind'], Bi> = {
    extension: { en: 'More time to respond', si: 'පිළිතුරු දීමට වැඩි කාලයක්' },
    correction: { en: 'Correct a fact in a public record', si: 'පොදු වාර්තාවක කරුණක් නිවැරදි කිරීම' },
    appeal: { en: 'Appeal a notice', si: 'නිවේදනයකට අභියාචනය' },
  };
  const ST: Record<Appeal['status'], Bi> = { open: { en: 'Waiting for decision', si: 'තීරණය බලාපොරොත්තුවෙන්' }, decided: { en: 'Decided', si: 'තීරණය විය' }, withdrawn: { en: 'Withdrawn', si: 'ඉල්ලා අස්කර ගත්තා' } };
  return (
    <>
      <PageHead title={t('Appeals and corrections', 'අභියාචනා හා නිවැරදි කිරීම්')} sub={t('If a notice or public record is wrong, ask an independent oversight reviewer who was not involved to look again.', 'නිවේදනයක් හෝ පොදු වාර්තාවක් වැරදි නම්, සම්බන්ධ නොවූ ස්වාධීන අධීක්ෂණ සමාලෝචකයෙකුගෙන් නැවත සලකා බලන ලෙස ඉල්ලන්න.')} />
      <div className="grid lg:grid-cols-[1fr_380px] gap-5 items-start">
        <section className="rounded-card bg-surface border border-line">
          <h2 className="font-bold px-5 pt-4 pb-3 border-b border-line">{t('Your requests', 'ඔබේ ඉල්ලීම්')}</h2>
          <ul className="divide-y divide-line">
            {appeals.map((a) => (
              <li key={a.id} className="px-5 py-4 flex flex-wrap items-start gap-3">
                <Gavel size={19} className="text-teal-deep mt-0.5" />
                <div className="flex-1 min-w-[200px]">
                  <p className="font-semibold">{tb(KIND[a.kind])}</p>
                  <p className="text-[14px] text-muted">{a.noticeId ? tb(allNotices.find((n) => n.id === a.noticeId)?.title) : ''} · {fmtDate(a.at, lang)}</p>
                  <p className="text-[15px] mt-1">{a.reason}</p>
                  {a.decision && <p className="text-[14px] mt-1 text-ok font-semibold">{tb(a.decision)}</p>}
                </div>
                <Pill tone={a.status === 'open' ? 'warn' : a.status === 'decided' ? 'ok' : 'grey'}>{tb(ST[a.status])}</Pill>
                {a.status === 'open' && <Button size="sm" variant="ghost" icon={<Undo2 size={15} />} onClick={() => { withdraw(a.id); toast(t('Request withdrawn', 'ඉල්ලීම ඉල්ලා අස්කර ගත්තා')); }}>{t('Withdraw', 'ඉල්ලා අස්කර ගන්න')}</Button>}
              </li>
            ))}
            {appeals.length === 0 && <li className="px-5 py-10 text-center text-muted">{t('No requests yet.', 'තවම ඉල්ලීම් නැත.')}</li>}
          </ul>
        </section>
        <Panel title={t('New request', 'නව ඉල්ලීමක්')}>
          <div className="space-y-4">
            <div>
              <label htmlFor="ap-type" className="font-semibold block mb-1.5">{t('What do you need?', 'ඔබට අවශ්‍ය කුමක්ද?')}</label>
              <select id="ap-type" value={kind} onChange={(e) => setKind(e.target.value as Appeal['kind'])} className={inputCls}>
                {(Object.keys(KIND) as Appeal['kind'][]).map((k) => <option key={k} value={k}>{tb(KIND[k])}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="ap-n" className="font-semibold block mb-1.5">{t('About which notice', 'කුමන නිවේදනය ගැනද')}</label>
              <select id="ap-n" value={noticeId} onChange={(e) => setNoticeId(e.target.value)} className={inputCls}>
                {notices.map((n) => <option key={n.id} value={n.id}>{tb(n.title)}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="ap-why" className="font-semibold block mb-1.5">{t('Reason', 'හේතුව')}</label>
              <textarea id="ap-why" rows={4} value={reason} onChange={(e) => setReason(e.target.value)} className={cx(inputCls, 'py-3 resize-none')} />
            </div>
            <Button disabled={!reason.trim() || !noticeId} onClick={() => { add({ orgId: ORG_ID, kind, noticeId, reason: reason.trim() }); setReason(''); toast(t('Request sent to an oversight reviewer', 'ඉල්ලීම අධීක්ෂණ සමාලෝචකයෙකුට යැව්වා')); }} icon={<Gavel size={17} />}>{t('Send request', 'ඉල්ලීම යවන්න')}</Button>
          </div>
        </Panel>
      </div>
    </>
  );
}

export { LayoutDashboard };
