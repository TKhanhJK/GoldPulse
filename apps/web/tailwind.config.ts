import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'ui-monospace', 'monospace'],
      },
      colors: {
        background: '#F8FAFC',
        card: '#FFFFFF',
        cardBorder: '#E2E8F0',
        gold: {
          50: '#FFFDF5',
          100: '#FEF9C3',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
        slate: {
          850: '#151E2E',
          900: '#0F172A',
          950: '#0B0F19',
        },
        trend: {
          up: '#10B981',
          down: '#EF4444',
          stable: '#94A3B8',
        }
      },
    },
  },
  plugins: [],
};

export default config;
