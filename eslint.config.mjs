import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const eslintConfig = [...nextCoreWebVitals, ...nextTypescript, {
  rules: {
    // TypeScript rules — صحت کد
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/ban-ts-comment": "warn",

    // React rules — صحت هوک‌ها
    // set-state-in-effect و purity قواعد سخت‌گیرانه React Compiler هستند
    // که الگوهای مشروع subscribe/init را هم علامت می‌زنند (حتی در shadcn)؛
    // به‌صورت هشدار نگه داشته می‌شوند تا در بازبینی‌ها دیده شوند.
    "react-hooks/set-state-in-effect": "warn",
    "react-hooks/exhaustive-deps": "warn",
    "react-hooks/purity": "warn",
    "react/no-unescaped-entities": "warn",
    "react/display-name": "warn",

    // Next.js rules
    "@next/next/no-img-element": "warn",

    // General JavaScript rules — خطاهای واقعی کد
    "prefer-const": "warn",
    "no-unreachable": "error",
    "no-redeclare": "error",
    "no-fallthrough": "warn",
    "no-case-declarations": "warn",
    "no-useless-escape": "warn",
    "no-debugger": "warn",
    "no-irregular-whitespace": "warn",
  },
}, {
  ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts", "examples/**", "skills/**"]
}];

export default eslintConfig;
