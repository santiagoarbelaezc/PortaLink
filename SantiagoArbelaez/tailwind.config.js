/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#000000',
          900: '#0D0D0D',
          800: '#141414',
        },
        accent: {
          cyan: '#8B5E3C',
          gold: '#FFD700',
        }
      },
      fontFamily: {
        headline: ['"Roboto"', 'sans-serif'],
        editorial: ['"Roboto"', 'sans-serif'],
        sans: ['"Roboto"', 'sans-serif'],
      },
      animation: {
        'draw-svg': 'draw 2s ease-out forwards',
        'fade-up': 'fadeUp 0.8s ease-out both',
        'marquee': 'marquee 25s linear infinite',
      },
      keyframes: {
        draw: {
          '0%': { 'stroke-dashoffset': '100%' },
          '100%': { 'stroke-dashoffset': '0%' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
}
