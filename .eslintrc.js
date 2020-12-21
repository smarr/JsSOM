module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    process: 'readonly',
    global: 'readonly',
    BigInt: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'max-classes-per-file': 'off',
    'import/prefer-default-export': 'off',
    'import/extensions': 'off',
    'no-restricted-syntax': 'off',
    'no-underscore-dangle': 'off',
    'no-bitwise': 'off',
    'no-param-reassign': 'off',
    'class-methods-use-this': 'off',
    'prefer-destructuring': 'off',
    'no-continue': 'off',
    'no-unused-vars': ['error', { varsIgnorePattern: /$_/ }],
  },
};
