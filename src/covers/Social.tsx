import { useState } from 'react';
import { Heart, MessageCircle, Send, Search, Home, Users, Bell, Menu, Image as ImageIcon } from 'lucide-react';

type Post = { id: number; who: string; c: string; time: string; text: string; img?: string; likes: number; comments: number };
const STORIES = [
  { n: 'Your story', c: '#c2410c' },
  { n: 'Nimali', c: '#7c3aed' },
  { n: 'Ishara', c: '#0891b2' },
  { n: 'Tharushi', c: '#16a34a' },
  { n: 'Kavindi', c: '#db2777' },
  { n: 'Dulani', c: '#ca8a04' },
];

/** "Katha" — a social feed. Posting the PIN opens the app; anything else is posted like normal. */
export default function Social({ pin, onUnlock }: { pin: string; onUnlock: () => void }) {
  const [draft, setDraft] = useState('');
  const [posts, setPosts] = useState<Post[]>([
    { id: 1, who: 'Nimali Fernando', c: '#7c3aed', time: '2 h', text: 'Sunset walk after a long week 🌅', img: 'linear-gradient(160deg,#f59e0b 0%,#f97316 35%,#be185d 70%,#312e81 100%)', likes: 48, comments: 6 },
    { id: 2, who: 'Ishara Jayasinghe', c: '#0891b2', time: '5 h', text: 'Exam week tip: 25 minutes study, 5 minutes break. Works every time. Good luck everyone!', likes: 21, comments: 9 },
    { id: 3, who: 'Kavindi Silva', c: '#db2777', time: '1 d', text: 'Tried amma’s kiribath recipe with a little coconut milk extra. Perfect.', img: 'linear-gradient(135deg,#fef3c7 0%,#fde68a 40%,#fcd34d 100%)', likes: 63, comments: 12 },
  ]);

  const post = () => {
    if (draft.trim() === pin) {
      setDraft('');
      (document.activeElement as HTMLElement)?.blur();
      onUnlock();
      return;
    }
    if (!draft.trim()) return;
    setPosts((p) => [{ id: Date.now(), who: 'You', c: '#c2410c', time: 'now', text: draft.trim(), likes: 0, comments: 0 }, ...p]);
    setDraft('');
  };

  return (
    <div className="h-full flex flex-col bg-[#f6f3f0] text-[#22180f]" style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>
      <header className="flex items-center justify-between px-4 pt-2 pb-2 bg-white">
        <span className="text-[26px] font-extrabold tracking-tight text-[#c2410c]">katha</span>
        <div className="flex gap-1">
          <span className="h-10 w-10 grid place-items-center rounded-full bg-[#f6f3f0]"><Search size={20} aria-label="Search" /></span>
          <span className="h-10 w-10 grid place-items-center rounded-full bg-[#f6f3f0]"><Send size={19} aria-label="Messages" /></span>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="bg-white px-4 pb-3 flex gap-3 overflow-x-auto no-scrollbar">
          {STORIES.map((s) => (
            <div key={s.n} className="flex flex-col items-center gap-1 shrink-0 w-16">
              <span className="h-16 w-16 rounded-full p-[3px]" style={{ background: `conic-gradient(${s.c}, #f59e0b, ${s.c})` }}>
                <span className="h-full w-full rounded-full bg-white p-[2px] block">
                  <span className="h-full w-full rounded-full grid place-items-center text-white font-bold text-lg" style={{ background: s.c }}>{s.n[0]}</span>
                </span>
              </span>
              <span className="text-[12px] truncate w-full text-center">{s.n}</span>
            </div>
          ))}
        </div>
        <div className="bg-white mt-2 px-4 py-3 flex items-center gap-3">
          <span className="h-10 w-10 rounded-full bg-[#c2410c] text-white grid place-items-center font-bold shrink-0">Y</span>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && post()}
            aria-label="Write a post"
            placeholder="What's on your mind?"
            className="flex-1 h-11 rounded-full bg-[#f6f3f0] px-4 outline-none text-[16px] placeholder:text-[#8b7d70]"
          />
          {draft ? (
            <button onClick={post} className="h-10 px-4 rounded-full bg-[#c2410c] text-white font-semibold text-sm">Post</button>
          ) : (
            <ImageIcon size={22} className="text-[#16a34a]" aria-label="Add photo" />
          )}
        </div>
        <ul className="mt-2 space-y-2 pb-4">
          {posts.map((p) => (
            <li key={p.id} className="bg-white pt-3 animate-fade">
              <div className="flex items-center gap-2.5 px-4">
                <span className="h-10 w-10 rounded-full grid place-items-center text-white font-bold" style={{ background: p.c }}>{p.who[0]}</span>
                <div>
                  <p className="font-semibold text-[15px]">{p.who}</p>
                  <p className="text-[12px] text-[#8b7d70]">{p.time}</p>
                </div>
              </div>
              <p className="px-4 mt-2 text-[15px]">{p.text}</p>
              {p.img && <div className="mt-3 h-52" style={{ background: p.img }} />}
              <div className="flex items-center gap-5 px-4 py-2.5 text-[#6b5d50] text-sm">
                <span className="flex items-center gap-1.5"><Heart size={18} /> {p.likes}</span>
                <span className="flex items-center gap-1.5"><MessageCircle size={18} /> {p.comments}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <nav className="grid grid-cols-4 bg-white border-t border-[#eadfd5] py-2 text-[#6b5d50]">
        {[Home, Users, Bell, Menu].map((I, i) => (
          <span key={i} className={`grid place-items-center h-9 ${i === 0 ? 'text-[#c2410c]' : ''}`}><I size={22} /></span>
        ))}
      </nav>
    </div>
  );
}
