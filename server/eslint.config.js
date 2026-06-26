const pluginJs = require("@eslint/js");

module.exports = [
  pluginJs.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 12,
      sourceType: "commonjs",
      globals: {
        require: "readonly",
        module: "readonly",
        process: "readonly",
        __dirname: "readonly",
        console: "readonly",
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        afterAll: "readonly",
        beforeAll: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        jest: "readonly",
        Buffer: "readonly",
      }
    },
    rules: {
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_|^next$|^req$|^res$" }],
      "no-console": "off",
      "semi": ["warn", "never"],
      "quotes": ["warn", "single"]
    }
  },
  {
    files: ["**/__tests__/**/*.js", "**/*.test.js", "**/*.spec.js"],
    rules: {
      "no-unused-vars": "off",
      "no-undef": "off"
    }
  }
];
