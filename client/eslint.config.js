import pluginJs from "@eslint/js";
import pluginVue from "eslint-plugin-vue";

export default [
  pluginJs.configs.recommended,
  ...pluginVue.configs["flat/recommended"],
  {
    languageOptions: {
      ecmaVersion: 12,
      sourceType: "module",
    },
    rules: {
      "vue/multi-word-component-names": "off",
      "no-unused-vars": "warn",
      "semi": ["warn", "never"],
      "quotes": ["warn", "single"]
    }
  }
];
