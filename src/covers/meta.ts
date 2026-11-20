import type { Bi, DisguiseId } from '../lib/types';

export interface CoverMeta {
  id: DisguiseId;
  name: Bi;
  kind: Bi;
  color: string;
  unlock: Bi;
  favicon: string;
}

const svg = (body: string) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${body}</svg>`)}`;

export const COVERS: CoverMeta[] = [
  {
    id: 'calculator',
    name: { en: 'Calculator', si: 'ගණකය' },
    kind: { en: 'Default · works as a real calculator', si: 'පෙරනිමි · සැබෑ ගණකයක් ලෙස ක්‍රියා කරයි' },
    color: '#2b333d',
    unlock: { en: 'Type your PIN, then press =', si: 'ඔබේ PIN අංකය ටයිප් කර = ඔබන්න' },
    favicon: svg('<rect width="64" height="64" rx="14" fill="#2b333d"/><rect x="12" y="10" width="40" height="14" rx="4" fill="#9fd3c7"/><g fill="#e8edf2"><circle cx="19" cy="33" r="4"/><circle cx="32" cy="33" r="4"/><circle cx="19" cy="45" r="4"/><circle cx="32" cy="45" r="4"/></g><rect x="41" y="29" width="8" height="20" rx="4" fill="#f2a541"/>'),
  },
  {
    id: 'money',
    name: { en: 'Kasi', si: 'කාසි' },
    kind: { en: 'Money diary · like a banking app', si: 'මුදල් දිනපොත · බැංකු යෙදුමක් වගේ' },
    color: '#0e5e4a',
    unlock: { en: 'Tap + Add, enter your PIN as the amount, then Save', si: '+ එකතු කරන්න ඔබා, මුදල ලෙස PIN එක ගසා සුරකින්න' },
    favicon: svg('<rect width="64" height="64" rx="14" fill="#0e5e4a"/><circle cx="32" cy="32" r="16" fill="none" stroke="#f6d36b" stroke-width="5"/><rect x="29" y="22" width="6" height="20" rx="3" fill="#f6d36b"/>'),
  },
  {
    id: 'study',
    name: { en: 'Padama', si: 'පාඩම' },
    kind: { en: 'Course app · like an LMS', si: 'පාඨමාලා යෙදුම · LMS එකක් වගේ' },
    color: '#3446a8',
    unlock: { en: 'Search for your PIN and press Enter', si: 'සෙවුම් කොටුවේ PIN එක ගසා Enter ඔබන්න' },
    favicon: svg('<rect width="64" height="64" rx="14" fill="#3446a8"/><path d="M14 24 32 15l18 9-18 9z" fill="#ffd27a"/><path d="M21 29v10c0 3 5 6 11 6s11-3 11-6V29l-11 5z" fill="#fff"/>'),
  },
  {
    id: 'social',
    name: { en: 'Katha', si: 'කතා' },
    kind: { en: 'Social feed · like a social app', si: 'සමාජ ජාලය · සමාජ මාධ්‍ය යෙදුමක් වගේ' },
    color: '#c2410c',
    unlock: { en: 'Write your PIN as a post and tap Post', si: 'PIN එක පෝස්ට් එකක් ලෙස ලියා පළ කරන්න' },
    favicon: svg('<rect width="64" height="64" rx="14" fill="#c2410c"/><path d="M16 20h32a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H30l-9 8v-8h-5a4 4 0 0 1-4-4V24a4 4 0 0 1 4-4z" fill="#fff"/>'),
  },
];

export const coverById = (id: DisguiseId) => COVERS.find((c) => c.id === id)!;
