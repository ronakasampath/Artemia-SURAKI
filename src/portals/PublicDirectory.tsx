import { Info, LogIn } from 'lucide-react';
import { useNav } from '../lib/nav';
import { useT } from '../lib/i18n';
import { useApp } from '../lib/store';
import { Segmented, Wordmark } from '../components/ui';
import { DirectoryList, OrgProfile } from './Directory';

export default function PublicDirectory() {
  const { t, lang } = useT();
  const dir = useNav((s) => s.dir);
  const setDir = useNav((s) => s.setDir);
  const setS = useApp((s) => s.set);
  const auth = useApp((s) => s.auth);
  return (
    <div lang={lang} className="h-[100dvh] overflow-y-auto thin-scroll bg-mist" id="portal-main">
      <header className="bg-surface border-b border-line">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8 h-16 flex items-center gap-3">
          <Wordmark />
          <span className="text-muted hidden sm:inline">/</span>
          <span className="font-semibold hidden sm:inline">{t('Organisation accountability directory', 'ආයතන වගවීම් නාමාවලිය')}</span>
          <span className="flex-1" />
          <Segmented size="sm" label={t('Language', 'භාෂාව')} value={lang} onChange={(v) => setS('lang', v)} options={[{ v: 'si', l: 'සිං', aria: 'සිංහල' }, { v: 'en', l: 'EN', aria: 'English' }]} />
          <a href="#/login" onClick={(e) => { if (auth) { e.preventDefault(); history.back(); } }} className="h-10 px-3 rounded-full flex items-center gap-1.5 text-sm font-semibold text-navy hover:bg-mist">
            <LogIn size={17} /> <span className="hidden sm:inline">{auth ? t('Back', 'ආපසු') : t('Sign in', 'පිවිසෙන්න')}</span>
          </a>
        </div>
      </header>
      <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-8">
        {dir.orgId ? (
          <div className="max-w-3xl"><OrgProfile orgId={dir.orgId} onBack={() => setDir({})} /></div>
        ) : (
          <>
            <DirectoryList onOpen={(id) => setDir({ orgId: id })} />
            <section className="mt-8 grid md:grid-cols-3 gap-3">
              {[
                [t('What appears here', 'මෙහි දිස් වන දේ'), t('Official notices, verified corrective actions and appeal outcomes approved for publication.', 'ප්‍රකාශනයට අනුමත නිල නිවේදන, තහවුරු කළ නිවැරදි කිරීම් හා අභියාචනා ප්‍රතිඵල.')],
                [t('What never appears', 'කිසිදා දිස් නොවන දේ'), t('Complaints, allegations, names of people, or anything about who reported.', 'පැමිණිලි, චෝදනා, පුද්ගල නම්, හෝ වාර්තා කළේ කවුද යන්න.')],
                [t('No record is not “safe”', 'වාර්තා නැති වීම “ආරක්ෂිත” නොවේ'), t('An empty profile only means nothing has been officially published.', 'හිස් පැතිකඩකින් අදහස් වන්නේ නිල වශයෙන් කිසිවක් ප්‍රකාශ කර නැති බව පමණි.')],
              ].map(([h, b]) => (
                <div key={h} className="rounded-card bg-surface border border-line p-5">
                  <p className="font-bold flex items-center gap-2"><Info size={17} className="text-teal-deep" />{h}</p>
                  <p className="text-muted text-[15px] mt-1">{b}</p>
                </div>
              ))}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
