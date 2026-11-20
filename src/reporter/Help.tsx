import { useState } from 'react';
import { ChevronDown, Phone, Scale, ShieldCheck, Footprints, HeartHandshake } from 'lucide-react';
import { useT } from '../lib/i18n';
import { cx } from '../components/ui';

export default function Help() {
  const { t } = useT();
  const lines = [
    { n: '119', l: t('Police emergency', 'පොලිස් හදිසි ඇමතුම'), d: t('If you are in danger now', 'ඔබ දැන් අනතුරක නම්'), sos: true },
    { n: '1938', l: t('Women’s helpline', 'කාන්තා සහාය සේවය'), d: t('24 hours · Sinhala, Tamil, English', 'පැය 24 · සිංහල, දෙමළ, ඉංග්‍රීසි') },
    { n: '109', l: t('Police: violence against women & children', 'පොලිසිය: කාන්තා හා ළමා හිංසනය'), d: t('24 hours, to report a crime', 'පැය 24, අපරාධයක් වාර්තා කිරීමට') },
    { n: '1929', l: t('Child helpline', 'ළමා සහාය සේවය'), d: t('If the person is under 18', 'පුද්ගලයා අවු. 18ට අඩු නම්') },
    { n: '1990', l: t('Ambulance', 'ගිලන් රථ'), d: t('Suwa Seriya, free', 'සුව සැරිය, නොමිලේ') },
  ];
  const guides = [
    {
      i: Footprints, h: t('Make a safety plan', 'ආරක්ෂක සැලැස්මක් සාදන්න'),
      b: [
        t('Pick one person you trust and agree on a code word.', 'ඔබ විශ්වාස කරන එක් අයෙක් තෝරා රහස් වචනයක් එකඟ වන්න.'),
        t('Avoid being alone with the person where possible.', 'හැකි තාක් එම පුද්ගලයා සමඟ තනිව සිටීමෙන් වළකින්න.'),
        t('Keep a private note of dates and what happened.', 'දිනයන් හා සිදු වූ දේ පෞද්ගලිකව සටහන් කරගන්න.'),
      ],
    },
    {
      i: Scale, h: t('Your rights', 'ඔබේ අයිතිවාසිකම්'),
      b: [
        t('Sexual harassment is a criminal offence in Sri Lanka (Penal Code, section 345).', 'ලිංගික හිරිහැර ශ්‍රී ලංකාවේ අපරාධ වරදකි (දණ්ඩ නීති සංග්‍රහය, 345 වගන්තිය).'),
        t('Your employer or university should not punish you for reporting.', 'පැමිණිලි කිරීම නිසා ඔබේ සේවායෝජකයා හෝ විශ්වවිද්‍යාලය ඔබට දඬුවම් නොකළ යුතුය.'),
        t('You can get free legal advice. Ask through secure messages.', 'ඔබට නොමිලේ නීති උපදෙස් ලබාගත හැකියි. ආරක්ෂිත පණිවිඩ මඟින් අසන්න.'),
      ],
    },
    {
      i: HeartHandshake, h: t('Looking after yourself', 'ඔබ ගැන සැලකිලිමත් වීම'),
      b: [
        t('Feeling shaken, angry or numb is a normal reaction.', 'කම්පනය, කෝපය හෝ හැඟීම් නැති බව සාමාන්‍ය ප්‍රතික්‍රියාවකි.'),
        t('Talking to a counsellor at 1938 is free and confidential.', '1938 හි උපදේශකයෙකු හා කතා කිරීම නොමිලේ හා රහසිගතයි.'),
      ],
    },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="px-4 pt-5 pb-8">
      <h1 className="text-[25px] font-bold leading-tight">{t('Help and support', 'උදව් හා සහාය')}</h1>
      <p className="text-muted mt-1">{t('Calls are made by your phone and are not recorded in this app.', 'ඇමතුම් ඔබේ දුරකථනයෙන් සිදු වන අතර මෙම යෙදුමේ සටහන් නොවේ.')}</p>
      <ul className="mt-4 rounded-card bg-surface border border-line divide-y divide-line overflow-clip">
        {lines.map((x) => (
          <li key={x.n} className="flex items-center gap-3 px-4 py-3">
            <span className={cx('font-bold text-[22px] w-16 tabular-nums', x.sos ? 'text-sos' : 'text-navy')}>{x.n}</span>
            <div className="flex-1 min-w-0"><p className="font-semibold leading-snug">{x.l}</p><p className="text-[13px] text-muted">{x.d}</p></div>
            <a href={`tel:${x.n}`} aria-label={`${t('Call', 'අමතන්න')} ${x.n}`} className={cx('h-11 w-11 rounded-full grid place-items-center shrink-0', x.sos ? 'bg-sos text-white' : 'bg-navy-50 text-navy')}>
              <Phone size={19} />
            </a>
          </li>
        ))}
      </ul>

      <h2 className="font-bold mt-7 mb-2">{t('Guides', 'මාර්ගෝපදේශ')}</h2>
      <div className="space-y-2">
        {guides.map((g, i) => (
          <div key={g.h} className="rounded-card bg-surface border border-line overflow-clip">
            <button aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
              <span className="h-10 w-10 rounded-full bg-teal-50 text-teal-deep grid place-items-center"><g.i size={19} /></span>
              <span className="flex-1 font-semibold">{g.h}</span>
              <ChevronDown className={cx('text-muted transition-transform', open === i && 'rotate-180')} />
            </button>
            {open === i && (
              <ul className="px-4 pb-4 pl-[68px] space-y-2 text-[15px] animate-fade">
                {g.b.map((b) => <li key={b} className="flex gap-2"><ShieldCheck size={16} className="text-teal-deep shrink-0 mt-1" />{b}</li>)}
              </ul>
            )}
          </div>
        ))}
      </div>
      <p className="text-[13px] text-muted mt-6">{t('Helpline numbers checked November 2026. Always call 119 in an emergency.', 'සහාය අංක 2026 නොවැම්බර් පරීක්ෂා කළා. හදිසි අවස්ථාවක සැමවිටම 119 අමතන්න.')}</p>
    </div>
  );
}
