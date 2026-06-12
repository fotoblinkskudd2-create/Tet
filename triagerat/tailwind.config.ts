import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        p0: '#dc2626',
        p1: '#ea580c',
        p2: '#2563eb',
        p3: '#6b7280',
      },
    },
  },
  plugins: [],
};

export default config;
