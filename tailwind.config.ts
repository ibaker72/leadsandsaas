import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Satoshi', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#f59e0b',
          hover: '#d97706',
          soft: 'rgba(245, 158, 11, 0.12)',
        },
        surface: {
          DEFAULT: '#f8f9fb',
          secondary: '#f0f2f5',
        },
        sidebar: {
          bg: '#0b0e14',
          hover: '#161b28',
          active: '#1c2235',
          border: '#1e2538',
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
