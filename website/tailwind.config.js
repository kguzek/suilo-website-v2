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
        primaryDark: "#eb9c00",
        secondary: "#FFC300",
        text1: "#111111",
        text2: "#2E2E2E",
        text3: "#969696",
        text4: "#5B5B5B",
        text5: "#222222",
        text6: "#444444",
        text7: "#6e6e6e",
        footer: "#434343",
        aspect: "#ffe6b5",
      },
      fontFamily: {
        sans: [
          '"Poppins"'
        ]
      },
      borderRadius: {
        '2lg': '0.65rem',
        '3lg': '0.85rem',
        '4xl': '2rem',
      },
      fontSize: {
        '10xl': ['3.25rem', { lineHeight: '1.25' }],
      },
      dropShadow: {
        '3xl': '0 7px 15px rgba(141, 113, 0, .07)',
        '4xl': '0 7px 30px rgba(141, 113, 0, .16)',
        '5xl': '0 5px 10px rgba(141, 113, 0, .05)',
        '6xl': '0 4px 8px rgba(80, 60, 0, .04)',
      },
      aspectRatio: {
        'LN': '9.35 / 10.5',
      },
      translate: ({ theme }) => ({
        ...theme('spacing'),
        '2/5': '40%',
      }),
      animation: {
        'slow-ping': 'ping 1500ms cubic-bezier(0, 0, 0.2, 1) forwards;',
      }
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
    // ...
  ],
}
