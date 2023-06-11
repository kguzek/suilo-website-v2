module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
  },
  extends: [
    "eslint:recommended",
    // "google",
  ],
  rules: {
    quotes: ["error", "double", { avoidEscape: true }],
    "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
  },
};
