import { useState } from 'react';
import { Bus, Delete, Pill as PillIcon, Plus, ShoppingBasket, Smartphone, Zap, Bell, ChevronRight, X, Utensils } from 'lucide-react';

type Tx = { id: number; name: string; cat: string; amt: number; when: string };
const CATS = [
  { k: 'Food', icon: ShoppingBasket, c: '#e8a33d' },
  { k: 'Transport', icon: Bus, c: '#3f8ecf' },
  { k: 'Bills', icon: Zap, c: '#8a63d2' },
  { k: 'Phone', icon: Smartphone, c: '#2f9e7a' },
  { k: 'Health', icon: PillIcon, c: '#d9605a' },
  { k: 'Eating out', icon: Utensils, c: '#c27c2c' },
];
const iconFor = (k: string) => CATS.find((c) => c.k === k) ?? CATS[0];

/** "Kasi" — a money diary. Entering the PIN as an expense amount and tapping Save opens the app. */
export default function Money({ pin, onUnlock }: { pin: string; onUnlock: () => void }) {
  const [txs, setTxs] = useState<Tx[]>([
    { id: 1, name: 'Groceries', cat: 'Food', amt: 3240, when: 'Today' },
    { id: 2, name: 'Bus fare', cat: 'Transport', amt: 180, when: 'Today' },
    { id: 3, name: 'Mobile reload', cat: 'Phone', amt: 500, when: 'Yesterday' },
    { id: 4, name: 'Pharmacy', cat: 'Health', amt: 1150, when: 'Yesterday' },
    { id: 5, name: 'Electricity bill', cat: 'Bills', amt: 4860, when: 'Mon' },
    { id: 6, name: 'Lunch with team', cat: 'Eating out', amt: 1400, when: 'Sun' },
  ]);
  const [sheet, setSheet] = useState(false);
  const [amt, setAmt] = useState('');
  const [cat, setCat] = useState('Food');
  const spent = 42350 + txs.filter((t) => t.id > 100).reduce((s, t) => s + t.amt, 0);
  const budget = 60000;

  const save = () => {
    if (amt === pin) {
      setSheet(false);
      setAmt('');
      onUnlock();
      return;
    }
    const n = parseInt(amt || '0', 10);
    if (n > 0) setTxs((t) => [{ id: Date.now(), name: cat === 'Food' ? 'Groceries' : cat, cat, amt: n, when: 'Today' }, ...t]);
    setSheet(false);
    setAmt('');
  };

  return (
    <div className="h-full flex flex-col bg-[#f3f6f4] text-[#13231d] relative overflow-clip" style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>
      <div className="bg-[#0e5e4a] text-white px-5 pt-3 pb-16 rounded-b-[28px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="h-9 w-9 rounded-full bg-[#f6d36b] text-[#0e5e4a] grid place-items-center font-bold">D</span>
            <div className="leading-tight">
              <p className="text-[13px] text-white/70">Good evening</p>
              <p className="font-semibold">Dilani</p>
            </div>
          </div>
          <Bell size={22} className="text-white/80" aria-label="Notifications" />
        </div>
        <p className="mt-6 text-white/70 text-sm">Spent this month</p>
        <p className="text-[34px] font-bold tracking-tight">Rs {spent.toLocaleString('en-US')}</p>
        <div className="mt-3 h-2 rounded-full bg-white/20 overflow-clip">
          <div className="h-full bg-[#f6d36b] rounded-full" style={{ width: `${Math.min(100, (spent / budget) * 100)}%` }} />
        </div>
        <p className="mt-1.5 text-[13px] text-white/70">Rs {(budget - spent).toLocaleString('en-US')} left of Rs 60,000 budget</p>
      </div>

      <div className="-mt-11 mx-4 bg-white rounded-2xl p-4 shadow-[0_8px_24px_-12px_rgba(0,0,0,.25)] grid grid-cols-4 gap-2">
        {CATS.slice(0, 4).map((c) => (
          <div key={c.k} className="flex flex-col items-center gap-1.5">
            <span className="h-11 w-11 rounded-2xl grid place-items-center" style={{ background: c.c + '22', color: c.c }}>
              <c.icon size={20} />
            </span>
            <span className="text-[12px] text-[#4b5d55]">{c.k}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-5 mt-5 mb-2">
        <h2 className="font-semibold">Recent</h2>
        <span className="text-[13px] text-[#0e5e4a] font-semibold flex items-center">See all <ChevronRight size={16} /></span>
      </div>
      <ul className="flex-1 overflow-y-auto no-scrollbar px-4 pb-28 space-y-2">
        {txs.map((t) => {
          const c = iconFor(t.cat);
          return (
            <li key={t.id} className="flex items-center gap-3 bg-white rounded-2xl px-3.5 py-3">
              <span className="h-10 w-10 rounded-xl grid place-items-center shrink-0" style={{ background: c.c + '22', color: c.c }}>
                <c.icon size={18} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{t.name}</p>
                <p className="text-[13px] text-[#6b7c74]">{t.cat} · {t.when}</p>
              </div>
              <p className="font-semibold">−Rs {t.amt.toLocaleString('en-US')}</p>
            </li>
          );
        })}
      </ul>

      <button
        onClick={() => setSheet(true)}
        className="absolute bottom-6 right-5 h-14 pl-4 pr-5 rounded-full bg-[#0e5e4a] text-white font-semibold flex items-center gap-2 shadow-[0_10px_24px_-8px_rgba(14,94,74,.7)]"
      >
        <Plus size={22} /> Add
      </button>

      {sheet && (
        <div className="absolute inset-0 bg-black/40 flex items-end animate-fade" onClick={() => setSheet(false)}>
          <div className="w-full bg-white rounded-t-[28px] p-5 animate-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Add expense</h3>
              <button aria-label="Close" onClick={() => setSheet(false)} className="h-9 w-9 grid place-items-center rounded-full bg-[#f3f6f4]"><X size={18} /></button>
            </div>
            <p className="mt-3 text-[13px] text-[#6b7c74]">Amount</p>
            <p className="text-[38px] font-bold tracking-tight" aria-live="polite">Rs {amt ? Number(amt).toLocaleString('en-US') : '0'}</p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
              {CATS.map((c) => (
                <button key={c.k} onClick={() => setCat(c.k)} className={`shrink-0 h-9 px-3.5 rounded-full text-sm font-medium border ${cat === c.k ? 'bg-[#0e5e4a] text-white border-[#0e5e4a]' : 'border-[#d5dfda]'}`}>{c.k}</button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0'].map((d) => (
                <button key={d} aria-label={d} onClick={() => setAmt((a) => (a + d).slice(0, 9))} className="h-14 rounded-2xl bg-[#f3f6f4] text-2xl font-medium active:bg-[#e3ebe7]">{d}</button>
              ))}
              <button aria-label="Delete" onClick={() => setAmt((a) => a.slice(0, -1))} className="h-14 rounded-2xl bg-[#f3f6f4] grid place-items-center"><Delete size={22} /></button>
            </div>
            <button onClick={save} className="mt-3 w-full h-14 rounded-2xl bg-[#0e5e4a] text-white font-semibold text-[17px]">Save</button>
          </div>
        </div>
      )}
    </div>
  );
}
