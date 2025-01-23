/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '2rem',
        sm: '5rem',
        lg: '8rem',
        xl: '10rem',
        '2xl': '12rem',
      },
    },
    extend: {},
  },
  plugins: [],
}
