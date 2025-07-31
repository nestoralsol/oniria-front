/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        darkMist: '#0f0f1a',
        arcanePurple: '#6b21a8',
        etherBlue: '#2563eb',
        fadedGold: '#bfa76f',
        moonGray: '#e0e0e0',
      },
      fontFamily: {
        serif: ['Cinzel', 'serif'],
        sans: ['Quicksand', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
