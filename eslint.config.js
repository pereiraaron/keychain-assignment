import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import importX from "eslint-plugin-import-x";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "node_modules"] },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    settings: { react: { version: "detect" } },
    plugins: { react, "react-hooks": reactHooks, "import-x": importX },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      // Rules of Hooks plus React Compiler checks (eslint-plugin-react-hooks v7).
      ...reactHooks.configs.recommended.rules,

      // Props are typed with TypeScript.
      "react/prop-types": "off",

      // Arrow functions only.
      "no-restricted-syntax": [
        "error",
        { selector: "FunctionDeclaration", message: "Use an arrow function: const name = () => {}." },
        { selector: "FunctionExpression", message: "Use an arrow function instead of a function expression." },
      ],
      "prefer-arrow-callback": "error",
      "func-style": ["error", "expression"],

      // Types are imported with their own `import type` statements, after the value imports and
      // separated from them by a blank line.
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "separate-type-imports" }],
      "import-x/consistent-type-specifier-style": ["error", "prefer-top-level"],
      "import-x/order": [
        "error",
        {
          groups: [["builtin", "external", "internal", "parent", "sibling", "index", "object", "unknown"], "type"],
          "newlines-between": "always",
        },
      ],
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // One-line arrows that call a void function (e.g. (event) => setValue(...)) are idiomatic.
      "@typescript-eslint/no-confusing-void-expression": ["error", { ignoreArrowShorthand: true }],
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
      "prefer-const": "error",
      eqeqeq: ["error", "always"],
    },
  },
  {
    // Config files run in Node and are not part of the typed app.
    files: ["*.config.{js,ts}"],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: { globals: globals.node },
  },
  prettier,
  {
    // Braces around every if/else and loop body: `if (x) { return null; }`, never `if (x) return null;`.
    // After `prettier`, which turns `curly` off (its "all" option does not conflict with Prettier).
    rules: { curly: ["error", "all"] },
  },
);
