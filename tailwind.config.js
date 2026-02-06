/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontSize: {
        pageTitle: ['1.75rem', { lineHeight: '2rem', fontWeight: '700' }],
        sectionTitle: ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }]
      }
    }
  },
  plugins: []
};
