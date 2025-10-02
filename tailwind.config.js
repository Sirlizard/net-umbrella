/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'cream': '#e8e6d8',
        'pink': '#ffacd6',
        'red': '#892f1a',
        'blue': '#28428c',
        'brown': '#624a41',
      },
    },
  },
  plugins: [],
};
