/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'system-ui',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          '"Fira Sans"',
          'Ubuntu',
          'Oxygen',
          '"Oxygen Sans"',
          'Cantarell',
          '"Droid Sans"',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Lucida Grande"',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        primary: '#3B82F6', // blue-500
        secondary: '#10B981', // emerald-500
      },
    },
  },
  plugins: [],
}

