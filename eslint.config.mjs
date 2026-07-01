import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Règles React Compiler (anticipent un compilateur non activé dans next.config.ts).
      // "set-state-in-effect" entre en conflit direct avec le pattern fetch-dans-hook
      // imposé par CLAUDE.md ; "purity" (Date.now() pendant le rendu) n'a d'impact que
      // si le Compiler est actif. À réactiver si le React Compiler est un jour activé.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
