/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-dark': '#111827',
        'surface': '#1F2937',
        'border-subtle': '#374151',
        'accent': '#D97706',
        'accent-hover': '#F59E0B',
        'text-primary': '#F9FAFB',
        'text-secondary': '#9CA3AF',
      },
      fontFamily: {
        'heading': ['Barlow Condensed', 'sans-serif'],
        'body': ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
