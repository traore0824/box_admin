/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#BC8A1A',
          light: '#D6A83B',
          dark: '#9E7215',
          50: '#FDF8E9',
          100: '#F9ECC8',
          200: '#F3D88B',
          300: '#EAC14F',
          400: '#E0AC24',
          500: '#BC8A1A',
          600: '#9A7016',
          700: '#795812',
          800: '#58400D',
          900: '#372809',
        },
        secondary: {
          DEFAULT: '#2A3747',
          light: '#3C506A',
          dark: '#1E2835',
        },
        success: {
          DEFAULT: '#10B981',
          light: '#34D399',
          dark: '#059669',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
          dark: '#D97706',
        },
        danger: {
          DEFAULT: '#EF4444',
          light: '#F87171',
          dark: '#DC2626',
        },
        info: {
          DEFAULT: '#3B82F6',
          light: '#60A5FA',
          dark: '#2563EB',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        dropdown: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        card: '0.75rem',
      },
    },
  },
  plugins: [],
}