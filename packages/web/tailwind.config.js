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
      }
    },
  },
  plugins: [],
}
