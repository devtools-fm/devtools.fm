module.exports = {
  mode: "jit",
  darkMode: "media",
  purge: ["./pages/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  variants: {
    extend: {
      divideColor: ['dark']
    }
  },
  plugins: [],
};
