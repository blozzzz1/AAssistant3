/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8b5cf6', // Purple
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        background: {
          DEFAULT: '#0a0a0f', // Dark background
          dark: '#06060a', // Even darker
          darker: '#030305', // Darkest
          card: '#16161f', // Card background (dark)
          hover: '#1f1f2a', // Hover state for cards (dark)
          // Light theme colors will be handled via CSS variables
        },
        accent: {
          blue: '#3b82f6',
          pink: '#ec4899',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to right, #8b5cf6, #ec4899)',
        'gradient-secondary': 'linear-gradient(to right, #ec4899, #8b5cf6)',
      },
    },
  },
  plugins: [],
};
