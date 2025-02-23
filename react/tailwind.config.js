/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        screens: {
          'xs': '475px',
          'sm': '640px',
          'md': '768px',
          'lg': '1024px',
          'xl': '1280px',
        },
        lineClamp: {
          2: '2',
        },
        spacing: {
          '88': '22rem',
          '128': '32rem',
        },
        transitionProperty: {
          'height': 'height',
          'spacing': 'margin, padding',
        },
      },
    },
    plugins: [],
  };