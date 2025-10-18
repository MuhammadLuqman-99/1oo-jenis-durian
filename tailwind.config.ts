import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef9e7',
          100: '#fdf2c7',
          200: '#fbe492',
          300: '#f9d053',
          400: '#f7bb1f',
          500: '#e7a00f',
          600: '#c77b0a',
          700: '#9f560b',
          800: '#834410',
          900: '#6f3713',
        },
        tropical: {
          green: '#2d5016',
          lime: '#84cc16',
          brown: '#78350f',
        }
      },
      backgroundImage: {
        'durian-pattern': "url('/patterns/durian-bg.svg')",
        'gradient-tropical': 'linear-gradient(135deg, #2d5016 0%, #84cc16 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
