module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true
  },
  extends: ['eslint:recommended', 'airbnb'],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    'comma-dangle': 'off',
    'no-console': 'off',
    'no-plusplus': 'off',
    'no-await-in-loop': 'off'
  }
};
