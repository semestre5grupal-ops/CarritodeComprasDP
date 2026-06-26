import pluginJs from "@eslint/js";
import pluginVue from "eslint-plugin-vue";

export default [
  pluginJs.configs.recommended,
  ...pluginVue.configs["flat/essential"],
  {
    languageOptions: {
      ecmaVersion: 12,
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        navigator: "readonly",
        fetch: "readonly",
        console: "readonly",
        indexedDB: "readonly",
        alert: "readonly",
        setTimeout: "readonly",
        clearInterval: "readonly",
        setInterval: "readonly",
        CustomEvent: "readonly",
        Event: "readonly",
        URLSearchParams: "readonly",
        vi: "readonly",
        process: "readonly"
      }
    },
    rules: {
      "vue/multi-word-component-names": "off",
      "no-unused-vars": "off",
      "semi": ["warn", "never"],
      "quotes": ["warn", "single"],
      "vue/no-parsing-error": ["error", {
        "invalid-first-character-of-tag-name": false
      }]
    }
  }
];
