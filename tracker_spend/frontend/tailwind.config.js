/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'spin-medium': 'spin 15s linear infinite reverse',
        'spin-fast': 'spin 10s linear infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'float-medium': 'float 4s ease-in-out infinite reverse',
        'float-fast': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '25%': { transform: 'translateY(-20px) translateX(10px)' },
          '50%': { transform: 'translateY(-10px) translateX(-10px)' },
          '75%': { transform: 'translateY(-30px) translateX(5px)' },
        },
      },
      colors: {
        'brand-dark': '#2D373A',
        'brand-light': '#E8ECF4',
        'brand-blue': '#4285F4',
        'brand-orange': '#C89B7B',
        'brand-green': '#48BB78',
      },
    },
  },
  plugins: [],
}
