import { useState } from 'react';
import { BadgeCheck, Building2, Check, KeyRound, Lock, Minus, PencilLine, Plus, ScrollText, Search, ShieldAlert, ShieldCheck, Trash2, Users, X } from 'lucide-react';
import { useNav, scrollPortalTop } from '../lib/nav';
import { DISTRICTS, PLACE, fmtDate, useT } from '../lib/i18n';
import { useApp } from '../lib/store';
import type { Bi, Organization, PlaceType, StaffRole, UserAccount } from '../lib/types';
import { Button, Modal, Pill, toast, cx, inputCls } from '../components/ui';
import PortalShell, { PageHead, Panel } from './PortalShell';
import { AuditTable } from './Reviewer';

type Cell = 'full' | 'redacted' | 'own' | 'none' | 'approve';

export default function Admin() {
  const { t } = useT();
  const unverified = useApp((s) => s.orgs.filter((o) => !o.verified).length);
  const nav = useNav((s) => s.admin);
  const set = useNav((s) => s.setAdmin);
  return (
    <PortalShell
      tone="ink"
      product={t('System administration', 'පද්ධති පරිපාලනය')}
      who="System admin · A-01"
      role={t('System administrator', 'පද්ධති පරිපාලක')}
      active={nav.view}
      onNav={(k) => { set({ view: k as typeof nav.view }); scrollPortalTop(); }}
      nav={[
        { k: 'access', l: t('Who can see what', 'කාටද දැකිය හැක්කේ'), i: KeyRound },
        { k: 'users', l: t('Accounts', 'ගිණුම්'), i: Users },
        { k: 'orgs', l: t('Organisations', 'ආයතන'), i: Building2, badge: unverified },
        { k: 'security', l: t('Security', 'ආරක්ෂාව'), i: ShieldAlert },
        { k: 'audit', l: t('Audit trail', 'විගණන සටහන'), i: ScrollText },
      ]}
    >
      <div className="mb-5 rounded-card bg-navy text-white p-4 flex gap-3 items-start">
        <Lock className="shrink-0 mt-0.5" />
        <p className="text-[15px]"><strong>{t('Administrators cannot read reports or evidence.', 'පරිපාලකයින්ට පැමිණිලි හෝ සාක්ෂි කියවිය නොහැක.')}</strong> {t('Technical access and case access are kept separate, so running the system never means seeing what women reported.', 'තාක්ෂණික ප්‍රවේශය හා ගොනු ප්‍රවේශය වෙන්ව තබයි. එබැවින් පද්ධතිය පවත්වාගෙන යාම යනු කාන්තාවන් වාර්තා කළ දේ දැකීම නොවේ.')}</p>
      </div>
      {nav.view === 'access' && <Matrix />}
      {nav.view === 'users' && <UsersView />}
      {nav.view === 'orgs' && <OrgsView />}
      {nav.view === 'security' && <Security />}
      {nav.view === 'audit' && <AuditTable />}
    </PortalShell>
  );
}

