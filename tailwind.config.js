/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        mustard: '#d9a441',
        paper: {
          DEFAULT: '#f1ead8',
          warm: '#ece3cd',
          deep: '#e0d3b3',
          edge: '#c8b998',
        },
        ink: {
          DEFAULT: '#1a1613',
          soft: '#3a3228',
          muted: '#6a5f52',
          faint: '#9b8e7d',
        },
        riso: {
          burgundy: '#8a2a2a',
          oxblood: '#b7312b',
          forest: '#2e4a3e',
          mustard: '#d9a441',
          navy: '#24406b',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', '"Noto Serif SC"', 'serif'],
        serif: ['"Noto Serif SC"', '"Fraunces"', 'serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'ui-monospace', 'monospace'],
        italic: ['"Instrument Serif"', '"Fraunces"', 'serif'],
      },
      boxShadow: {
        'ink-sharp': '4px 4px 0 #1a1613',
        'ink-sharp-lg': '8px 8px 0 #1a1613',
        'stamp': '0 2px 0 rgba(26,22,19,0.08), 0 0 0 1px rgba(26,22,19,0.15)',
      },
      letterSpacing: {
        masthead: '0.42em',
      },
    },
  },
  plugins: [],
};
