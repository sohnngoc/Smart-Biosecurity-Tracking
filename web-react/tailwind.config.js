/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0d9488', // teal-600
        secondary: '#0f766e', // teal-700
      }
    },
  },
  plugins: [],
}
