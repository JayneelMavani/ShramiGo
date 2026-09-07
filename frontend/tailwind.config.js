/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
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
        // ShramiGo Dark Mode Token Collection
        dark: {
          canvas:       '#101A18',
          surface:      '#1C2825',
          elevated:     '#3D3931',
          input:        '#26332F',
          'text-primary':   '#F7F2E8',
          'text-secondary': '#C8C0B4',
          'text-muted':     '#9A9185',
          'text-disabled':  '#6F6A61',
          'teal':           '#73C4B5',
          'teal-hover':     '#8BD3C5',
          'teal-pressed':   '#5FB5A6',
          'on-primary':     '#10201D',
          'action':         '#1B4B43',
          'border':         '#3D4944',
          'border-subtle':  '#2C3834',
          'border-strong':  '#59645E',
          'border-focus':   '#E4A52B',
          'success':        '#3DB47A',
          'success-bg':     '#163D32',
          'warning':        '#E4A52B',
          'warning-bg':     '#4A3510',
          'error':          '#E05A4F',
          'error-bg':       '#4A211E',
          'info':           '#73C4B5',
          'info-bg':        '#1B4B43',
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
