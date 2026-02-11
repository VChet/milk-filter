export default {
  extends: [
    "stylelint-config-standard",
    "stylelint-config-recess-order"
  ],
  plugins: [
    "@stylistic/stylelint-plugin",
    "stylelint-declaration-block-no-ignored-properties",
    "stylelint-order"
  ],
  overrides: [{ files: ["**/*.svelte"], customSyntax: "postcss-html" }],
  ignoreFiles: ["dist/**/*css"],
  rules: {
    "@stylistic/color-hex-case": "lower",
    "at-rule-empty-line-before": "never",
    "declaration-empty-line-before": "never",
    "plugin/declaration-block-no-ignored-properties": true,
    "rule-empty-line-before": "never",
    "selector-class-pattern": "[a-z]([a-z-]+)?(__([a-z]+-?)+)?(--([a-z]+-?)+){0,2}"
  }
};
