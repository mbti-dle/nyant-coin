module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  parser: '@typescript-eslint/parser',
  parserOptions: {
  ecmaFeatures: {
    jsx: true,
  },
  ecmaVersion: 'latest',
  sourceType: 'module',
  project: './tsconfig.json',
  tsconfigRootDir: __dirname,
},
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier',
    'plugin:@next/next/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'next',
    'next/core-web-vitals',
    'eslint-config-prettier',
  ],
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'jsx-a11y', 'import', 'prettier', 'import-order', 'filenames'],
  rules: {
    // 파일명 규칙 (eslint-plugin-filenames 설치 필요)
    'filenames/match-regex': ['error', '^[a-z-]+\.[a-z]+$'],

    // 컴포넌트 이름 규칙
    'react/jsx-pascal-case': 'error',

    // 함수명 규칙
    'camelcase': ['error', { properties: 'never' }],

    // 이벤트 핸들러 네이밍 규칙
    'react/jsx-handler-names': ['error', {
      eventHandlerPrefix: 'handle',
      eventHandlerPropPrefix: 'on'
    }],

    // 변수명 규칙 (Boolean, useRef, interface, type)
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'variable',
        types: ['boolean'],
        format: ['camelCase'],
        prefix: ['is', 'has', 'should']
      },
      {
        selector: 'variable',
        types: ['function'],
        format: ['camelCase'],
        suffix: ['Ref'],
        filter: {
          regex: 'Ref$',
          match: true
        }
      },
      {
        selector: 'interface',
        format: ['PascalCase'],
        custom: {
          regex: '(Props|Model)$',
          match: true
        }
      },
      {
        selector: 'typeAlias',
        format: ['PascalCase'],
        suffix: ['Type']
      }
    ],

    // props 구조 분해 할당 규칙
    'react/destructuring-assignment': ['error', 'always'],

    // 컴포넌트 내부 요소 순서
    'react/sort-comp': ['error', {
      order: [
        'static-methods',
        'instance-variables',
        'lifecycle',
        '/^handle.+$/',
        '/^on.+$/',
        'everything-else',
        'rendering',
      ],
      groups: {
        lifecycle: [
          'displayName',
          'propTypes',
          'contextTypes',
          'childContextTypes',
          'mixins',
          'statics',
          'defaultProps',
          'constructor',
          'getDefaultProps',
          'state',
          'getInitialState',
          'getChildContext',
          'getDerivedStateFromProps',
          'componentWillMount',
          'UNSAFE_componentWillMount',
          'componentDidMount',
          'componentWillReceiveProps',
          'UNSAFE_componentWillReceiveProps',
          'shouldComponentUpdate',
          'componentWillUpdate',
          'UNSAFE_componentWillUpdate',
          'getSnapshotBeforeUpdate',
          'componentDidUpdate',
          'componentDidCatch',
          'componentWillUnmount'
        ],
        rendering: [
          '/^render.+$/',
          'render'
        ]
      }
    }],

    // import 순서 규칙
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
        pathGroups: [
          {
            pattern: 'react',
            group: 'external',
            position: 'before',
          },
        ],
        pathGroupsExcludedImportTypes: ['react'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],

    // TypeScript 관련 규칙
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',

    // 컴포넌트 정의 방식
    'react/function-component-definition': [
      2,
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function',
      },
    ],

    // JSX 관련 규칙
    'react/jsx-key': ['error', { checkFragmentShorthand: true }],
    'react/jsx-no-duplicate-props': ['error', { ignoreCase: true }],

    // 기타 규칙
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'react/prop-types': 'warn',
    'react/react-in-jsx-scope': 'off',
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    'import/no-default-export': 'off',
    'import/prefer-default-export': 'off',
    'import/no-unresolved': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'eqeqeq': 'error',
    'prefer-destructuring': [
      'error',
      {
        array: false,
        object: true,
      },
    ],
    'no-useless-rename': 'error',
    'object-shorthand': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        paths: ['src', '.'],
      },
    },
  },
  ignorePatterns: ['dist', '.eslintrc.cjs'],
};