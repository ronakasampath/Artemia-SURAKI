import { useState } from 'react';
import { History } from 'lucide-react';

type Op = '+' | '−' | '×' | '÷';

/** A fully working calculator. Typing the PIN and pressing "=" (with no operation pending) opens the app.
 *  Any other input behaves exactly like a normal calculator — a wrong PIN gives no sign that anything is hidden. */
export default function Calculator({ pin, onUnlock }: { pin: string; onUnlock: () => void }) {
  const [display, setDisplay] = useState('0');
  const [acc, setAcc] = useState<number | null>(null);
  const [op, setOp] = useState<Op | null>(null);
  const [fresh, setFresh] = useState(true);
  const [history, setHistory] = useState('1,250 × 12 = 15,000');
  const [typed, setTyped] = useState('');

  const num = (s: string) => parseFloat(s.replace(/,/g, ''));
  const fmt = (n: number) => {
    if (!isFinite(n)) return 'Error';
    const r = Math.round(n * 1e10) / 1e10;
    const [i, d] = String(r).split('.');
    return Number(i).toLocaleString('en-US') + (d ? '.' + d : '');
  };
  const calc = (a: number, b: number, o: Op) => (o === '+' ? a + b : o === '−' ? a - b : o === '×' ? a * b : a / b);

  const digit = (d: string) => {
    setTyped((t) => (op === null && fresh && acc === null ? d : t + d));
    if (fresh || display === '0') {
      setDisplay(d === '.' ? '0.' : d);
      setFresh(false);
    } else if (!(d === '.' && display.includes('.')) && display.replace(/[,.]/g, '').length < 12) {
      const raw = display.replace(/,/g, '') + d;
      setDisplay(d === '.' || raw.includes('.') ? raw : Number(raw).toLocaleString('en-US'));
    }
  };
  const operator = (o: Op) => {
    setTyped('#');
    const cur = num(display);
    if (acc !== null && op && !fresh) {
      const r = calc(acc, cur, op);
      setAcc(r);
      setDisplay(fmt(r));
    } else setAcc(cur);
    setOp(o);
    setFresh(true);
  };
  const equals = () => {
    if (op === null && typed === pin) {
      if (navigator.vibrate) navigator.vibrate(15);
      setTyped('');
      onUnlock();
      return;
    }
    if (acc === null || !op) return;
    const r = calc(acc, num(display), op);
    setHistory(`${fmt(acc)} ${op} ${display} = ${fmt(r)}`);
    setDisplay(fmt(r));
    setAcc(null);
    setOp(null);
    setFresh(true);
    setTyped('#');
  };
  const clear = () => {
    setDisplay('0');
    setAcc(null);
    setOp(null);
    setFresh(true);
    setTyped('');
  };

  const K = ({ l, onClick, kind = 'num', wide, aria }: { l: string; onClick: () => void; kind?: 'num' | 'fn' | 'op' | 'eq'; wide?: boolean; aria?: string }) => (
    <button
      onClick={onClick}
      aria-label={aria ?? l}
      className={[
        'h-[68px] rounded-[22px] text-[26px] font-medium transition-[filter,transform] active:scale-[.96] active:brightness-125 select-none',
        wide ? 'col-span-2 text-left pl-7' : '',
        kind === 'num' && 'bg-[#323b46] text-[#eef2f6]',
        kind === 'fn' && 'bg-[#4a5563] text-[#eef2f6] text-[22px]',
        kind === 'op' && (op === l && fresh ? 'bg-[#eef2f6] text-[#e28f22]' : 'bg-[#f2a541] text-[#1c232b]'),
        kind === 'eq' && 'bg-[#9fd3c7] text-[#13302b]',
      ].filter(Boolean).join(' ')}
    >
      {l}
    </button>
  );

  return (
    <div className="h-full flex flex-col bg-[#1c232b] text-white" style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>
      <div className="flex items-center justify-between px-5 pt-3 text-[#9aa6b4]">
        <span className="text-[15px]">Calculator</span>
        <History size={20} aria-label="History" />
      </div>
      <div className="flex-1 flex flex-col justify-end px-6 pb-4 min-h-0">
        <p className="text-right text-[#7f8b99] text-lg truncate">{history}</p>
        <p className="text-right text-[#9aa6b4] text-xl h-7">{acc !== null && op ? `${fmt(acc)} ${op}` : ''}</p>
        <p aria-live="polite" className="text-right font-light tracking-tight truncate" style={{ fontSize: display.length > 9 ? 44 : 64, lineHeight: 1.1 }}>
          {display}
        </p>
      </div>
      <div className="grid grid-cols-4 gap-3 px-4 pb-7">
        <K l="AC" kind="fn" onClick={clear} aria="All clear" />
        <K l="±" kind="fn" onClick={() => setDisplay(fmt(-num(display)))} aria="Plus minus" />
        <K l="%" kind="fn" onClick={() => setDisplay(fmt(num(display) / 100))} aria="Percent" />
        <K l="÷" kind="op" onClick={() => operator('÷')} aria="Divide" />
        {['7', '8', '9'].map((d) => <K key={d} l={d} onClick={() => digit(d)} />)}
        <K l="×" kind="op" onClick={() => operator('×')} aria="Multiply" />
        {['4', '5', '6'].map((d) => <K key={d} l={d} onClick={() => digit(d)} />)}
        <K l="−" kind="op" onClick={() => operator('−')} aria="Minus" />
        {['1', '2', '3'].map((d) => <K key={d} l={d} onClick={() => digit(d)} />)}
        <K l="+" kind="op" onClick={() => operator('+')} aria="Plus" />
        <K l="0" wide onClick={() => digit('0')} />
        <K l="." onClick={() => digit('.')} aria="Decimal point" />
        <K l="=" kind="eq" onClick={equals} aria="Equals" />
      </div>
    </div>
  );
}
