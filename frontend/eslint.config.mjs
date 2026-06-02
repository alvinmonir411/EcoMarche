import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "scratch/**",
  ]),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
      "react-hooks/set-state-in-effect": "off",
      "react/no-unescaped-entities": "off",
      "prefer-const": "warn",
    },
  },
]);

export default eslintConfig;
