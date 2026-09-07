/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#FF5A00',
          'orange-dark': '#E64A00',
          'orange-light': '#FFF1E8',
          teal: '#087F7A',
          'teal-dark': '#05635F',
          'teal-light': '#E6F7F5',
        },
      },
      borderRadius: {
        card: '16px',
        button: '12px',
        input: '12px',
      },
    },
  },
  plugins: [],
}
