import { useMemo, useState } from 'react';
import {
  ArrowLeft, Building2, Bus, Check, ChevronRight, Eye, FileText, Globe, GraduationCap, Hand, Hotel, Image as ImageIcon, Lock,
  LogOut, MapPin, Mic, Paperclip, ScanEye, ShieldAlert, ShieldCheck, Sparkles, Trash2, TriangleAlert, UserX, Wand2, X,
  MessageSquareWarning, Scale, Lightbulb, HelpCircle,
} from 'lucide-react';
import { useApp, emptyDraft } from '../lib/store';
import { CATEGORY, CONTACT, DISTRICTS, PLACE, WHEN, useT } from '../lib/i18n';
import { FLAG_COPY, findPrivacyFlags, uid } from '../lib/triage';
import type { Category, ContactPref, PlaceType, WhenKey } from '../lib/types';
import { Button, Chip, ThreadBar, Toggle, cx, inputCls, Pill } from '../components/ui';

const CAT_ICON: Record<Category, typeof Hand> = {
  harassment: Hand, intimidation: MessageSquareWarning, discrimination: Scale, physical: ShieldAlert, unsafe: Lightbulb, other: HelpCircle,
};
const PLACE_ICON: Record<PlaceType, typeof Hand> = {
  workplace: Building2, university: GraduationCap, transport: Bus, hotel: Hotel, public: MapPin, online: Globe, other: HelpCircle,
};

export const SAMPLE = {
  en: 'My supervisor Mr. Perera keeps sending me messages late at night, and today at 6.30 pm he made comments about my body again. I am the only woman in the stores team. When I said no, he threatened that my contract will not be renewed. I am scared to go to the stores room alone.',
  si: 'මගේ සුපවයිසර් පෙරේරා මහතා රෑ වෙලාවට දිගටම මට පණිවිඩ එවනවා. අද හවස 6.30ට ඔහු නැවතත් මගේ ශරීරය ගැන අසභ්‍ය කතා කිව්වා. මම ගබඩා අංශයේ එකම කාන්තාව. මම එපා කිව්වම, මගේ කොන්ත්‍රාත්තුව අලුත් කරන්නේ නැහැ කියලා තර්ජනය කළා. ගබඩා කාමරයට තනියම යන්න මට බයයි.',
};

const STEPS = 8;

