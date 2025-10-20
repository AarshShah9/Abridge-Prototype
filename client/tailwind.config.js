/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0077CC', // blue used for buttons and links
          hover: '#0066b3',
          light: '#e6f2ff',
        },
        secondary: {
          DEFAULT: '#414141', // dark gray used for text
        },
        accent: {
          DEFAULT: '#4CAF50', // green used for success indicators
        },
        background: {
          DEFAULT: '#ffffff',
          secondary: '#f8f9fa',
        },
        border: {
          DEFAULT: '#e2e8f0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
    },
  },
  plugins: [],
}
