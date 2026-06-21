/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
    extend: {
      colors: {
        olive: {
          50: '#F5F7F2',
          100: '#E7ECE0',
          200: '#CFD9C1',
          300: '#AEC097',
          400: '#88A06C',
          500: '#6B8550',
          600: '#5A7247',
          700: '#495A3A',
          800: '#3C4A30',
          900: '#333E2A',
        },
        terracotta: {
          50: '#FDF5F2',
          100: '#FBE8E0',
          200: '#F6D1C1',
          300: '#EFB298',
          400: '#E68B69',
          500: '#D97757',
          600: '#C66041',
          700: '#A54D33',
          800: '#87412D',
          900: '#6F3829',
        },
        cream: {
          50: '#FDFBF8',
          100: '#FAF7F2',
          200: '#F3EDE1',
          300: '#E9DFC9',
          400: '#DCCA9F',
          500: '#CBB378',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Source Han Serif SC"', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', '"Source Han Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 12px rgba(90, 114, 71, 0.08)',
        'card': '0 4px 24px rgba(90, 114, 71, 0.10)',
        'card-hover': '0 12px 36px rgba(90, 114, 71, 0.15)',
      },
      borderRadius: {
        'xl-2': '14px',
      },
      animation: {
        'breath': 'breath 3s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'slide-in': 'slideIn 0.3s ease-out forwards',
        'flip-in': 'flipIn 0.4s ease-out forwards',
        'pulse-ring': 'pulseRing 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
      },
      keyframes: {
        breath: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.01)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        flipIn: {
          '0%': { opacity: '0', transform: 'rotateX(-90deg)' },
          '100%': { opacity: '1', transform: 'rotateX(0)' },
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(217, 119, 87, 0.5)' },
          '70%': { boxShadow: '0 0 0 16px rgba(217, 119, 87, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(217, 119, 87, 0)' },
        },
      },
    },
  },
  plugins: [],
};
