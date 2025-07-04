module.exports = {
  'src/**/*.{ts,tsx}': ['eslint --cache --fix --no-error-on-unmatched-pattern'],
  'src/**/*.{js,jsx}': ['eslint --cache --fix --no-error-on-unmatched-pattern'],
  'src/**/*.{less,css}': ['stylelint --fix'],
};
