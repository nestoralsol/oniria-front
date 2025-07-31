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
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
