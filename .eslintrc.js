module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    // Desactivar reglas estrictas para producción
    'no-unused-vars': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'jsx-a11y/anchor-is-valid': 'warn',
    'no-loop-func': 'warn',
    'eqeqeq': 'warn',
    'default-case': 'warn',
    'no-useless-escape': 'warn',
    'import/no-anonymous-default-export': 'warn'
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/*.test.jsx'],
      env: {
        jest: true
      }
    }
  ]
};