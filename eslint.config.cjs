const js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      'assets/',
      '.vscode/',
      '.eslintrc.*',
      '.eslintignore'
    ],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        localStorage: 'readonly',
        setTimeout: 'readonly',
        clearInterval: 'readonly',
        console: 'readonly',
        process: 'readonly',
        require: 'readonly',
        module: 'readonly',
      }
    },
    rules: {
      // Add custom rules here if needed
    },
  }
];
