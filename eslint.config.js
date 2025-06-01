import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    languageOptions: { globals: globals.browser },
  },
  tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
    ...pluginReact.configs.flat.recommended,
  },
  { ignores: ["**/dist/**", "**/.turbo/**", "**/.astro/**"] },
  {
    rules: {
      "@typescript-eslint/method-signature-style": "error",
      "react/react-in-jsx-scope": "off",
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            {
              regex: "^\\.\\./.+$",
            },
            {
              regex: "^\\./.+/.+$",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.json"],
    plugins: { json },
    language: "json/json",
    extends: ["json/recommended"],
    ignores: [
      "**/tsconfig.json",
      "**/tsconfig-*.json",
      "**/devcontainer.json",
      "**/package-lock.json",
    ],
  },
  {
    files: [
      "**/*.jsonc",
      "**/tsconfig.json",
      "**/tsconfig-*.json",
      "**/devcontainer.json",
    ],
    plugins: { json },
    language: "json/jsonc",
    extends: ["json/recommended"],
  },
  {
    files: ["**/*.md"],
    plugins: { markdown },
    language: "markdown/gfm",
    extends: ["markdown/recommended"],
  },
  {
    settings: {
      react: {
        version: "19",
      },
    },
  },
]);
