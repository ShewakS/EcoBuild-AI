/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        // Blueprint design system tokens
        ink:        '#16213E', // near-black navy — primary text
        blueprint:  '#2B5CB0', // blueprint blue — brand/interactive
        paper:      '#FAFBFC', // near-white background
        concrete:   '#E7E9EC', // neutral surface/border
        eco:        '#3E8E5E', // sustainability signal
        alert:      '#C4622D', // warnings / destructive only

        // Blueprint shades
        'blueprint-50':  '#EEF3FB',
        'blueprint-100': '#D5E0F5',
        'blueprint-200': '#AABFEA',
        'blueprint-300': '#7F9EDE',
        'blueprint-400': '#547DD3',
        'blueprint-500': '#2B5CB0', // same as blueprint
        'blueprint-600': '#224A8D',
        'blueprint-700': '#1A386A',
        'blueprint-800': '#112548',
        'blueprint-900': '#0A1325',

        // Ink shades
        'ink-50':  '#F0F2F6',
        'ink-100': '#D0D5E4',
        'ink-200': '#A1ABCA',
        'ink-300': '#7282AF',
        'ink-400': '#435895',
        'ink-500': '#16213E', // same as ink
        'ink-600': '#111A32',
        'ink-700': '#0C1325',
        'ink-800': '#080D19',
        'ink-900': '#04060D',

        // Eco shades
        'eco-50':  '#EBF5EF',
        'eco-100': '#C8E5D3',
        'eco-200': '#91CCAA',
        'eco-300': '#5AB281',
        'eco-400': '#3E8E5E', // same as eco
        'eco-500': '#2E6B47',
        'eco-600': '#1F4830',
        'eco-700': '#10251A',
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        'sm': '2px',
        DEFAULT: '3px',
        'md': '4px',
        'lg': '6px',
      },
      boxShadow: {
        'none': 'none',
        'card': '0 0 0 1px var(--concrete)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      maxWidth: {
        'screen-xl': '1200px',
        'screen-lg': '1024px',
        'screen-md': '768px',
      },
      animation: {
        'draw': 'draw 2s ease-in-out forwards',
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        draw: {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
