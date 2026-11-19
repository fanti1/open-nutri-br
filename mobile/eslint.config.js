// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");
const reactHooks = require('eslint-plugin-react-hooks');

module.exports = defineConfig([
  expoConfig,
  {
    // Regras do React Compiler (ligado em app.json): código que as quebra
    // deixa de ser otimizado automaticamente — o lint avisa antes.
    files: ['**/*.{ts,tsx}'],
    rules: reactHooks.configs['recommended-latest'].rules,
  },
  {
    ignores: ["dist/*"],
  }
]);
