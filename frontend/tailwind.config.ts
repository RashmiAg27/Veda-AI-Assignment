import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#D32F2F',
          'red-light': '#FFF5F5',
          'red-hover': '#B71C1C',
        },
        sidebar: '#FFFFFF',
        page: '#F5F5F5',
        card: '#FFFFFF',
        border: '#E0E0E0',
        'text-primary': '#1A1A1A',
        'text-secondary': '#757575',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
