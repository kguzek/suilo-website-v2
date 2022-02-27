module.exports = {
  mode: "jit",
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        bg: "#F8F8F8",
        primary: "#FF9900",
        secondary: "#FFC300",
        text1: "#111111",
        text2: "#2E2E2E",
        text3: "#969696",
        footer: "#434343"
      },
      fontFamily: {
        sans: [
          '"Poppins"'
        ]
      },
      borderRadius: {
        '2lg': '0.65rem',
        '4xl': '2rem',
      },
    },
    plugins: [
      require('@tailwindcss/line-clamp'),
      // ...
    ],
  }
}
