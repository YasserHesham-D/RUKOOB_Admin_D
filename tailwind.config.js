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
        rukoob: {
          forest: {
            DEFAULT: '#132A20',
            light: '#1B4D3E',
            hover: '#246552',
          },
          gold: {
            DEFAULT: '#C5A880',
            light: '#DFC7A8',
            dark: '#A6885E',
            accent: '#E8B923',
          },
          dark: '#0E1512',
          darker: '#080C0A',
          card: '#151F1B',
          'card-hover': '#1B2924',
        }
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'gold': '0 4px 20px -2px rgba(197, 168, 128, 0.15)',
        'forest': '0 4px 20px -2px rgba(19, 42, 32, 0.5)',
      }
    },
  },
  plugins: [],
}
