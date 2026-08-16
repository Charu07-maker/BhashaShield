/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0a0c10',
        panel: '#14171c',
        raised: '#1b1f26',
        border: '#262b33',
        ink: {
          primary: '#e8ecf1',
          secondary: '#9aa4b2',
          disabled: '#5b6270',
        },
        accent: {
          DEFAULT: '#ff6b4a',
          hover: '#e5502c',
          pressed: '#c93f20',
        },
        safe: {
          DEFAULT: '#22c55e',
          wash: 'rgba(34,197,94,0.12)',
        },
        warning: {
          DEFAULT: '#eab308',
          wash: 'rgba(234,179,8,0.12)',
        },
        danger: {
          DEFAULT: '#ef4444',
          wash: 'rgba(239,68,68,0.14)',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        base: ['15px', '1.6'],
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        panel: '0 0 0 1px #262b33',
        'glow-accent': '0 0 0 1px rgba(255,107,74,0.4), 0 0 24px rgba(255,107,74,0.15)',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(400%)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-scale': {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'progress-indeterminate': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(350%)' },
        },
      },
      animation: {
        scan: 'scan 1.8s ease-in-out infinite',
        'fade-in': 'fade-in 0.35s ease-out',
        'fade-in-scale': 'fade-in-scale 0.3s ease-out',
        shimmer: 'shimmer 2.2s linear infinite',
        'progress-indeterminate': 'progress-indeterminate 1.1s ease-in-out infinite',
      },
      transitionTimingFunction: {
        emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
      },
    },
  },
  plugins: [],
}
