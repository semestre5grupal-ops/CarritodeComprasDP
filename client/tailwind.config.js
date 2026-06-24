/** @type {import('tailwindcss').Config} */
export default {
  // Analiza todos los archivos Vue, JS y HTML para generar solo el CSS necesario
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Colores personalizados de Shop Sport
      colors: {
        brand: {
          50:  '#e8f4f8',
          100: '#c5e3ef',
          200: '#9ecfe4',
          300: '#70bad9',
          400: '#4dacce',
          500: '#2e9ec3',
          600: '#1d88ab',
          700: '#0c6d8a',
          800: '#0c4d63',
          900: '#083040',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
