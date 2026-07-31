/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sset: {
          bg: '#061619',
          card: '#0d2729',
          deep: '#020607',
          gold: '#ccb154',
          goldLight: '#e5cd77',
          goldDark: '#8a722e',
          text: '#f5f4ef',
          muted: '#9ba3a7',
          subtle: '#cfd4d6',
          border: 'rgba(204, 169, 84, 0.35)',
        }
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        playfair: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
