import { useEffect, useState } from 'react';
import { ChevronRight, MessageSquare, ShieldAlert, Building2, HeartHandshake, Lock, PencilLine, Trash2 } from 'lucide-react';
import { useNav } from '../lib/nav';
import { useApp, STATUS_ORDER, orgById } from '../lib/store';
import { CATEGORY, STATUS_PLAIN, fmtDate, useT } from '../lib/i18n';
import { Button, Pill, Thread, toast, type ThreadStep } from '../components/ui';
import type { CaseStatus } from '../lib/types';

const MILESTONES: { s: CaseStatus; en: string; si: string }[] = [
  { s: 'in_review', en: 'An independent reviewer reads your report', si: 'ස්වාධීන සමාලෝචකයෙක් ඔබේ පැමිණිල්ල කියවයි' },
  { s: 'org_notified', en: 'The organisation may be asked to act', si: 'ක්‍රියා කරන ලෙස ආයතනයට දැනුම් දිය හැකියි' },
  { s: 'org_responded', en: 'The organisation replies with a plan', si: 'ආයතනය සැලැස්මක් සමඟ පිළිතුරු දෙයි' },
  { s: 'outcome_recorded', en: 'Changes are checked by the reviewer', si: 'වෙනස්කම් සමාලෝචකයා පරීක්ෂා කරයි' },
  { s: 'closed', en: 'Your case is closed', si: 'ඔබේ පැමිණිල්ල අවසන් වේ' },
];

