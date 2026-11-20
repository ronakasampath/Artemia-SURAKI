import { useState } from 'react';
import { Search, BookOpen, CalendarClock, Home, LayoutGrid, MessageSquare, User, PlayCircle } from 'lucide-react';

const COURSES = [
  { t: 'Statistics for Business', w: 'Week 6 · Hypothesis testing', p: 64, c: '#3446a8' },
  { t: 'Business English II', w: 'Week 4 · Report writing', p: 40, c: '#d97706' },
  { t: 'Database Systems', w: 'Week 7 · Normalisation', p: 72, c: '#0f766e' },
  { t: 'Principles of Marketing', w: 'Week 3 · Segmentation', p: 28, c: '#be185d' },
];

/** "Padama" — a course app. Searching for the PIN opens the app; other searches just filter courses. */
export default function Study({ pin, onUnlock }: { pin: string; onUnlock: () => void }) {
  const [q, setQ] = useState('');
  const list = COURSES.filter((c) => c.t.toLowerCase().includes(q.trim().toLowerCase()));
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim() === pin) {
      setQ('');
      (document.activeElement as HTMLElement)?.blur();
      onUnlock();
    }
  };
  return (
    <div className="h-full flex flex-col bg-[#f5f6fb] text-[#1b1f3a]" style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>
      <div className="px-5 pt-3 pb-4 bg-white border-b border-[#e6e8f2]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] text-[#6a6f8f]">Semester 2 · Year 2</p>
            <h1 className="text-xl font-bold">Hi Sachini</h1>
          </div>
          <span className="h-10 w-10 rounded-full bg-[#ffd27a] grid place-items-center font-bold text-[#3446a8]">S</span>
        </div>
        <form onSubmit={submit} className="mt-4 flex items-center gap-2 h-12 rounded-2xl bg-[#f0f2fa] px-3.5" role="search">
          <Search size={18} className="text-[#6a6f8f]" aria-hidden />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            inputMode="search"
            enterKeyHint="search"
            aria-label="Search courses"
            placeholder="Search courses"
            className="flex-1 bg-transparent outline-none text-[16px] placeholder:text-[#8a8fae]"
          />
        </form>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4 space-y-5">
        {!q && (
          <section className="rounded-3xl bg-[#3446a8] text-white p-5 relative overflow-clip">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
            <p className="text-white/70 text-[13px]">Continue learning</p>
            <p className="font-semibold text-lg mt-0.5">Statistics for Business</p>
            <p className="text-white/80 text-sm">Lecture 6.2 · p-values explained</p>
            <div className="flex items-center gap-3 mt-4">
              <PlayCircle size={36} className="text-[#ffd27a]" aria-hidden />
              <div className="flex-1 h-1.5 rounded-full bg-white/20"><div className="h-full w-[64%] rounded-full bg-[#ffd27a]" /></div>
              <span className="text-sm">64%</span>
            </div>
          </section>
        )}
        <section>
          <h2 className="font-semibold mb-2">{q ? `Results for “${q}”` : 'My courses'}</h2>
          {list.length === 0 && <p className="text-[#6a6f8f] text-sm py-6 text-center">No courses match “{q}”.</p>}
          <ul className="space-y-2.5">
            {list.map((c) => (
              <li key={c.t} className="bg-white rounded-2xl p-3.5 flex items-center gap-3 border border-[#e6e8f2]">
                <span className="h-11 w-11 rounded-xl grid place-items-center text-white shrink-0" style={{ background: c.c }}><BookOpen size={20} /></span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{c.t}</p>
                  <p className="text-[13px] text-[#6a6f8f] truncate">{c.w}</p>
                  <div className="mt-1.5 h-1.5 rounded-full bg-[#eceef6]"><div className="h-full rounded-full" style={{ width: `${c.p}%`, background: c.c }} /></div>
                </div>
              </li>
            ))}
          </ul>
        </section>
        {!q && (
          <section>
            <h2 className="font-semibold mb-2">Due soon</h2>
            <div className="bg-white rounded-2xl p-3.5 flex items-center gap-3 border border-[#e6e8f2]">
              <CalendarClock className="text-[#d97706]" aria-hidden />
              <div className="flex-1"><p className="font-medium">Assignment 2: Sampling</p><p className="text-[13px] text-[#6a6f8f]">Statistics · Fri 11:59 pm</p></div>
            </div>
          </section>
        )}
      </div>
      <nav className="grid grid-cols-4 bg-white border-t border-[#e6e8f2] py-2 text-[11px] text-[#6a6f8f]">
        {[{ i: Home, l: 'Home', a: true }, { i: LayoutGrid, l: 'Courses' }, { i: MessageSquare, l: 'Forum' }, { i: User, l: 'Profile' }].map((n) => (
          <span key={n.l} className={`flex flex-col items-center gap-0.5 ${n.a ? 'text-[#3446a8] font-semibold' : ''}`}><n.i size={20} />{n.l}</span>
        ))}
      </nav>
    </div>
  );
}
