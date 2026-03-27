/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Figtree', 'sans-serif'],
        serif: ['Fraunces', 'serif'],
      },
      colors: {
        ink: '#111110',
        teal: {
          50:  '#e6f5f3',
          100: '#b3e0db',
          400: '#2ab5a8',
          500: '#0a7c72',
          600: '#0d6b61',
          700: '#095e55',
          800: '#074f48',
          900: '#04302d',
        },
      },
    },
  },
  plugins: [],
};
