/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          green: 'var(--color-green)',
          'green-dark': 'var(--color-green-dark)',
          blue: 'var(--color-blue)',
          'blue-dark': 'var(--color-blue-dark)',
          gold: 'var(--color-gold)',
          'gold-dark': 'var(--color-gold-dark)',
          orange: 'var(--color-orange)',
          'orange-dark': 'var(--color-orange-dark)',
          red: 'var(--color-red)',
          'red-dark': 'var(--color-red-dark)',
          purple: 'var(--color-purple)',
          'purple-dark': 'var(--color-purple-dark)',
          gray: 'var(--color-gray)',
          'gray-dark': 'var(--color-gray-dark)',
        }
      },
      fontFamily: {
        main: ["var(--font-main)"],
        mono: ["var(--font-mono)"],
      }
    },
  },
  plugins: [],
}
