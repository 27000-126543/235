/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0066cc',
        success: '#00cc66',
        warning: '#ff9900',
        danger: '#ff3366',
        info: '#0099ff',
        dark: '#0a1628',
        panel: 'rgba(10, 22, 40, 0.9)'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #0099ff, 0 0 10px #0099ff' },
          '100%': { boxShadow: '0 0 20px #0099ff, 0 0 30px #0099ff' },
        }
      }
    },
  },
  plugins: [],
}
