/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  colors: {
    "custom-blue": "rgba(11, 143, 172, 1)",
  },
  font: {
    'custom-font': 'roboto',
  },
  plugins: [],
};
