/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: v('ink'),
        muted: v('muted'),
        line: v('line'),
        mist: v('mist'),
        surface: v('surface'),
        navy: { DEFAULT: v('navy'), 700: v('navy-700'), 50: v('navy-50') },
        teal: { DEFAULT: v('teal'), deep: v('teal-deep'), 50: v('teal-50') },
        sos: { DEFAULT: v('sos'), 50: v('sos-50') },
        ok: { DEFAULT: v('ok'), 50: v('ok-50') },
        warn: { DEFAULT: v('warn'), 50: v('warn-50') },
      },
      fontFamily: {
        sans: ['"Atkinson Hyperlegible Next Variable"', '"Noto Sans Sinhala Variable"', 'system-ui', 'sans-serif'],
        si: ['"Noto Sans Sinhala Variable"', '"Atkinson Hyperlegible Next Variable"', 'sans-serif'],
      },
      borderRadius: { sheet: '24px', card: '16px', btn: '12px' },
      boxShadow: {
        lift: '0 1px 2px rgb(15 34 54 / 0.06), 0 8px 24px -12px rgb(15 34 54 / 0.18)',
        phone: '0 0 0 10px #0d1b2a, 0 0 0 11px #2a3b4f, 0 40px 80px -20px rgb(15 34 54 / 0.45)',
      },
      keyframes: {
        'slide-in': { from: { opacity: 0, transform: 'translateX(16px)' }, to: { opacity: 1, transform: 'none' } },
        'rise': { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'none' } },
        'sheet': { from: { transform: 'translateY(100%)' }, to: { transform: 'none' } },
        'fade': { from: { opacity: 0 }, to: { opacity: 1 } },
        'pulse-ring': { '0%': { boxShadow: '0 0 0 0 rgb(var(--navy) / .35)' }, '100%': { boxShadow: '0 0 0 10px rgb(var(--navy) / 0)' } },
        'shake': { '0%,100%': { transform: 'none' }, '25%': { transform: 'translateX(-6px)' }, '75%': { transform: 'translateX(6px)' } },
      },
      animation: {
        'slide-in': 'slide-in .28s cubic-bezier(.2,.7,.2,1) both',
        'rise': 'rise .35s cubic-bezier(.2,.7,.2,1) both',
        'sheet': 'sheet .32s cubic-bezier(.2,.7,.2,1) both',
        'fade': 'fade .25s ease both',
        'pulse-ring': 'pulse-ring 1.6s ease-out infinite',
        'shake': 'shake .3s ease 2',
      },
    },
  },
  plugins: [],
};
