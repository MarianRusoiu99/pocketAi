module.exports = {
  'client/src/**/*.{ts,tsx}': ['cd client && npx eslint --cache --fix --no-error-on-unmatched-pattern'],
  'client/src/**/*.{js,jsx}': ['cd client && npx eslint --cache --fix --no-error-on-unmatched-pattern'],
  'client/src/**/*.{less,css}': ['cd client && npx stylelint --fix'],
};
