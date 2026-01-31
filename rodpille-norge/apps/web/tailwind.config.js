/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brutalist dark theme - blood red accents
        'rod': {
          50: '#fff0f0',
          100: '#ffdddd',
          200: '#ffc0c0',
          300: '#ff9494',
          400: '#ff5757',
          500: '#ff2323', // Primary red
          600: '#ed0000',
          700: '#c80000',
          800: '#a50505',
          900: '#880c0c',
          950: '#4b0000', // Darkest blood red
        },
        'pille': {
          // Dark backgrounds
          'bg': '#0a0a0a',
          'card': '#111111',
          'elevated': '#1a1a1a',
          'border': '#2a2a2a',
          'muted': '#666666',
        },
      },
      fontFamily: {
        'brutal': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-red': 'pulse-red 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flame': 'flame 0.5s ease-in-out infinite alternate',
        'slide-up': 'slide-up 0.3s ease-out',
      },
      keyframes: {
        'pulse-red': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'flame': {
          '0%': { transform: 'scale(1) rotate(-2deg)' },
          '100%': { transform: 'scale(1.1) rotate(2deg)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px rgba(255,35,35,0.5)',
        'brutal-lg': '8px 8px 0px 0px rgba(255,35,35,0.3)',
      },
    },
  },
  plugins: [],
}
