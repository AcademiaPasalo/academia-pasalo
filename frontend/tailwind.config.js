/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        main: "#082784",
        primary: {
          1: "#60418F",
          2: "#882A9B",
          3: "#12232E",
        },
      },
    },
  },
  plugins: [],
};
