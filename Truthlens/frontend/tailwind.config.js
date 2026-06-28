/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 900: '#0A0E1A', 800: '#0F1525', 700: '#141B2D', 600: '#1A2340' },
        card: '#1A1F2E',
        cyan: { 400: '#00D4FF', 500: '#00BBDE' },
        fake: '#FF4B6E',
        real: '#00C851',
        warn: '#FFB800',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      }
    }
  },
  plugins: []
}
