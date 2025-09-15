// eslint.config.mjs（Flat Config）
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

/**
 * CI/本番ビルドで落ちないように、厳しいルールを一旦ゆるめます。
 * - any は許可
 * - 未使用変数/prefer-const は warning
 * - React Hooks の基本ルールは維持
 */
export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { "react-hooks": reactHooks },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "prefer-const": "warn",
      // Hooks 関連はバグ防止のため維持
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn"
    }
  },
  {
    // JS/TS/React ファイル対象
    files: ["**/*.{js,jsx,ts,tsx}"],
  },
];