export default function CaseView() {
  const { t, tb, lang } = useT();
  const active = useApp((s) => s.session.activeCase ?? s.saved);
  const c = useApp((s) => s.cases.find((x) => x.ref === active?.ref));
  const go = useApp((s) => s.go);
  const flag = useApp((s) => s.flag);
  const withdraw = useApp((s) => s.withdrawMyCase);
  const web = useNav((s) => s.route) === 'user';
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (c?.fresh && (c.status === 'closed' || c.status === 'outcome_recorded')) flag('reporterSawOutcome');
  }, [c?.status, c?.fresh, flag]);

  if (!c) {
    return (
      <div className="px-4 pt-8 text-center">
        <p className="text-muted">{t('No report open.', 'විවෘත පැමිණිල්ලක් නැත.')}</p>
        <Button className="mt-4" onClick={() => go('track', { replace: true })}>{t('Check a report', 'පැමිණිල්ලක් බලන්න')}</Button>
      </div>
    );
  }

  const visible = c.timeline.filter((e) => e.reporterVisible);
  const idx = STATUS_ORDER.indexOf(c.status);
  const steps: ThreadStep[] = visible.map((e, i) => ({
    key: e.id,
    title: tb(e.label),
    when: fmtDate(e.at, lang, true),
    detail: e.detail ? tb(e.detail) : undefined,
    state: i === visible.length - 1 && c.status !== 'closed' ? 'current' : 'done',
  }));
  MILESTONES.filter((m) => STATUS_ORDER.indexOf(m.s) > idx).forEach((m) =>
    steps.push({ key: m.s, title: lang === 'si' ? m.si : m.en, state: 'next' }),
  );
  const org = orgById(c.orgId);
  const canWithdraw = ['received', 'in_review', 'awaiting_reporter', 'referred'].includes(c.status);

  return (
    <div className="px-4 pt-5 pb-8">
      <p className="text-sm text-muted">{t('Report', 'පැමිණිල්ල')} <span className="font-mono tracking-wide">{c.ref}</span></p>
      <h1 className="text-[24px] font-bold leading-tight mt-0.5">{tb(STATUS_PLAIN[c.status])}</h1>
      <div className="flex flex-wrap gap-1.5 mt-2">
        <Pill tone="navy">{tb(CATEGORY[c.category])}</Pill>
        {org && <Pill tone="grey"><Building2 size={13} /> {tb(org.name)}</Pill>}
      </div>

      <button onClick={() => go('messages')} className="mt-5 w-full rounded-card bg-surface border border-line hc-border p-4 flex items-center gap-3 text-left">
        <span className="h-11 w-11 rounded-full bg-teal-50 text-teal-deep grid place-items-center shrink-0"><MessageSquare size={21} /></span>
        <span className="flex-1">
          <span className="block font-bold">{t('Secure messages', 'ආරක්ෂිත පණිවිඩ')}</span>
          <span className="block text-sm text-muted">
            {c.status === 'awaiting_reporter' ? t('The reviewer is waiting for your answer', 'සමාලෝචකයා ඔබේ පිළිතුර බලාපොරොත්තුවෙන්') : t('Talk to your reviewer privately', 'ඔබේ සමාලෝචකයා සමඟ පෞද්ගලිකව කතා කරන්න')}
          </span>
        </span>
        {c.reporterUnread > 0 && <Pill tone="teal">{c.reporterUnread} {t('new', 'නව')}</Pill>}
        <ChevronRight className="text-muted" />
      </button>

      <section className="mt-6" aria-labelledby="journey">
        <h2 id="journey" className="font-bold mb-3">{t('Where your report is', 'ඔබේ පැමිණිල්ල ඇති තැන')}</h2>
        <div className="rounded-card bg-surface border border-line p-4">
          <Thread steps={steps} />
        </div>
        <p className="text-[13px] text-muted mt-2 flex gap-1.5"><Lock size={14} className="mt-0.5 shrink-0" />{t('An urgent label is not a finding. Reviewers check facts before anyone is held responsible.', 'හදිසි ලේබලයක් තීන්දුවක් නොවේ. කිසිවෙකු වගකිව යුතු යැයි තීරණය කිරීමට පෙර සමාලෝචකයින් කරුණු පරීක්ෂා කරයි.')}</p>
      </section>

      <section className="mt-6 grid gap-2">
        {c.referrals.length > 0 && (
          <div className="rounded-card bg-teal-50 p-4 flex gap-3">
            <HeartHandshake className="text-teal-deep shrink-0" />
            <p className="text-[15px]">{t('Support is arranged with the 1938 women’s helpline. They contact you only the way you chose.', '1938 කාන්තා සහාය සේවය සමඟ සහාය සලසා ඇත. ඔවුන් ඔබ හා සම්බන්ධ වන්නේ ඔබ තෝරාගත් ආකාරයට පමණයි.')}</p>
          </div>
        )}
        <Button variant="danger-outline" size="lg" icon={<ShieldAlert size={18} />} onClick={() => go('retaliation')}>
          {t('Someone is punishing me for reporting', 'පැමිණිලි කළ නිසා කෙනෙක් මට හිරිහැර කරනවා')}
        </Button>
      </section>

      {c.mine && (
        <section className="mt-6 rounded-card bg-surface border border-line p-4" aria-labelledby="manage">
          <h2 id="manage" className="font-bold">{t('Manage this report', 'මෙම පැමිණිල්ල කළමනාකරණය')}</h2>
          <div className="flex flex-wrap gap-2 mt-3">
            <Button variant="secondary" icon={<PencilLine size={17} />} disabled={c.status !== 'received'} onClick={() => go('edit')}>{t('Edit details', 'විස්තර සංස්කරණය')}</Button>
            <Button variant="ghost" className="text-sos hover:bg-sos-50" icon={<Trash2 size={17} />} disabled={!canWithdraw} onClick={() => setConfirm(true)}>{t('Withdraw report', 'පැමිණිල්ල ඉල්ලා අස්කර ගන්න')}</Button>
          </div>
          <p className="text-[13px] text-muted mt-2">
            {c.status !== 'received'
              ? t('Details can be edited until a reviewer starts reading. After that, add information through secure messages.', 'සමාලෝචකයෙක් කියවීම අරඹන තුරු විස්තර සංස්කරණය කළ හැකිය. ඉන්පසු ආරක්ෂිත පණිවිඩ මඟින් තොරතුරු එකතු කරන්න.')
              : t('You can edit until a reviewer starts reading.', 'සමාලෝචකයෙක් කියවීම අරඹන තුරු සංස්කරණය කළ හැකිය.')}
            {!canWithdraw && ' ' + t('This report has reached the organisation stage, so it can’t be withdrawn here. Message your reviewer instead.', 'මෙම පැමිණිල්ල ආයතන අදියරට පැමිණ ඇති නිසා මෙහි ඉල්ලා අස්කර ගත නොහැක. ඒ වෙනුවට සමාලෝචකයාට පණිවිඩයක් යවන්න.')}
          </p>
        </section>
      )}

      {confirm && (
        <div className="absolute inset-0 z-40 bg-ink/40 flex items-end sm:items-center justify-center animate-fade" onClick={() => setConfirm(false)}>
          <div className="w-full sm:max-w-md bg-surface rounded-t-sheet sm:rounded-sheet p-5 pb-6 animate-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal aria-labelledby="wd-t">
            <h2 id="wd-t" className="text-xl font-bold">{t('Withdraw this report?', 'මෙම පැමිණිල්ල ඉල්ලා අස්කර ගන්නද?')}</h2>
            <p className="text-muted mt-1">{t('It will be deleted and the reviewer will stop working on it. You can always report again later.', 'එය මැකී යන අතර සමාලෝචකයා ඒ මත වැඩ කිරීම නවත්වයි. පසුව ඕනෑම වේලාවක නැවත පැමිණිලි කළ හැකිය.')}</p>
            <div className="grid gap-2 mt-4">
              <Button variant="secondary" size="lg" onClick={() => setConfirm(false)}>{t('Keep my report', 'මගේ පැමිණිල්ල තබාගන්න')}</Button>
              <Button variant="sos" size="lg" icon={<Trash2 size={18} />} onClick={() => { withdraw(c.id); setConfirm(false); toast(t('Report withdrawn and deleted', 'පැමිණිල්ල ඉල්ලා අස්කර මැකුවා')); go(web ? 'complaints' : 'home', { replace: true }); }}>{t('Withdraw and delete', 'ඉල්ලා අස්කර මකන්න')}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
