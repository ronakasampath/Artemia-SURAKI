import { useMemo, useState } from 'react';
import { Eye, FileText, PencilLine, Plus, Search, Trash2 } from 'lucide-react';
import { useApp } from '../lib/store';
import { CATEGORY, STATUS_PLAIN, fmtDate, useT } from '../lib/i18n';
import type { CaseFile } from '../lib/types';
import { Button, Modal, Pill, cx, inputCls, toast } from '../components/ui';
import MiniThread from './MiniThread';

const WITHDRAWABLE = ['received', 'in_review', 'awaiting_reporter', 'referred'];

/** The user's own complaints: open, edit (before review starts) and withdraw. */
export default function MyComplaints() {
  const { t, tb, lang } = useT();
  const cases = useApp((s) => s.cases);
  const orgs = useApp((s) => s.orgs);
  const go = useApp((s) => s.go);
  const openCase = useApp((s) => s.openCase);
  const withdraw = useApp((s) => s.withdrawMyCase);
  const [f, setF] = useState<'all' | 'active' | 'waiting' | 'closed'>('all');
  const [q, setQ] = useState('');
  const [del, setDel] = useState<CaseFile | null>(null);

  const mine = useMemo(() => cases.filter((c) => c.mine).sort((a, b) => b.createdAt - a.createdAt), [cases]);
  const orgName = (c: CaseFile) => tb(orgs.find((o) => o.id === c.orgId)?.name) || t('Not named', 'නම් කර නැත');
  const count = {
    all: mine.length,
    active: mine.filter((c) => c.status !== 'closed').length,
    waiting: mine.filter((c) => c.status === 'awaiting_reporter' || c.reporterUnread > 0).length,
    closed: mine.filter((c) => c.status === 'closed').length,
  };
  const list = mine
    .filter((c) => (f === 'all' ? true : f === 'active' ? c.status !== 'closed' : f === 'closed' ? c.status === 'closed' : c.status === 'awaiting_reporter' || c.reporterUnread > 0))
    .filter((c) => (c.ref + orgName(c) + tb(CATEGORY[c.category])).toLowerCase().includes(q.trim().toLowerCase()));

  const open = (c: CaseFile, screen: 'case' | 'edit' = 'case') => { openCase(c.ref, c.code); go(screen); };

  return (
    <div className="px-4 md:px-8 py-6 md:py-8">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h1 className="text-[28px] font-bold leading-tight">{t('My complaints', 'මගේ පැමිණිලි')}</h1>
          <p className="text-muted">{t('Only you can see this list. Reviewers never see your account.', 'මෙම ලැයිස්තුව දැකිය හැක්කේ ඔබට පමණි. සමාලෝචකයින් ඔබේ ගිණුම කිසිදා නොදකී.')}</p>
        </div>
        <Button icon={<Plus size={18} />} onClick={() => go('report')}>{t('New complaint', 'නව පැමිණිල්ලක්')}</Button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {([['all', t('All', 'සියල්ල')], ['active', t('Active', 'ක්‍රියාත්මක')], ['waiting', t('Waiting for you', 'ඔබ බලාපොරොත්තුවෙන්')], ['closed', t('Closed', 'අවසන්')]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setF(k)} aria-pressed={f === k} className={cx('h-10 px-4 rounded-full text-sm font-semibold border flex items-center gap-2', f === k ? 'bg-navy text-white border-navy' : 'bg-surface border-line')}>
            {l} <span className={cx('text-[12px] rounded-full px-1.5 min-w-5', f === k ? 'bg-white/20' : 'bg-mist')}>{count[k]}</span>
          </button>
        ))}
        <div className="relative ml-auto w-full sm:w-64">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('Search', 'සොයන්න')} aria-label={t('Search complaints', 'පැමිණිලි සොයන්න')} className={cx(inputCls, 'pl-9 min-h-10')} />
        </div>
      </div>

      {list.length === 0 ? (
        <div className="rounded-card border-2 border-dashed border-line bg-surface p-10 text-center">
          <FileText size={30} className="mx-auto text-muted" />
          <p className="font-bold mt-2">{mine.length ? t('Nothing matches this filter', 'මෙම පෙරහනට ගැළපෙන දෙයක් නැත') : t('No complaints yet', 'තවම පැමිණිලි නැත')}</p>
          <p className="text-muted">{t('When you make a complaint it appears here, with every step it goes through.', 'ඔබ පැමිණිල්ලක් කළ විට, එය ගමන් කරන සෑම පියවරක්ම සමඟ මෙහි දිස් වේ.')}</p>
        </div>
      ) : (
        <div className="rounded-card bg-surface border border-line overflow-clip">
          <table className="w-full text-[15px] hidden md:table">
            <thead className="text-left text-[13px] text-muted border-b border-line">
              <tr>
                {[t('Reference', 'යොමුව'), t('What happened', 'සිදු වූ දේ'), t('Submitted', 'යැවූ දිනය'), t('Progress', 'ප්‍රගතිය'), ''].map((h, i) => <th key={i} className="font-semibold px-4 py-3">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {list.map((c) => (
                <tr key={c.id} className="hover:bg-mist">
                  <td className="px-4 py-3 align-top">
                    <button onClick={() => open(c)} className="font-mono font-semibold text-navy hover:underline">{c.ref}</button>
                    {c.reporterUnread > 0 && <div><Pill tone="teal" className="mt-1">{c.reporterUnread} {t('new', 'නව')}</Pill></div>}
                  </td>
                  <td className="px-4 py-3 align-top"><p className="font-semibold">{tb(CATEGORY[c.category])}</p><p className="text-[13px] text-muted">{orgName(c)}</p></td>
                  <td className="px-4 py-3 align-top text-muted whitespace-nowrap">{fmtDate(c.createdAt, lang)}</td>
                  <td className="px-4 py-3 align-top"><MiniThread status={c.status} label={tb(STATUS_PLAIN[c.status])} /><p className="text-[13px] mt-1">{tb(STATUS_PLAIN[c.status])}</p></td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex justify-end gap-1">
                      <IconAction label={t('Open', 'විවෘත කරන්න')} onClick={() => open(c)}><Eye size={18} /></IconAction>
                      <IconAction label={t('Edit details', 'විස්තර සංස්කරණය')} disabled={c.status !== 'received'} onClick={() => open(c, 'edit')}><PencilLine size={18} /></IconAction>
                      <IconAction label={t('Withdraw', 'ඉල්ලා අස්කර ගන්න')} danger disabled={!WITHDRAWABLE.includes(c.status)} onClick={() => setDel(c)}><Trash2 size={18} /></IconAction>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className="md:hidden divide-y divide-line">
            {list.map((c) => (
              <li key={c.id} className="p-4">
                <button onClick={() => open(c)} className="w-full text-left">
                  <p className="font-semibold">{tb(CATEGORY[c.category])} <span className="text-muted font-normal">· {orgName(c)}</span></p>
                  <p className="text-[13px] text-muted"><span className="font-mono">{c.ref}</span> · {fmtDate(c.createdAt, lang)}</p>
                  <div className="mt-2 flex items-center gap-3"><MiniThread status={c.status} /><span className="text-[13px]">{tb(STATUS_PLAIN[c.status])}</span></div>
                </button>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="secondary" disabled={c.status !== 'received'} onClick={() => open(c, 'edit')} icon={<PencilLine size={15} />}>{t('Edit', 'සංස්කරණය')}</Button>
                  <Button size="sm" variant="ghost" className="text-sos" disabled={!WITHDRAWABLE.includes(c.status)} onClick={() => setDel(c)} icon={<Trash2 size={15} />}>{t('Withdraw', 'ඉල්ලා අස්කර ගන්න')}</Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-[13px] text-muted mt-3">{t('Edit is available until a reviewer starts reading. Withdraw is available until the organisation is contacted.', 'සමාලෝචකයෙක් කියවීම අරඹන තුරු සංස්කරණය කළ හැකිය. ආයතනය හා සම්බන්ධ වන තුරු ඉල්ලා අස්කර ගත හැකිය.')}</p>

      <Modal open={!!del} onClose={() => setDel(null)} width="max-w-md" title={t('Withdraw this complaint?', 'මෙම පැමිණිල්ල ඉල්ලා අස්කර ගන්නද?')}
        footer={<>
          <Button variant="secondary" onClick={() => setDel(null)}>{t('Keep it', 'තබාගන්න')}</Button>
          <Button variant="sos" icon={<Trash2 size={16} />} onClick={() => { withdraw(del!.id); setDel(null); toast(t('Complaint withdrawn and deleted', 'පැමිණිල්ල ඉල්ලා අස්කර මැකුවා')); }}>{t('Withdraw and delete', 'ඉල්ලා අස්කර මකන්න')}</Button>
        </>}>
        <p className="text-[15px]"><span className="font-mono font-semibold">{del?.ref}</span> · {del && tb(CATEGORY[del.category])}</p>
        <p className="text-muted mt-2">{t('It will be deleted and the reviewer will stop working on it. You can report again at any time.', 'එය මැකී යන අතර සමාලෝචකයා ඒ මත වැඩ කිරීම නවත්වයි. ඕනෑම වේලාවක නැවත පැමිණිලි කළ හැකිය.')}</p>
      </Modal>
    </div>
  );
}

function IconAction({ label, onClick, children, disabled, danger }: { label: string; onClick: () => void; children: React.ReactNode; disabled?: boolean; danger?: boolean }) {
  return (
    <button aria-label={label} title={label} onClick={onClick} disabled={disabled}
      className={cx('h-10 w-10 grid place-items-center rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed', danger ? 'text-sos hover:bg-sos-50' : 'text-navy hover:bg-navy-50')}>
      {children}
    </button>
  );
}
