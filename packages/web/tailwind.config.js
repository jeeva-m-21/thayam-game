/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'floor-oxide': 'var(--floor-oxide)',
        'floor-oxide-dark': 'var(--floor-oxide-dark)',
        'kolam-chalk': 'var(--kolam-chalk)',
        'brass': 'var(--brass)',
        'brass-bright': 'var(--brass-bright)',
        'pawn-red': 'var(--pawn-red)',
        'pawn-green': 'var(--pawn-green)',
        'pawn-yellow': 'var(--pawn-yellow)',
        'pawn-blue': 'var(--pawn-blue)',
        'stone-ink': 'var(--stone-ink)',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Catamaran', 'sans-serif'],
      },
      keyframes: {
        'pawn-hop': {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-6px) scale(1.15)' },
        },
        'turn-halo': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(217, 162, 42, 0.4)' },
          '50%': { boxShadow: '0 0 10px 4px rgba(217, 162, 42, 0.8)' },
        },
        'cut-flash': {
          '0%': { transform: 'scale(0.4)', opacity: '1' },
          '50%': { transform: 'scale(1.5)', opacity: '0.8' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
      },
      animation: {
        'pawn-hop': 'pawn-hop 1s ease-in-out infinite',
        'turn-halo': 'turn-halo 1.5s ease-in-out infinite',
        'cut-flash': 'cut-flash 0.6s ease-out forwards',
      },
    },
  },
  plugins: [],
}
