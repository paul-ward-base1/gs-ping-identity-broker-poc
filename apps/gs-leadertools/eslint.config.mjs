import tseslint from 'typescript-eslint';
import nextConfig from 'eslint-config-next/core-web-vitals';
import storybook from 'eslint-plugin-storybook';
import eslintComments from '@eslint-community/eslint-plugin-eslint-comments';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  // Ignored paths
  {
    ignores: ['.storybook/*', 'dist/*', 'build/*', 'node_modules/*', '.next/*'],
  },

  // Next.js rules (includes react, react-hooks, jsx-a11y, @next/next, @typescript-eslint/recommended, import)
  ...nextConfig,

  // TypeScript-specific quality rules (scoped to .ts/.tsx to match the @typescript-eslint plugin registration)
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // Ban any double-cast pattern (e.g. `expr as A as B`, `expr as unknown as X`).
      // These almost always paper over a real type mismatch — fix the producing function's
      // return type or the consumer's input type instead. If the underlying API genuinely
      // needs reshaping, validate at runtime (e.g. with zod) and return a properly typed
      // value, or use `// @ts-expect-error` when intentionally testing invalid input.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSAsExpression > TSAsExpression',
          message:
            'Avoid double-cast (`expr as A as B`). Fix the underlying type instead, validate at runtime, or use `@ts-expect-error` for intentional test cases.',
        },
      ],
    },
  },

  // General quality rules (all files)
  {
    plugins: { 'eslint-comments': eslintComments },
    rules: {
      // Disable comments — must name the rule being suppressed; unused suppression is an error.
      // Core quality rules cannot be disabled inline — fix the code instead.
      'eslint-comments/no-unlimited-disable': 'error',
      'eslint-comments/no-unused-disable': 'error',
      'eslint-comments/no-restricted-disable': ['error', '@typescript-eslint/no-explicit-any', 'no-restricted-syntax'],

      // General
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
      'no-debugger': 'error',
    },
  },

  // Storybook rules (stories files only)
  {
    files: ['**/*.stories.@(ts|tsx|js|jsx|mjs|cjs)', '**/*.story.@(ts|tsx|js|jsx|mjs|cjs)'],
    plugins: { storybook },
    rules: {
      ...storybook.configs.recommended.rules,
    },
  },

  // Prettier (must be last — disables conflicting formatting rules)
  prettier
);
