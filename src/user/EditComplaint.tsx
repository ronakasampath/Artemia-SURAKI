import { useMemo, useState } from 'react';
import { ArrowLeft, Save, TriangleAlert } from 'lucide-react';
import { useApp } from '../lib/store';
import { CATEGORY, DISTRICTS, PLACE, WHEN, useT } from '../lib/i18n';
import { FLAG_COPY, findPrivacyFlags } from '../lib/triage';
import type { Category, PlaceType, WhenKey } from '../lib/types';
import { Button, Chip, Toggle, cx, inputCls, toast } from '../components/ui';

/** Edit a complaint the user made, while no reviewer has started on it yet. */
export default function EditComplaint() {
  const { t, tb } = useT();
  const active = useApp((s) => s.session.activeCase);
  const c = useApp((s) => s.cases.find((x) => x.ref === active?.ref));
  const orgs = useApp((s) => s.orgs);
  const save = useApp((s) => s.updateMyCase);
  const go = useApp((s) => s.go);
  const back = useApp((s) => s.back);
  const [f, setF] = useState(() => ({
    category: c?.category ?? ('other' as Category),
    placeType: c?.placeType ?? ('workplace' as PlaceType),
    orgId: c?.orgId,
    district: c?.district ?? 'Colombo',
    when: c?.when ?? ('week' as WhenKey),
    ongoing: c?.ongoing ?? false,
    description: c?.description ?? '',
  }));
  const flags = useMemo(() => findPrivacyFlags(f.description).filter((x) => FLAG_COPY[x.kind].risk === 'you'), [f.description]);

  if (!c) return null;
  if (c.status !== 'received') {
    return (
      <div className="px-4 py-8">
        <p className="font-semibold">{t('This complaint can no longer be edited.', 'මෙම පැමිණිල්ල තවදුරටත් සංස්කරණය කළ නොහැක.')}</p>
        <p className="text-muted">{t('A reviewer has started reading it. Add information through secure messages.', 'සමාලෝචකයෙක් එය කියවීම ඇරඹුවා. ආරක්ෂිත පණිවිඩ මඟින් තොරතුරු එකතු කරන්න.')}</p>
        <Button className="mt-4" onClick={() => go('messages')}>{t('Open messages', 'පණිවිඩ විවෘත කරන්න')}</Button>
      </div>
    );
  }
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));
  const valid = f.description.trim().length >= 20;

  return (
    <div className="px-4 pt-4 pb-10">
      <button onClick={back} className="h-10 -ml-2 pl-1.5 pr-3 rounded-full flex items-center gap-1 text-navy font-semibold hover:bg-navy-50"><ArrowLeft size={20} /> {t('Back', 'ආපසු')}</button>
      <h1 className="text-[25px] font-bold leading-tight mt-2">{t('Edit complaint', 'පැමිණිල්ල සංස්කරණය')}</h1>
      <p className="text-muted"><span className="font-mono">{c.ref}</span> · {t('No reviewer has started yet, so you can still change it.', 'තවම කිසිදු සමාලෝචකයෙක් ආරම්භ කර නැති නිසා ඔබට එය වෙනස් කළ හැකිය.')}</p>

      <div className="space-y-6 mt-6">
        <fieldset>
          <legend className="font-semibold mb-2">{t('What happened', 'සිදු වූ දේ')}</legend>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CATEGORY) as Category[]).map((k) => <Chip key={k} selected={f.category === k} onClick={() => set('category', k)}>{tb(CATEGORY[k])}</Chip>)}
          </div>
        </fieldset>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="pt" className="font-semibold block mb-1.5">{t('Where', 'කොහේද')}</label>
            <select id="pt" value={f.placeType} onChange={(e) => set('placeType', e.target.value as PlaceType)} className={inputCls}>
              {(Object.keys(PLACE) as PlaceType[]).map((k) => <option key={k} value={k}>{tb(PLACE[k])}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="og" className="font-semibold block mb-1.5">{t('Organisation', 'ආයතනය')}</label>
            <select id="og" value={f.orgId ?? ''} onChange={(e) => set('orgId', e.target.value || undefined)} className={inputCls}>
              <option value="">{t('Not named', 'නම් කර නැත')}</option>
              {orgs.map((o) => <option key={o.id} value={o.id}>{tb(o.name)}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="ds" className="font-semibold block mb-1.5">{t('District', 'දිස්ත්‍රික්කය')}</label>
            <select id="ds" value={f.district} onChange={(e) => set('district', e.target.value)} className={inputCls}>
              {DISTRICTS.map((d) => <option key={d.en} value={d.en}>{tb(d)}</option>)}
            </select>
          </div>
          <fieldset>
            <legend className="font-semibold mb-1.5">{t('When', 'කවදාද')}</legend>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(WHEN) as WhenKey[]).map((k) => <Chip key={k} selected={f.when === k} onClick={() => set('when', k)}>{tb(WHEN[k])}</Chip>)}
            </div>
          </fieldset>
        </div>
        <div className="rounded-card bg-surface border border-line px-4">
          <Toggle checked={f.ongoing} onChange={(v) => set('ongoing', v)} label={t('It is still happening', 'එය තවමත් සිදු වෙනවා')} />
        </div>
        <div>
          <label htmlFor="ds2" className="font-semibold block mb-1.5">{t('Your words', 'ඔබේ වචන')}</label>
          <textarea id="ds2" rows={8} value={f.description} onChange={(e) => set('description', e.target.value)} className={cx(inputCls, 'py-3 leading-relaxed resize-y')} />
          {flags.length > 0 && (
            <p className="mt-2 text-[15px] text-warn flex gap-2"><TriangleAlert size={18} className="shrink-0 mt-0.5" />
              {t('These could identify you:', 'මේවායින් ඔබව හඳුනාගත හැකියි:')} {flags.map((x) => `“${x.text}” (${tb(FLAG_COPY[x.kind].title)})`).join(', ')}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-8">
        <Button size="lg" icon={<Save size={18} />} disabled={!valid} onClick={() => { save(c.id, f); toast(t('Changes saved', 'වෙනස්කම් සුරැකුණා')); go('case', { replace: true }); }}>{t('Save changes', 'වෙනස්කම් සුරකින්න')}</Button>
        <Button size="lg" variant="ghost" onClick={back}>{t('Cancel', 'අවලංගු කරන්න')}</Button>
      </div>
    </div>
  );
}
