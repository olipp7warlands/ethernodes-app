/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'en-green': '#39FF6B',
        'en-bg': '#0E0E0F',
        'en-card': '#1A1A1C',
        'en-card2': '#242426',
        'en-border': '#2A2A2D',
        'en-text': '#E8E8EA',
        'en-muted': '#7A7A82',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