export default function ReportWizard() {
  const { t, tb, lang } = useT();
  const d = useApp((s) => s.session.draft);
  const patch = useApp((s) => s.patchDraft);
  const go = useApp((s) => s.go);
  const resetDraft = useApp((s) => s.resetDraft);
  const submit = useApp((s) => s.submitDraft);
  const [leaving, setLeaving] = useState(false);
  const [sending, setSending] = useState<0 | 1 | 2 | 3>(0);

  const step = d.step;
  const setStep = (n: number) => {
    patch({ step: n });
    document.getElementById('reporter-main')?.scrollTo({ top: 0 });
  };

  const flags = useMemo(() => findPrivacyFlags(d.description), [d.description]);
  const youFlags = flags.filter((f) => FLAG_COPY[f.kind].risk === 'you' && !d.privacyDone[`${f.kind}:${f.text}`]);

  const canNext = [
    true,
    !!d.category,
    !!d.placeType,
    !!d.when,
    d.description.trim().length >= 20,
    true,
    true,
    true,
    true,
  ][step];

  const titles = [
    '',
    t('What happened?', 'මොකක්ද සිදු වුණේ?'),
    t('Where did it happen?', 'එය සිදු වුණේ කොහේද?'),
    t('When did it happen?', 'එය සිදු වුණේ කවදාද?'),
    t('Tell us in your own words', 'ඔබේම වචනවලින් කියන්න'),
    t('Let’s protect your identity', 'ඔබේ අනන්‍යතාව ආරක්ෂා කරමු'),
    t('Anything to show us?', 'පෙන්වීමට යමක් තිබේද?'),
    t('How can we reach you?', 'අපට ඔබව සම්බන්ධ කරගත හැක්කේ කෙසේද?'),
    t('Check and send', 'පරීක්ෂා කර යවන්න'),
  ];

  const send = () => {
    setSending(1);
    setTimeout(() => setSending(2), 700);
    setTimeout(() => setSending(3), 1400);
    setTimeout(() => {
      submit();
      setSending(0);
      go('done', { replace: true });
    }, 2100);
  };

  if (step === 0) return <Intro onStart={() => setStep(1)} onCancel={() => { resetDraft(); go('home', { replace: true }); }} />;

  return (
    <div className="flex-1 flex flex-col">
      <div className="sticky top-0 z-10 bg-mist/95 backdrop-blur px-4 pt-3 pb-3 border-b border-line/60">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setStep(step - 1)} className="h-10 -ml-2 pl-1.5 pr-3 rounded-full flex items-center gap-1 text-navy font-semibold hover:bg-navy-50">
            <ArrowLeft size={20} /> {t('Back', 'ආපසු')}
          </button>
          <span className="text-sm text-muted font-semibold">{t(`Step ${step} of ${STEPS}`, `පියවර ${step} / ${STEPS}`)}</span>
          <button onClick={() => setLeaving(true)} className="h-10 px-3 rounded-full flex items-center gap-1 text-muted font-semibold hover:bg-navy-50">
            <X size={18} /> {t('Stop', 'නවත්වන්න')}
          </button>
        </div>
        <ThreadBar total={STEPS} current={step - 1} label={t(`Step ${step} of ${STEPS}`, `පියවර ${step} / ${STEPS}`)} />
      </div>

      <div className="px-4 pt-5 pb-6 flex-1">
        <h1 className="text-[23px] font-bold leading-tight mb-1">{titles[step]}</h1>

        {step === 1 && (
          <>
            <p className="text-muted mb-4">{t('Choose the closest one. You can explain more later.', 'වඩාත් ගැළපෙන එක තෝරන්න. පසුව වැඩිපුර පැහැදිලි කළ හැකියි.')}</p>
            <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label={titles[1]}>
              {(Object.keys(CATEGORY) as Category[]).map((k) => {
                const I = CAT_ICON[k];
                const sel = d.category === k;
                return (
                  <button
                    key={k}
                    role="radio"
                    aria-checked={sel}
                    onClick={() => patch({ category: k })}
                    className={cx(
                      'relative text-left rounded-card border-2 p-3.5 min-h-[128px] flex flex-col transition-colors',
                      sel ? 'border-navy bg-navy-50' : 'border-line bg-surface hover:border-navy/30',
                    )}
                  >
                    <span className={cx('h-10 w-10 rounded-full grid place-items-center mb-2', sel ? 'bg-navy text-white' : 'bg-navy-50 text-navy')}>
                      <I size={20} aria-hidden />
                    </span>
                    <span className="font-bold leading-snug tight">{tb(CATEGORY[k])}</span>
                    <span className="text-[13px] text-muted leading-snug mt-0.5 tight">{tb(CATEGORY[k].hint)}</span>
                    {sel && <Check size={18} className="absolute top-3 right-3 text-navy" aria-hidden />}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 2 && <WhereStep />}

        {step === 3 && (
          <>
            <p className="text-muted mb-4">{t('An approximate time is enough, and safer for you.', 'ආසන්න කාලයක් ප්‍රමාණවත්. එය ඔබට වඩා ආරක්ෂිතයි.')}</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(WHEN) as WhenKey[]).map((k) => (
                <Chip key={k} selected={d.when === k} onClick={() => patch({ when: k })}>{tb(WHEN[k])}</Chip>
              ))}
            </div>
            <div className="mt-5 rounded-card bg-surface border border-line px-4">
              <Toggle
                checked={d.ongoing}
                onChange={(v) => patch({ ongoing: v })}
                label={t('It is still happening', 'එය තවමත් සිදු වෙනවා')}
                hint={t('We will look at your report sooner.', 'අපි ඔබේ පැමිණිල්ල ඉක්මනින් සලකා බලන්නෙමු.')}
              />
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <p className="text-muted mb-3">{t('Write as much or as little as you like. Roles are enough; you do not need exact names or times.', 'කැමති තරම් ලියන්න. තනතුරු ප්‍රමාණවත්; නිශ්චිත නම් හෝ වේලාවන් අවශ්‍ය නැහැ.')}</p>
            <ul className="text-sm text-muted space-y-1 mb-3 pl-1">
              {[t('What happened?', 'මොකක්ද සිදු වුණේ?'), t('Has it happened before?', 'මීට පෙරත් සිදු වුණාද?'), t('Is anyone else affected?', 'වෙනත් අයටත් බලපානවාද?')].map((q) => (
                <li key={q} className="flex gap-2"><span className="text-teal-deep">•</span>{q}</li>
              ))}
            </ul>
            <label htmlFor="desc" className="sr-only">{titles[4]}</label>
            <textarea
              id="desc"
              value={d.description}
              onChange={(e) => patch({ description: e.target.value, privacyDone: {} })}
              rows={9}
              placeholder={t('Start typing here…', 'මෙහි ලියන්න පටන් ගන්න…')}
              className={cx(inputCls, 'py-3 leading-relaxed resize-none min-h-[220px]')}
            />
            <div className="flex items-center justify-between mt-2">
              <button onClick={() => patch({ description: SAMPLE[lang], privacyDone: {} })} className="text-sm font-semibold text-teal-deep flex items-center gap-1.5 py-2">
                <Wand2 size={16} /> {t('Fill sample text (demo)', 'නියැදි පෙළ යොදන්න (ආදර්ශ)')}
              </button>
              <span className="text-[13px] text-muted">{d.description.trim().length < 20 ? t('A few more words', 'තව වචන කිහිපයක්') : '✓'}</span>
            </div>
            <p className="mt-3 text-sm text-muted flex gap-2"><Lock size={16} className="mt-0.5 shrink-0 text-teal-deep" /> {t('Next, we will check this text for details that could reveal who you are.', 'ඊළඟට, ඔබව හඳුනාගත හැකි විස්තර තිබේදැයි අපි මෙම පෙළ පරීක්ෂා කරමු.')}</p>
          </>
        )}

        {step === 5 && <PrivacyStep flags={flags} />}

        {step === 6 && <EvidenceStep />}

        {step === 7 && (
          <>
            <p className="text-muted mb-4">{t('We will never call or text you unless you choose it here.', 'ඔබ මෙහි තෝරා නොගන්නේ නම් අපි කිසිදා ඔබට ඇමතුම් හෝ SMS එවන්නේ නැහැ.')}</p>
            <div className="space-y-2.5" role="radiogroup" aria-label={titles[7]}>
              {(Object.keys(CONTACT) as ContactPref[]).map((k) => {
                const sel = d.contact === k;
                return (
                  <button key={k} role="radio" aria-checked={sel} onClick={() => patch({ contact: k })}
                    className={cx('w-full text-left rounded-card border-2 p-4 flex items-start gap-3', sel ? 'border-navy bg-navy-50' : 'border-line bg-surface')}>
                    <span className={cx('mt-0.5 h-6 w-6 rounded-full border-2 grid place-items-center shrink-0', sel ? 'border-navy' : 'border-line')}>
                      {sel && <span className="h-3 w-3 rounded-full bg-navy" />}
                    </span>
                    <span>
                      <span className="block font-bold">{tb(CONTACT[k])}</span>
                      <span className="block text-sm text-muted">{tb(CONTACT[k].hint)}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            {d.contact === 'counsellor' && (
              <div className="mt-4 animate-rise">
                <p className="font-semibold mb-2">{t('When is it safe to call?', 'ඇමතීමට ආරක්ෂිත වන්නේ කවදාද?')}</p>
                <div className="flex flex-wrap gap-2">
                  {[t('Weekday mornings', 'සතියේ දින උදේ'), t('Weekday evenings', 'සතියේ දින සවස'), t('Weekends', 'සති අන්තය')].map((x) => (
                    <Chip key={x} selected={d.safeTimes === x} onClick={() => patch({ safeTimes: x })}>{x}</Chip>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-4 rounded-card bg-surface border border-line px-4">
              <Toggle checked={d.wantsSupport} onChange={(v) => patch({ wantsSupport: v })}
                label={t('I would also like support', 'මට සහායද අවශ්‍යයි')}
                hint={t('Counselling or legal advice, not only a report.', 'පැමිණිල්ලට අමතරව උපදේශනය හෝ නීති උපදෙස්.')} />
            </div>
          </>
        )}

        {step === 8 && <ReviewStep onEdit={setStep} youFlagsLeft={youFlags.length} />}
      </div>

      <div className="sticky bottom-0 bg-surface border-t border-line px-4 py-3 flex gap-2">
        {step < 8 ? (
          <Button block size="lg" disabled={!canNext} onClick={() => setStep(step + 1)}>
            {step === 5
              ? youFlags.length ? t('Continue without changes', 'වෙනස් නොකර ඉදිරියට') : t('Looks safe, continue', 'ආරක්ෂිතයි, ඉදිරියට')
              : step === 6 && !d.evidence.length ? t('Skip for now', 'දැනට මඟ හරින්න')
              : t('Next', 'ඊළඟ')}
            <ChevronRight size={20} />
          </Button>
        ) : (
          <Button block size="lg" onClick={send} icon={<Lock size={18} />}>{t('Send report securely', 'ආරක්ෂිතව පැමිණිල්ල යවන්න')}</Button>
        )}
      </div>

      {leaving && (
        <div className="absolute inset-0 z-40 bg-ink/40 flex items-end animate-fade" onClick={() => setLeaving(false)}>
          <div className="w-full bg-surface rounded-t-sheet p-5 pb-6 animate-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal aria-labelledby="leave-t">
            <h2 id="leave-t" className="text-xl font-bold">{t('Stop this report?', 'මෙම පැමිණිල්ල නවත්වන්නද?')}</h2>
            <p className="text-muted mt-1">{t('Your answers will be cleared from this phone. Nothing has been sent.', 'ඔබේ පිළිතුරු මෙම දුරකථනයෙන් මැකී යයි. කිසිවක් යවා නැහැ.')}</p>
            <div className="grid gap-2 mt-4">
              <Button variant="secondary" size="lg" onClick={() => setLeaving(false)}>{t('Keep going', 'දිගටම කරගෙන යන්න')}</Button>
              <Button variant="primary" size="lg" icon={<LogOut size={18} />} onClick={() => { resetDraft(); go('home', { replace: true }); }}>{t('Clear and stop', 'මකා නවත්වන්න')}</Button>
            </div>
          </div>
        </div>
      )}

      {sending > 0 && (
        <div className="absolute inset-0 z-50 bg-navy/95 text-white grid place-items-center animate-fade" role="status" aria-live="assertive">
          <div className="w-64">
            {[t('Removing hidden details', 'සැඟවුණු විස්තර ඉවත් කරමින්'), t('Encrypting your report', 'ඔබේ පැමිණිල්ල සංකේතනය කරමින්'), t('Sending to independent reviewers', 'ස්වාධීන සමාලෝචකයින්ට යවමින්')].map((l, i) => (
              <div key={l} className={cx('flex items-center gap-3 py-2 transition-opacity', sending > i ? 'opacity-100' : 'opacity-40')}>
                <span className={cx('h-7 w-7 rounded-full grid place-items-center', sending > i + 1 ? 'bg-teal' : 'border-2 border-white/50')}>
                  {sending > i + 1 ? <Check size={16} strokeWidth={3} /> : sending === i + 1 ? <span className="h-3 w-3 rounded-full bg-white animate-pulse" /> : null}
                </span>
                <span className="font-semibold">{l}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Intro({ onStart, onCancel }: { onStart: () => void; onCancel: () => void }) {
  const { t } = useT();
  const points = [
    { i: UserX, h: t('You don’t have to give your name', 'ඔබේ නම දිය යුතු නැහැ'), p: t('We give you a reference number instead.', 'ඒ වෙනුවට අපි ඔබට යොමු අංකයක් දෙනවා.') },
    { i: Eye, h: t('Nothing is sent until you press Send', '“යවන්න” ඔබන තුරු කිසිවක් යන්නේ නැහැ'), p: t('You can go back and change anything.', 'ඕනෑම දෙයක් ආපසු ගොස් වෙනස් කළ හැකියි.') },
    { i: LogOut, h: t('Leave any time with Exit', '“පිටවන්න” මඟින් ඕනෑම වෙලාවක පිටවන්න'), p: t('Your answers are wiped and the cover app appears.', 'ඔබේ පිළිතුරු මැකී ආවරණ යෙදුම පෙන්වයි.') },
    { i: ScanEye, h: t('Independent reviewers read it', 'ස්වාධීන සමාලෝචකයින් එය කියවයි'), p: t('Not the organisation you are reporting.', 'ඔබ පැමිණිලි කරන ආයතනය නොවේ.') },
  ];
  return (
    <div className="px-4 pt-6 pb-8">
      <span className="h-14 w-14 rounded-2xl bg-teal-50 text-teal-deep grid place-items-center"><ShieldCheck size={28} /></span>
      <h1 className="text-[26px] font-bold leading-tight mt-4">{t('Before you start', 'ඔබ පටන් ගැනීමට පෙර')}</h1>
      <p className="text-muted mt-1">{t('Take your time. You are in control of what you share.', 'ඔබට අවශ්‍ය තරම් කාලය ගන්න. බෙදා ගන්නා දේ තීරණය කරන්නේ ඔබයි.')}</p>
      <ul className="mt-5 space-y-4">
        {points.map((p) => (
          <li key={p.h} className="flex gap-3">
            <span className="h-10 w-10 rounded-full bg-navy-50 text-navy grid place-items-center shrink-0"><p.i size={19} /></span>
            <div><p className="font-bold leading-snug">{p.h}</p><p className="text-sm text-muted">{p.p}</p></div>
          </li>
        ))}
      </ul>
      <div className="mt-6 rounded-card bg-sos-50 border border-sos/20 p-3.5 flex gap-3 text-[15px]">
        <TriangleAlert className="text-sos shrink-0 mt-0.5" size={20} />
        <p>{t('If you are in danger now, please call 119. This form is not watched around the clock.', 'ඔබ දැන් අනතුරක නම් කරුණාකර 119 අමතන්න. මෙම පෝරමය පැය 24 පුරා අධීක්ෂණය නොකෙරේ.')}</p>
      </div>
      <div className="grid gap-2 mt-6">
        <Button size="lg" onClick={onStart}>{t('Start my report', 'පැමිණිල්ල ආරම්භ කරන්න')} <ChevronRight size={20} /></Button>
        <Button size="lg" variant="ghost" onClick={onCancel}>{t('Not now', 'දැන් නොවේ')}</Button>
      </div>
    </div>
  );
}

function WhereStep() {
  const { t, tb } = useT();
  const d = useApp((s) => s.session.draft);
  const patch = useApp((s) => s.patchDraft);
  const [q, setQ] = useState('');
  const ORGS = useApp((s) => s.orgs);
  const org = ORGS.find((o) => o.id === d.orgId);
  const matches = ORGS.filter((o) => (!d.placeType || o.type === d.placeType || d.placeType === 'other') && (tb(o.name).toLowerCase().includes(q.toLowerCase()) || o.name.en.toLowerCase().includes(q.toLowerCase())));
  return (
    <>
      <p className="text-muted mb-4">{t('This helps us send your report to the right independent reviewer.', 'නිවැරදි ස්වාධීන සමාලෝචකයාට ඔබේ පැමිණිල්ල යැවීමට මෙය උදව් වෙයි.')}</p>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(PLACE) as PlaceType[]).map((k) => {
          const I = PLACE_ICON[k];
          return (
            <Chip key={k} selected={d.placeType === k} onClick={() => patch({ placeType: k, orgId: undefined })}>
              {d.placeType !== k && <I size={16} aria-hidden />} {tb(PLACE[k])}
            </Chip>
          );
        })}
      </div>

      {d.placeType && d.placeType !== 'public' && d.placeType !== 'online' && (
        <div className="mt-6 animate-rise">
          <p className="font-semibold mb-1.5">{t('Which organisation? (optional)', 'කුමන ආයතනයද? (අත්‍යවශ්‍ය නැත)')}</p>
          {org ? (
            <div className="flex items-center gap-3 rounded-card border-2 border-navy bg-navy-50 p-3.5">
              <Building2 className="text-navy" />
              <div className="flex-1"><p className="font-bold">{tb(org.name)}</p><p className="text-sm text-muted">{tb(org.sector)} · {tb(org.district)}</p></div>
              <button aria-label={t('Remove', 'ඉවත් කරන්න')} onClick={() => patch({ orgId: undefined })} className="h-9 w-9 grid place-items-center rounded-full hover:bg-white"><X size={18} /></button>
            </div>
          ) : d.noOrg ? null : (
            <>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('Search by name', 'නමින් සොයන්න')} aria-label={t('Search organisations', 'ආයතන සොයන්න')} className={inputCls} />
              <ul className="mt-2 rounded-card border border-line bg-surface divide-y divide-line overflow-clip">
                {matches.slice(0, 4).map((o) => (
                  <li key={o.id}>
                    <button onClick={() => patch({ orgId: o.id, orgText: '' })} className="w-full text-left px-4 py-3 hover:bg-mist flex items-center gap-3">
                      <Building2 size={18} className="text-muted" />
                      <span className="flex-1"><span className="block font-semibold">{tb(o.name)}</span><span className="block text-[13px] text-muted">{tb(o.sector)} · {tb(o.district)}</span></span>
                      <ChevronRight size={18} className="text-muted" />
                    </button>
                  </li>
                ))}
                {matches.length === 0 && <li className="px-4 py-3 text-sm text-muted">{t('Not listed. That’s fine, we will record the name you typed.', 'ලැයිස්තුවේ නැහැ. කමක් නැහැ, ඔබ ටයිප් කළ නම සටහන් කරමු.')}</li>}
              </ul>
            </>
          )}
          <label className="flex items-center gap-3 mt-3 py-2 cursor-pointer">
            <input type="checkbox" checked={d.noOrg} onChange={(e) => patch({ noOrg: e.target.checked, orgId: undefined })} className="h-5 w-5 accent-[rgb(var(--navy))]" />
            <span className="font-medium">{t('I’d rather not name it yet', 'දැනට නම කීමට අකමැතියි')}</span>
          </label>
        </div>
      )}

      {d.placeType && (
        <div className="mt-5">
          <label htmlFor="district" className="font-semibold block mb-1.5">{t('District', 'දිස්ත්‍රික්කය')}</label>
          <select id="district" value={d.district} onChange={(e) => patch({ district: e.target.value })} className={inputCls}>
            {DISTRICTS.map((x) => <option key={x.en} value={x.en}>{tb(x)}</option>)}
          </select>
        </div>
      )}
    </>
  );
}

function PrivacyStep({ flags }: { flags: ReturnType<typeof findPrivacyFlags> }) {
  const { t, tb } = useT();
  const d = useApp((s) => s.session.draft);
  const patch = useApp((s) => s.patchDraft);
  const done = Object.entries(d.privacyDone);
  const open = flags.filter((f) => !d.privacyDone[`${f.kind}:${f.text}`]);

  const replace = (f: (typeof flags)[number]) => {
    const rep = tb(FLAG_COPY[f.kind].replace);
    const text = d.description.slice(0, f.start) + rep + d.description.slice(f.end);
    patch({ description: text, privacyDone: { ...d.privacyDone, [`${f.kind}:${f.text}`]: 'replaced', [`${f.kind}:${rep}`]: 'kept' } });
  };
  const keep = (f: (typeof flags)[number]) => patch({ privacyDone: { ...d.privacyDone, [`${f.kind}:${f.text}`]: 'kept' } });

  // highlighted preview of the description
  const parts: React.ReactNode[] = [];
  let i = 0;
  flags.forEach((f) => {
    if (f.start > i) parts.push(d.description.slice(i, f.start));
    const state = d.privacyDone[`${f.kind}:${f.text}`];
    parts.push(
      <mark key={f.id} className={cx('flag', FLAG_COPY[f.kind].risk === 'other' && 'flag-person', state && 'flag-done')}>{f.text}</mark>,
    );
    i = f.end;
  });
  parts.push(d.description.slice(i));

  return (
    <>
      <p className="text-muted mb-4">
        {open.length
          ? t(`We found ${open.length} detail${open.length > 1 ? 's' : ''} worth checking. You decide what stays.`, `පරීක්ෂා කළ යුතු විස්තර ${open.length}ක් හමු විය. තබා ගන්නේ මොනවාදැයි ඔබ තීරණය කරන්න.`)
          : t('Your report looks safe to send.', 'ඔබේ පැමිණිල්ල යැවීමට ආරක්ෂිත බව පෙනේ.')}
      </p>
      <div className="rounded-card bg-surface border border-line p-4 text-[15px] leading-relaxed whitespace-pre-wrap" aria-label={t('Your text with highlighted details', 'ඉස්මතු කළ විස්තර සහිත ඔබේ පෙළ')}>
        {parts}
      </div>
      <p className="flex gap-4 text-[13px] text-muted mt-2">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-warn-50 border-b-2 border-warn" />{t('Could identify you', 'ඔබව හඳුනාගත හැකියි')}</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-navy-50 border-b-2 border-navy" />{t('Names someone else', 'වෙනත් අයෙක්')}</span>
      </p>

      <ul className="mt-4 space-y-3">
        {open.map((f) => {
          const c = FLAG_COPY[f.kind];
          return (
            <li key={f.id} className="rounded-card bg-surface border border-line hc-border p-4 animate-rise">
              <div className="flex items-center gap-2">
                <Pill tone={c.risk === 'you' ? 'warn' : 'navy'}>{c.risk === 'you' ? <TriangleAlert size={13} /> : <Eye size={13} />} {tb(c.title)}</Pill>
              </div>
              <p className="mt-2 font-semibold">“{f.text}”</p>
              <p className="text-sm text-muted mt-0.5">{tb(c.why)}</p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant={c.risk === 'you' ? 'primary' : 'secondary'} onClick={() => replace(f)}>
                  {t('Change to', 'වෙනස් කරන්න')} “{tb(c.replace)}”
                </Button>
                <Button size="sm" variant="ghost" onClick={() => keep(f)}>{t('Keep', 'තබාගන්න')}</Button>
              </div>
            </li>
          );
        })}
      </ul>
      {done.length > 0 && !open.length && (
        <div className="mt-4 rounded-card bg-ok-50 text-ok p-4 flex gap-3 animate-rise">
          <ShieldCheck className="shrink-0" />
          <p className="font-semibold">{t('Privacy check complete. You can still edit the text by going back.', 'පෞද්ගලිකත්ව පරීක්ෂාව අවසන්. ආපසු ගොස් පෙළ තවමත් සංස්කරණය කළ හැකියි.')}</p>
        </div>
      )}
      <p className="mt-4 text-[13px] text-muted flex gap-2"><Sparkles size={15} className="shrink-0 mt-0.5" />{t('This check runs on your phone. Your text is not sent anywhere until you press Send.', 'මෙම පරීක්ෂාව ඔබේ දුරකථනයේම සිදු වේ. “යවන්න” ඔබන තුරු ඔබේ පෙළ කොහේවත් යන්නේ නැහැ.')}</p>
    </>
  );
}

function EvidenceStep() {
  const { t } = useT();
  const d = useApp((s) => s.session.draft);
  const patch = useApp((s) => s.patchDraft);
  const [busy, setBusy] = useState<string | null>(null);
  const add = (kind: 'image' | 'audio' | 'doc') => {
    const name = { image: 'screenshot_chat.png', audio: 'voice_note.m4a', doc: 'letter.pdf' }[kind];
    const size = { image: '412 KB', audio: '1.2 MB', doc: '96 KB' }[kind];
    const id = uid();
    setBusy(id);
    setTimeout(() => {
      patch({ evidence: [...useApp.getState().session.draft.evidence, { id, name, kind, size }] });
      setBusy(null);
    }, 1100);
  };
  const ICON = { image: ImageIcon, audio: Mic, doc: FileText };
  return (
    <>
      <p className="text-muted mb-4">{t('Optional. Screenshots, voice notes or documents can help, but your report counts without them.', 'අත්‍යවශ්‍ය නැහැ. තිර රූප, හඬ සටහන් හෝ ලේඛන උදව් විය හැකි නමුත් ඒවා නැතිවත් ඔබේ පැමිණිල්ල වලංගුයි.')}</p>
      <div className="grid grid-cols-3 gap-2">
        {([['image', t('Photo', 'ඡායාරූපය')], ['audio', t('Voice note', 'හඬ සටහන')], ['doc', t('Document', 'ලේඛනය')]] as const).map(([k, l]) => {
          const I = ICON[k];
          return (
            <button key={k} onClick={() => add(k)} disabled={!!busy} className="rounded-card border-2 border-dashed border-line bg-surface min-h-[96px] flex flex-col items-center justify-center gap-1.5 text-navy font-semibold hover:border-navy/40 disabled:opacity-60">
              <I size={22} /> <span className="text-sm">{l}</span>
            </button>
          );
        })}
      </div>
      <ul className="mt-4 space-y-2" aria-live="polite">
        {d.evidence.map((e) => {
          const I = ICON[e.kind];
          return (
            <li key={e.id} className="flex items-center gap-3 rounded-card bg-surface border border-line p-3 animate-rise">
              <span className="h-10 w-10 rounded-xl bg-navy-50 text-navy grid place-items-center"><I size={18} /></span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{e.name} <span className="text-muted font-normal text-sm">{e.size}</span></p>
                <p className="text-[13px] text-ok flex items-center gap-1"><ShieldCheck size={14} /> {t('Location and device details removed', 'ස්ථාන හා උපාංග විස්තර ඉවත් කළා')}</p>
              </div>
              <button aria-label={t('Remove file', 'ගොනුව ඉවත් කරන්න')} onClick={() => patch({ evidence: d.evidence.filter((x) => x.id !== e.id) })} className="h-10 w-10 grid place-items-center rounded-full hover:bg-mist text-muted"><Trash2 size={18} /></button>
            </li>
          );
        })}
        {busy && (
          <li className="flex items-center gap-3 rounded-card bg-surface border border-line p-3">
            <span className="h-10 w-10 rounded-xl bg-teal-50 grid place-items-center"><Paperclip size={18} className="text-teal-deep animate-pulse" /></span>
            <p className="text-sm font-semibold">{t('Removing hidden location data…', 'සැඟවුණු ස්ථාන දත්ත ඉවත් කරමින්…')}</p>
          </li>
        )}
      </ul>
      <p className="mt-4 text-[13px] text-muted flex gap-2"><Lock size={15} className="shrink-0 mt-0.5" />{t('Files are encrypted. Only the reviewer assigned to you can open them, and every opening is logged.', 'ගොනු සංකේතනය කෙරේ. ඔබට පවරා ඇති සමාලෝචකයාට පමණක් ඒවා විවෘත කළ හැකි අතර, එක් එක් විවෘත කිරීම සටහන් වේ.')}</p>
    </>
  );
}

function ReviewStep({ onEdit, youFlagsLeft }: { onEdit: (s: number) => void; youFlagsLeft: number }) {
  const { t, tb } = useT();
  const d = useApp((s) => s.session.draft);
  const org = useApp((s) => s.orgs.find((o) => o.id === d.orgId));
  const rows = [
    { s: 1, l: t('What happened', 'සිදු වූ දේ'), v: d.category ? tb(CATEGORY[d.category]) : '—' },
    { s: 2, l: t('Where', 'කොහේද'), v: [d.placeType && tb(PLACE[d.placeType]), org ? tb(org.name) : d.noOrg ? t('Not named', 'නම් කර නැත') : null].filter(Boolean).join(' · ') },
    { s: 3, l: t('When', 'කවදාද'), v: `${d.when ? tb(WHEN[d.when]) : '—'}${d.ongoing ? ' · ' + t('still happening', 'තවමත් සිදුවේ') : ''}` },
    { s: 4, l: t('Your words', 'ඔබේ වචන'), v: d.description.length > 90 ? d.description.slice(0, 90) + '…' : d.description },
    { s: 5, l: t('Privacy', 'පෞද්ගලිකත්වය'), v: youFlagsLeft ? t(`${youFlagsLeft} detail(s) kept as written`, `විස්තර ${youFlagsLeft}ක් එලෙසම තැබුවා`) : t('Checked', 'පරීක්ෂා කළා') },
    { s: 6, l: t('Files', 'ගොනු'), v: d.evidence.length ? `${d.evidence.length}` : t('None', 'නැත') },
    { s: 7, l: t('Contact', 'සම්බන්ධතාව'), v: tb(CONTACT[d.contact]) + (d.wantsSupport ? ' · ' + t('wants support', 'සහාය අවශ්‍යයි') : '') },
  ];
  return (
    <>
      <p className="text-muted mb-4">{t('Make sure this is what you want to share.', 'ඔබ බෙදා ගැනීමට කැමති මෙයම දැයි සහතික කරගන්න.')}</p>
      <dl className="rounded-card bg-surface border border-line divide-y divide-line">
        {rows.map((r) => (
          <div key={r.s} className="flex items-start gap-3 px-4 py-3">
            <div className="flex-1 min-w-0">
              <dt className="text-[13px] text-muted font-semibold">{r.l}</dt>
              <dd className="text-[15px] break-words">{r.v}</dd>
            </div>
            <button onClick={() => onEdit(r.s)} className="text-sm font-semibold text-teal-deep px-2 py-1 rounded-lg hover:bg-teal-50 shrink-0">{t('Change', 'වෙනස් කරන්න')}</button>
          </div>
        ))}
      </dl>
      <div className="mt-4 rounded-card bg-navy-50 p-4 text-[15px] space-y-2">
        <p className="font-bold text-navy">{t('What happens with your report', 'ඔබේ පැමිණිල්ලට සිදුවන දේ')}</p>
        <p className="flex gap-2"><Check size={18} className="text-teal-deep shrink-0 mt-0.5" />{t('An independent reviewer reads it, not the organisation.', 'ආයතනය නොව, ස්වාධීන සමාලෝචකයෙක් එය කියවයි.')}</p>
        <p className="flex gap-2"><Check size={18} className="text-teal-deep shrink-0 mt-0.5" />{t('The organisation is only told after safety checks, and never who you are.', 'ආරක්ෂක පරීක්ෂාවෙන් පසුව පමණක් ආයතනයට දැනුම් දෙන අතර, ඔබ කවුදැයි කිසිදා නොකියයි.')}</p>
        <p className="flex gap-2"><Check size={18} className="text-teal-deep shrink-0 mt-0.5" />{t('Nothing is published about you. Ever.', 'ඔබ ගැන කිසිවක් කිසිදා ප්‍රකාශයට පත් නොකෙරේ.')}</p>
      </div>
    </>
  );
}

export { emptyDraft };
