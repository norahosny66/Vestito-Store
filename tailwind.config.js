/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        plum: {
          50: '#faf7f9',
          100: '#f4eef2',
          200: '#e9dde6',
          300: '#d9c2d3',
          400: '#c49bb8',
          500: '#a8749a',
          600: '#8d5a7e',
          700: '#744866',
          800: '#5e2e53',
          900: '#4a2442',
        },
        rosegold: {
          50: '#fdf9f8',
          100: '#fbf2f0',
          200: '#f6e4e0',
          300: '#efd0c8',
          400: '#e8b4bc',
          500: '#d89aa4',
          600: '#c67d8a',
          700: '#b06371',
          800: '#925159',
          900: '#784349',
        }
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-soft': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'weave': 'weave 2s ease-in-out infinite',
        'confetti': 'confetti 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'rotate-3d': 'rotate3d 0.6s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        weave: {
          '0%': { transform: 'translateX(-100%) rotate(0deg)' },
          '50%': { transform: 'translateX(50%) rotate(180deg)' },
          '100%': { transform: 'translateX(100%) rotate(360deg)' },
        },
        confetti: {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(360deg)', opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        rotate3d: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(360deg)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      }
    },
  },
  plugins: [],
};