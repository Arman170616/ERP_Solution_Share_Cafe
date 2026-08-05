/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          50: '#f5f7fb',
          100: '#e9eef6',
          200: '#cdd9ea',
          300: '#a3b6d4',
          400: '#6f87b8',
          500: '#4a6498',
          600: '#364d7c',
          700: '#2a3c63',
          800: '#1f2c4a',
          900: '#16213a',
          950: '#0c1426',
        },
        // Share Cafe brand: maroon/burgundy (signage wall) as primary, gold (logo/wordmark) as accent.
        brand: {
          50: '#fbeef0',
          100: '#f4d4d9',
          200: '#e6a8b3',
          300: '#d17b8c',
          400: '#b84f68',
          500: '#96304a',
          600: '#7a2340',
          700: '#5e1a30',
          800: '#451322',
          900: '#300d18',
          950: '#1a070d',
        },
        accent: {
          50: '#fdf8e9',
          100: '#faedc0',
          200: '#f3da85',
          300: '#eac04c',
          400: '#dba828',
          500: '#c08f1e',
          600: '#9c7217',
          700: '#7a5813',
          800: '#5c4210',
          900: '#40300c',
          950: '#241a06',
        },
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(12, 20, 38, 0.18)',
        'glass-lg': '0 24px 60px -12px rgba(12, 20, 38, 0.28)',
        glow: '0 0 0 1px rgba(255,255,255,0.4), 0 8px 30px rgba(150, 48, 74, 0.28)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-18px) translateX(8px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0) translateX(0) scale(1)' },
          '50%': { transform: 'translateY(24px) translateX(-12px) scale(1.05)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '0.6' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
      },
      animation: {
        float: 'float 9s ease-in-out infinite',
        'float-slow': 'float-slow 14s ease-in-out infinite',
        shimmer: 'shimmer 3s linear infinite',
        'fade-up': 'fade-up 0.6s ease-out both',
        'scale-in': 'scale-in 0.5s ease-out both',
        'pulse-ring': 'pulse-ring 2.4s ease-out infinite',
      },
    },
  },
  plugins: [],
};
