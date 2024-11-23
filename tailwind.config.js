/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3A7C6A',
          dark: '#2A6B59',
        },
      },
      zIndex: {
        10: '10', // Ajout de cette ligne pour définir une valeur de z-index
        20: '20', // Ajoutez d'autres valeurs si nécessaire
      },
    },
  },
  plugins: [],
};
