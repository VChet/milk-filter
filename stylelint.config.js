export default {
  extends: [
    "stylelint-config-recess-order"
  ],
  plugins: [
    "@stylistic/stylelint-plugin",
    "stylelint-order",
    "stylelint-declaration-block-no-ignored-properties"
  ],
  overrides: [{ files: ["**/*.svelte"], customSyntax: "postcss-html" }],
  ignoreFiles: ["dist/**/*css"],
  rules: {
    "@stylistic/color-hex-case": "lower",
    "at-rule-empty-line-before": "never",
    "declaration-empty-line-before": "never",
    "rule-empty-line-before": "never",
    "selector-class-pattern": "[a-z]([a-z-]+)?(__([a-z]+-?)+)?(--([a-z]+-?)+){0,2}",
    "selector-pseudo-class-no-unknown": [true, { ignorePseudoClasses: ["global"] }]
  }
};
