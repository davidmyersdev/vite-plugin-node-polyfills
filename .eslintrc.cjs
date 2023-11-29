module.exports = {
  extends: [
    'artisan',
  ],
  overrides: [
    {
      files: [
        './.github/**/*.yml',
      ],
      rules: {
        'yml/no-empty-mapping-value': 'off',
      },
    },
  ],
}
