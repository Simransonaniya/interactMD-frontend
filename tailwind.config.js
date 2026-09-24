/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#102528',      // Primary Dark Green: Header, Nav, dark sections
          deep: '#14302F',      // Deep Teal: Hero bg, primary dark surfaces
          teal: '#39605B',      // Main Teal Green: Gradient transition, secondary sections, cards
          muted: '#426C62',     // Muted Green: Bottom gradient, supporting backgrounds
          offwhite: '#F7F4EE',  // Off White: Main text on dark backgrounds, light page backgrounds
          cream: '#F2D7B8',     // Cream / CTA: Primary CTA buttons, action elements, highlights
          'text-dark': '#1A2928', // Dark Text: Text on light backgrounds, form labels
        },
        primary: {
          DEFAULT: '#39605B',
          50: '#F7F4EE',
          100: '#E6ECE8',
          200: '#C7D7D0',
          300: '#9FBAB0',
          400: '#6E968B',
          500: '#426C62',
          600: '#39605B',
          700: '#2A4A45',
          800: '#14302F',
          900: '#102528',
        },
        cream: {
          DEFAULT: '#F2D7B8',
          light: '#F8E9D7',
          dark: '#E2BF99',
        },
        clinical: {
          bg: '#F7F4EE',
          card: '#FFFFFF',
          text: '#1A2928',
          muted: '#426C62',
          border: '#D8E2DC',
          darkSurface: '#14302F',
          darkHeader: '#102528',
          accent: '#F2D7B8',
        }
      },
      fontFamily: {
        serif: ['Newsreader', 'Lora', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'heartbeat': 'heartbeat 1.2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.15)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.15)' },
          '70%': { transform: 'scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
}
