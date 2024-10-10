module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "plugin:prettier/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "next",
    "next/core-web-vitals",
    "eslint-config-prettier",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: [
    "@typescript-eslint",
    "react",
    "prettier",
    "import",
    "import-order",
  ],
  rules: {
    'prettier/prettier': 'error',
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "react/function-component-definition": [
      2,
      {
        namedComponents: "arrow-function",
        unnamedComponents: "arrow-function",
      },
    ],
    "arrow-body-style": ["error", "as-needed"],
    "react/jsx-pascal-case": "error",
    camelcase: ["error", { properties: "never" }],
    "react/jsx-handler-names": [
      "error",
      {
        eventHandlerPropPrefix: "on",
      },
    ],
    "import/no-default-export": "off",
    "import/prefer-default-export": "off",
    "import/no-unresolved": "off",
    "react-hooks/rules-of-hooks": "error",
    "react/prop-types": "warn",
    "prefer-const": "error",
    "no-var": "error",
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    eqeqeq: "error",
    "prefer-destructuring": [
      "error",
      {
        array: false,
        object: true,
      },
    ],
    "import/order": [
      "error",
      {
        groups: ["builtin", "external", "internal", "index"],
        pathGroups: [
          {
            pattern: "react",
            group: "external",
            position: "before",
          },
        ],
        pathGroupsExcludedImportTypes: ["react"],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],
    "react/jsx-no-duplicate-props": ["error", { ignoreCase: true }],
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        varsIgnorePattern: "^_",
        argsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "no-useless-rename": "error",
    "object-shorthand": "error",
    "react/jsx-key": ["error", { checkFragmentShorthand: true }],
    "react/react-in-jsx-scope": "off",
    "prettier/prettier": ["error", { endOfLine: "auto" }],
  },
  settings: {
    react: {
      version: "detect",
    },
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        paths: ["src"],
      },
    },
  },
};
