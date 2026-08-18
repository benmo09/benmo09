/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F5A623',
        secondary: '#FFD700',
        accent: '#E74C3C',
        background: '#FFF8EC',
        dark: '#1C1206',
      },
      fontFamily: {
        'hebrew': ['Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
