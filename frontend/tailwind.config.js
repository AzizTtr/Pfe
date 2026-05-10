/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'Inter', 'system-ui', 'sans-serif'],
        ar:   ['Cairo', 'sans-serif'],
        en:   ['Inter', 'sans-serif']
      },
      colors: {
        forest: {
          50:  '#ecfdf5', 100: '#d1fae5', 300: '#6ee7b7',
          500: '#10b981', 600: '#059669', 700: '#047857',
          800: '#065f46', 900: '#064e3b', 950: '#022c22'
        },
        royal: {
          500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
          800: '#1e40af', 900: '#1e3a8a', 950: '#172554'
        }
      },
      keyframes: {
        'pulse-soft': { '0%,100%':{opacity:'1'}, '50%':{opacity:'.7'} },
        float:        { '0%,100%':{transform:'translateY(0)'}, '50%':{transform:'translateY(-8px)'} }
      },
      animation: {
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
        float:        'float 4s ease-in-out infinite'
      }
    }
  },
  plugins: [require('tailwindcss-rtl')]
};