function Matrix() {
  const { t } = useT();
  const roles = [t('Reporter', 'පැමිණිලිකරු'), t('Intake reviewer', 'ලැබීම් සමාලෝචක'), t('Authorised officer', 'බලයලත් නිලධාරී'), t('Publication officer', 'ප්‍රකාශන නිලධාරී'), t('Organisation', 'ආයතනය'), t('Public', 'මහජනතාව'), t('Admin', 'පරිපාලක')];
  const rows: { d: string; c: Cell[] }[] = [
    { d: t('Report text', 'පැමිණිල්ලේ පෙළ'), c: ['own', 'redacted', 'redacted', 'none', 'none', 'none', 'none'] },
    { d: t('Identifying details', 'හඳුනාගැනීමේ විස්තර'), c: ['own', 'full', 'full', 'none', 'none', 'none', 'none'] },
    { d: t('Evidence files', 'සාක්ෂි ගොනු'), c: ['own', 'full', 'full', 'none', 'none', 'none', 'none'] },
    { d: t('AI suggestion', 'AI යෝජනාව'), c: ['none', 'full', 'full', 'none', 'none', 'none', 'none'] },
    { d: t('Secure messages', 'ආරක්ෂිත පණිවිඩ'), c: ['own', 'full', 'redacted', 'none', 'none', 'none', 'none'] },
    { d: t('Organisation notice', 'ආයතන නිවේදනය'), c: ['redacted', 'full', 'approve', 'full', 'own', 'none', 'none'] },
    { d: t('Organisation response', 'ආයතන පිළිතුර'), c: ['redacted', 'full', 'full', 'full', 'own', 'none', 'none'] },
    { d: t('Public record', 'පොදු වාර්තාව'), c: ['full', 'full', 'full', 'approve', 'full', 'full', 'full'] },
    { d: t('Audit trail', 'විගණන සටහන'), c: ['none', 'own', 'own', 'own', 'none', 'none', 'full'] },
  ];
  const C: Record<Cell, { l: string; tone: 'ok' | 'navy' | 'teal' | 'grey' | 'warn'; i: typeof Check }> = {
    full: { l: t('Full', 'සම්පූර්ණ'), tone: 'ok', i: Check },
    redacted: { l: t('Redacted', 'සංස්කරණය'), tone: 'warn', i: Minus },
    own: { l: t('Own only', 'තමාගේ පමණි'), tone: 'teal', i: Check },
    approve: { l: t('Approves', 'අනුමත කරයි'), tone: 'navy', i: BadgeCheck },
    none: { l: t('No access', 'ප්‍රවේශය නැත'), tone: 'grey', i: X },
  };
  return (
    <>
      <PageHead title={t('Who can see what', 'කාටද කුමක් දැකිය හැක්කේ')} sub={t('The access rules every screen in Suraki is built on. Every access to identifying details is logged.', 'සුරැකි හි සෑම තිරයක්ම ගොඩනගා ඇති ප්‍රවේශ නීති. හඳුනාගැනීමේ විස්තරවලට සෑම ප්‍රවේශයක්ම සටහන් වේ.')} />
      <div className="rounded-card bg-surface border border-line overflow-x-auto thin-scroll">
        <table className="w-full text-[14px] min-w-[900px]">
          <thead className="border-b border-line text-left">
            <tr><th className="px-4 py-3 font-semibold text-muted text-[13px]">{t('Information', 'තොරතුරු')}</th>{roles.map((r) => <th key={r} className="px-3 py-3 font-semibold text-[13px]">{r}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.d}>
                <th scope="row" className="px-4 py-2.5 text-left font-semibold">{r.d}</th>
                {r.c.map((c, i) => {
                  const x = C[c];
                  return <td key={i} className="px-3 py-2.5"><Pill tone={x.tone}><x.i size={12} />{x.l}</Pill></td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

const ROLE: Record<StaffRole, Bi> = {
  officer: { en: 'Government safeguarding officer', si: 'රජයේ ආරක්ෂණ නිලධාරී' },
  authorised: { en: 'Authorised officer (notices)', si: 'බලයලත් නිලධාරී (නිවේදන)' },
  publication: { en: 'Publication officer', si: 'ප්‍රකාශන නිලධාරී' },
  oversight: { en: 'Independent oversight reviewer', si: 'ස්වාධීන අධීක්ෂණ සමාලෝචක' },
  org: { en: 'Organisation representative', si: 'ආයතන නියෝජිත' },
  admin: { en: 'System administrator', si: 'පද්ධති පරිපාලක' },
};

function UsersView() {
  const { t, tb, lang } = useT();
  const users = useApp((s) => s.users);
  const orgs = useApp((s) => s.orgs);
  const save = useApp((s) => s.saveUser);
  const remove = useApp((s) => s.deleteUser);
  const [q, setQ] = useState('');
  const [form, setForm] = useState<{ u: Omit<UserAccount, 'createdAt'>; isNew: boolean } | null>(null);
  const [del, setDel] = useState<UserAccount | null>(null);
  const list = users.filter((u) => (u.id + u.name + u.email + tb(ROLE[u.role])).toLowerCase().includes(q.toLowerCase()));
  const blank = (): Omit<UserAccount, 'createdAt'> => ({ id: '', name: '', email: '', role: 'officer', active: true, mfa: true });
  const f = form?.u;
  const idTaken = !!form?.isNew && users.some((u) => u.id.toLowerCase() === f?.id.trim().toLowerCase());
  const valid = !!f && f.id.trim() && f.name.trim() && /.+@.+\..+/.test(f.email) && !idTaken && (f.role !== 'org' || !!f.orgId);
  const setF = (p: Partial<Omit<UserAccount, 'createdAt'>>) => setForm((x) => (x ? { ...x, u: { ...x.u, ...p } } : x));
  return (
    <>
      <PageHead title={t('Accounts and roles', 'ගිණුම් හා භූමිකා')} sub={t('Staff and organisation accounts. Reporters are anonymous and never appear here.', 'කාර්ය මණ්ඩල හා ආයතන ගිණුම්. පැමිණිලිකරුවන් නිර්නාමික වන අතර කිසිදා මෙහි නොපෙන්වයි.')}
        right={<Button icon={<Plus size={18} />} onClick={() => setForm({ u: blank(), isNew: true })}>{t('Add account', 'ගිණුමක් එකතු කරන්න')}</Button>} />
      <div className="relative max-w-sm mb-3">
        <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('Search accounts', 'ගිණුම් සොයන්න')} aria-label={t('Search accounts', 'ගිණුම් සොයන්න')} className={cx(inputCls, 'pl-9 min-h-10')} />
      </div>
      <div className="rounded-card bg-surface border border-line overflow-x-auto thin-scroll">
        <table className="w-full text-[14px] min-w-[860px]">
          <thead className="text-left text-muted text-[13px] border-b border-line">
            <tr>{[t('Account', 'ගිණුම'), t('Role', 'භූමිකාව'), t('Two-factor', 'ද්වි-සාධක'), t('Created', 'සෑදුවේ'), t('Status', 'තත්ත්වය'), ''].map((h, i) => <th key={i} className="font-semibold px-4 py-3">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="h-9 w-9 rounded-full bg-navy-50 text-navy grid place-items-center font-bold text-[11px] shrink-0">{u.id.slice(0, 5)}</span>
                    <div><p className="font-semibold">{u.name}</p><p className="text-[13px] text-muted">{u.email}</p></div>
                  </div>
                </td>
                <td className="px-4 py-3">{tb(ROLE[u.role])}{u.orgId && <span className="block text-[12px] text-muted">{tb(orgs.find((o) => o.id === u.orgId)?.name)}</span>}</td>
                <td className="px-4 py-3">{u.mfa ? <Pill tone="ok"><Check size={12} />{t('On', 'සක්‍රියයි')}</Pill> : <Pill tone="warn">{t('Missing', 'නැත')}</Pill>}</td>
                <td className="px-4 py-3 text-muted whitespace-nowrap">{fmtDate(u.createdAt, lang)}</td>
                <td className="px-4 py-3">
                  <button onClick={() => { save({ ...u, active: !u.active }, false); toast(u.active ? t('Access revoked', 'ප්‍රවේශය අවලංගු කළා') : t('Access restored', 'ප්‍රවේශය ප්‍රතිස්ථාපනය කළා')); }} className="group" aria-label={u.active ? t('Revoke access', 'ප්‍රවේශය අවලංගු කරන්න') : t('Restore access', 'ප්‍රවේශය ප්‍රතිස්ථාපනය')}>
                    <Pill tone={u.active ? 'ok' : 'grey'} className="group-hover:ring-2 ring-navy/20">{u.active ? t('Active', 'සක්‍රියයි') : t('Revoked', 'අවලංගුයි')}</Pill>
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button aria-label={t('Edit account', 'ගිණුම සංස්කරණය')} title={t('Edit account', 'ගිණුම සංස්කරණය')} onClick={() => setForm({ u: { ...u }, isNew: false })} className="h-9 w-9 grid place-items-center rounded-full text-navy hover:bg-navy-50"><PencilLine size={17} /></button>
                    <button aria-label={t('Delete account', 'ගිණුම මකන්න')} title={t('Delete account', 'ගිණුම මකන්න')} disabled={u.id === 'A-01'} onClick={() => setDel(u)} className="h-9 w-9 grid place-items-center rounded-full text-sos hover:bg-sos-50 disabled:opacity-30"><Trash2 size={17} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!form} onClose={() => setForm(null)} width="max-w-xl" title={form?.isNew ? t('Add account', 'ගිණුමක් එකතු කරන්න') : t('Edit account', 'ගිණුම සංස්කරණය')}
        footer={<><Button variant="secondary" onClick={() => setForm(null)}>{t('Cancel', 'අවලංගු')}</Button><Button disabled={!valid} onClick={() => { save({ ...f!, id: f!.id.trim(), name: f!.name.trim(), email: f!.email.trim(), orgId: f!.role === 'org' ? f!.orgId : undefined }, form!.isNew); toast(form!.isNew ? t('Account created', 'ගිණුම සෑදුවා') : t('Account updated', 'ගිණුම යාවත්කාලීන කළා')); setForm(null); }}>{t('Save', 'සුරකින්න')}</Button></>}>
        {f && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="u-id" className="font-semibold block mb-1.5">{t('Staff ID', 'කාර්ය මණ්ඩල අංකය')}</label>
              <input id="u-id" value={f.id} disabled={!form!.isNew} onChange={(e) => setF({ id: e.target.value.toUpperCase() })} placeholder="R-12" className={cx(inputCls, 'font-mono disabled:bg-mist')} aria-invalid={idTaken} />
              {idTaken && <p className="text-warn text-[13px] mt-1 font-semibold">{t('This ID is already used.', 'මෙම අංකය දැනටමත් භාවිතයේ ඇත.')}</p>}
            </div>
            <div><label htmlFor="u-n" className="font-semibold block mb-1.5">{t('Name', 'නම')}</label><input id="u-n" value={f.name} onChange={(e) => setF({ name: e.target.value })} className={inputCls} /></div>
            <div className="sm:col-span-2"><label htmlFor="u-e" className="font-semibold block mb-1.5">{t('Email', 'ඊමේල්')}</label><input id="u-e" type="email" value={f.email} onChange={(e) => setF({ email: e.target.value })} className={inputCls} /></div>
            <div>
              <label htmlFor="u-r" className="font-semibold block mb-1.5">{t('Role', 'භූමිකාව')}</label>
              <select id="u-r" value={f.role} onChange={(e) => setF({ role: e.target.value as StaffRole })} className={inputCls}>
                {(Object.keys(ROLE) as StaffRole[]).map((r) => <option key={r} value={r}>{tb(ROLE[r])}</option>)}
              </select>
            </div>
            {f.role === 'org' && (
              <div>
                <label htmlFor="u-o" className="font-semibold block mb-1.5">{t('Organisation', 'ආයතනය')}</label>
                <select id="u-o" value={f.orgId ?? ''} onChange={(e) => setF({ orgId: e.target.value || undefined })} className={inputCls}>
                  <option value="">—</option>
                  {orgs.map((o) => <option key={o.id} value={o.id}>{tb(o.name)}</option>)}
                </select>
              </div>
            )}
            <label className="flex items-center gap-2 text-[15px] cursor-pointer"><input type="checkbox" checked={f.mfa} onChange={(e) => setF({ mfa: e.target.checked })} className="h-4 w-4 accent-[rgb(var(--navy))]" />{t('Two-factor sign-in required', 'ද්වි-සාධක පිවිසුම අවශ්‍යයි')}</label>
          </div>
        )}
      </Modal>
      <Modal open={!!del} onClose={() => setDel(null)} width="max-w-md" title={t('Delete this account?', 'මෙම ගිණුම මකන්නද?')}
        footer={<><Button variant="secondary" onClick={() => setDel(null)}>{t('Cancel', 'අවලංගු')}</Button><Button variant="sos" icon={<Trash2 size={16} />} onClick={() => { remove(del!.id); setDel(null); toast(t('Account deleted', 'ගිණුම මැකුවා')); }}>{t('Delete', 'මකන්න')}</Button></>}>
        <p className="font-semibold">{del?.name} · <span className="font-mono">{del?.id}</span></p>
        <p className="text-muted mt-2">{t('Their past actions stay in the audit trail.', 'ඔවුන්ගේ පසුගිය ක්‍රියා විගණන සටහනේ රැඳේ.')}</p>
      </Modal>
    </>
  );
}

function OrgsView() {
  const { t, tb } = useT();
  const orgs = useApp((s) => s.orgs);
  const cases = useApp((s) => s.cases);
  const notices = useApp((s) => s.notices);
  const save = useApp((s) => s.saveOrg);
  const remove = useApp((s) => s.deleteOrg);
  type F = { id?: string; en: string; si: string; type: PlaceType; district: string; sectorEn: string; sectorSi: string; verified: boolean };
  const [form, setForm] = useState<F | null>(null);
  const [del, setDel] = useState<Organization | null>(null);
  const inUse = (id: string) => cases.some((c) => c.orgId === id) || notices.some((n) => n.orgId === id);
  const toForm = (o: Organization): F => ({ id: o.id, en: o.name.en, si: o.name.si, type: o.type, district: o.district.en, sectorEn: o.sector.en, sectorSi: o.sector.si, verified: o.verified });
  const blank: F = { en: '', si: '', type: 'workplace', district: 'Colombo', sectorEn: '', sectorSi: '', verified: false };
  const valid = !!form && form.en.trim() && form.sectorEn.trim();
  const submit = () => {
    const d = DISTRICTS.find((x) => x.en === form!.district)!;
    save({ id: form!.id, name: { en: form!.en.trim(), si: form!.si.trim() || form!.en.trim() }, type: form!.type, district: d, sector: { en: form!.sectorEn.trim(), si: form!.sectorSi.trim() || form!.sectorEn.trim() }, verified: form!.verified });
    toast(form!.id ? t('Organisation updated', 'ආයතනය යාවත්කාලීන කළා') : t('Organisation registered', 'ආයතනය ලියාපදිංචි කළා'));
    setForm(null);
  };
  return (
    <>
      <PageHead title={t('Organisations', 'ආයතන')} sub={t('An organisation is verified before it can receive notices. Organisations with reports or notices can’t be deleted.', 'නිවේදන ලැබීමට පෙර ආයතනයක් තහවුරු කෙරේ. පැමිණිලි හෝ නිවේදන ඇති ආයතන මැකිය නොහැක.')}
        right={<Button icon={<Plus size={18} />} onClick={() => setForm(blank)}>{t('Register organisation', 'ආයතනයක් ලියාපදිංචි කරන්න')}</Button>} />
      <div className="rounded-card bg-surface border border-line overflow-x-auto thin-scroll">
        <table className="w-full text-[14px] min-w-[820px]">
          <thead className="text-left text-muted text-[13px] border-b border-line">
            <tr>{[t('Organisation', 'ආයතනය'), t('Type', 'වර්ගය'), t('District', 'දිස්ත්‍රික්කය'), t('Verification', 'තහවුරු කිරීම'), ''].map((h, i) => <th key={i} className="font-semibold px-4 py-3">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-line">
            {orgs.map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-3"><p className="font-semibold">{tb(o.name)}</p><p className="text-[13px] text-muted">{tb(o.sector)}</p></td>
                <td className="px-4 py-3">{tb(PLACE[o.type])}</td>
                <td className="px-4 py-3">{tb(o.district)}</td>
                <td className="px-4 py-3">
                  {o.verified ? <Pill tone="ok"><BadgeCheck size={13} />{t('Verified', 'තහවුරුයි')}</Pill> : (
                    <Button size="sm" variant="secondary" icon={<BadgeCheck size={15} />} onClick={() => { save({ ...o, verified: true }); toast(t('Organisation verified', 'ආයතනය තහවුරු කළා')); }}>{t('Verify', 'තහවුරු කරන්න')}</Button>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button aria-label={t('Edit organisation', 'ආයතනය සංස්කරණය')} title={t('Edit organisation', 'ආයතනය සංස්කරණය')} onClick={() => setForm(toForm(o))} className="h-9 w-9 grid place-items-center rounded-full text-navy hover:bg-navy-50"><PencilLine size={17} /></button>
                    <button aria-label={t('Delete organisation', 'ආයතනය මකන්න')} title={inUse(o.id) ? t('Has reports or notices', 'පැමිණිලි හෝ නිවේදන ඇත') : t('Delete organisation', 'ආයතනය මකන්න')} disabled={inUse(o.id)} onClick={() => setDel(o)} className="h-9 w-9 grid place-items-center rounded-full text-sos hover:bg-sos-50 disabled:opacity-30"><Trash2 size={17} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={!!form} onClose={() => setForm(null)} width="max-w-xl" title={form?.id ? t('Edit organisation', 'ආයතනය සංස්කරණය') : t('Register organisation', 'ආයතනයක් ලියාපදිංචි කරන්න')}
        footer={<><Button variant="secondary" onClick={() => setForm(null)}>{t('Cancel', 'අවලංගු')}</Button><Button disabled={!valid} onClick={submit}>{t('Save', 'සුරකින්න')}</Button></>}>
        {form && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label htmlFor="o-en" className="font-semibold block mb-1.5">{t('Name (English)', 'නම (ඉංග්‍රීසි)')}</label><input id="o-en" value={form.en} onChange={(e) => setForm({ ...form, en: e.target.value })} className={inputCls} /></div>
            <div><label htmlFor="o-si" className="font-semibold block mb-1.5">{t('Name (Sinhala)', 'නම (සිංහල)')}</label><input id="o-si" lang="si" value={form.si} onChange={(e) => setForm({ ...form, si: e.target.value })} className={inputCls} /></div>
            <div><label htmlFor="o-sen" className="font-semibold block mb-1.5">{t('Sector (English)', 'අංශය (ඉංග්‍රීසි)')}</label><input id="o-sen" value={form.sectorEn} onChange={(e) => setForm({ ...form, sectorEn: e.target.value })} className={inputCls} /></div>
            <div><label htmlFor="o-ssi" className="font-semibold block mb-1.5">{t('Sector (Sinhala)', 'අංශය (සිංහල)')}</label><input id="o-ssi" lang="si" value={form.sectorSi} onChange={(e) => setForm({ ...form, sectorSi: e.target.value })} className={inputCls} /></div>
            <div>
              <label htmlFor="o-t" className="font-semibold block mb-1.5">{t('Type', 'වර්ගය')}</label>
              <select id="o-t" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as PlaceType })} className={inputCls}>
                {(['workplace', 'university', 'hotel', 'transport', 'other'] as PlaceType[]).map((k) => <option key={k} value={k}>{tb(PLACE[k])}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="o-d" className="font-semibold block mb-1.5">{t('District', 'දිස්ත්‍රික්කය')}</label>
              <select id="o-d" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className={inputCls}>
                {DISTRICTS.map((d) => <option key={d.en} value={d.en}>{tb(d)}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 text-[15px] cursor-pointer sm:col-span-2"><input type="checkbox" checked={form.verified} onChange={(e) => setForm({ ...form, verified: e.target.checked })} className="h-4 w-4 accent-[rgb(var(--navy))]" />{t('Registration and representative checked (verified)', 'ලියාපදිංචිය හා නියෝජිතයා පරීක්ෂා කළා (තහවුරුයි)')}</label>
          </div>
        )}
      </Modal>
      <Modal open={!!del} onClose={() => setDel(null)} width="max-w-md" title={t('Delete this organisation?', 'මෙම ආයතනය මකන්නද?')}
        footer={<><Button variant="secondary" onClick={() => setDel(null)}>{t('Cancel', 'අවලංගු')}</Button><Button variant="sos" icon={<Trash2 size={16} />} onClick={() => { remove(del!.id); setDel(null); toast(t('Organisation removed', 'ආයතනය ඉවත් කළා')); }}>{t('Delete', 'මකන්න')}</Button></>}>
        <p className="font-semibold">{del && tb(del.name)}</p>
        <p className="text-muted mt-2">{t('Its branches are removed too. It will no longer appear in the directory.', 'එහි ශාඛාද ඉවත් වේ. එය තවදුරටත් නාමාවලියේ නොපෙන්වයි.')}</p>
      </Modal>
    </>
  );
}

function Security() {
  const { t } = useT();
  const items = [
    { l: t('3 failed sign-ins blocked for R-11', 'R-11 සඳහා අසාර්ථක පිවිසුම් 3ක් අවහිර කළා'), tone: 'warn' as const, when: t('Today', 'අද') },
    { l: t('Unusual export attempt stopped: admins cannot export cases', 'අසාමාන්‍ය අපනයන උත්සාහයක් නැවැත්වුවා: පරිපාලකයින්ට ගොනු අපනයනය කළ නොහැක'), tone: 'sos' as const, when: t('Yesterday', 'ඊයේ') },
    { l: t('Evidence storage key rotated', 'සාක්ෂි ගබඩා යතුර මාරු කළා'), tone: 'ok' as const, when: t('Mon', 'සඳු') },
  ];
  return (
    <>
      <PageHead title={t('Security', 'ආරක්ෂාව')} sub={t('Alerts about access and system health. Case content is never shown here.', 'ප්‍රවේශය හා පද්ධති සෞඛ්‍යය පිළිබඳ ඇඟවීම්. ගොනු අන්තර්ගතය මෙහි කිසිදා නොපෙන්වයි.')} />
      <div className="grid md:grid-cols-3 gap-3 mb-5">
        {[[t('Data retention', 'දත්ත රඳවා තබාගැනීම'), t('Closed cases deleted after 2 years', 'අවසන් ගොනු වසර 2කට පසු මැකේ')], [t('Encryption', 'සංකේතනය'), t('At rest and in transit', 'ගබඩාවේදී හා සම්ප්‍රේෂණයේදී')], [t('Reporter data on phones', 'දුරකථනවල දත්ත'), t('None stored by default', 'පෙරනිමියෙන් කිසිවක් ගබඩා නොවේ')]].map(([a, b]) => (
          <div key={a} className="rounded-card bg-surface border border-line p-4"><p className="text-[13px] text-muted font-semibold flex items-center gap-1.5"><ShieldCheck size={14} className="text-teal-deep" />{a}</p><p className="font-bold mt-1">{b}</p></div>
        ))}
      </div>
      <div className="rounded-card bg-surface border border-line divide-y divide-line">
        {items.map((i) => (
          <div key={i.l} className="flex items-center gap-3 px-5 py-3.5"><span className={cx('h-2.5 w-2.5 rounded-full', i.tone === 'warn' ? 'bg-warn' : i.tone === 'sos' ? 'bg-sos' : 'bg-ok')} /><p className="flex-1">{i.l}</p><span className="text-sm text-muted">{i.when}</span></div>
        ))}
      </div>
    </>
  );
}
