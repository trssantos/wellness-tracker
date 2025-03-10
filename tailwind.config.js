/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    darkMode: 'class', // Enable class-based dark mode
    theme: {
      screens: {
        'xs': '390px',      // Small phones
        'sm': '640px',      // Keep the default
        'md': '768px',      // Keep the default
        'lg': '1024px',     // Keep the default
        'xl': '1280px',     // Keep the default
        '2xl': '1536px',    // Keep the default
      },
      extend: {},
    },
    plugins: [],
  }