const withEsmCss = require("@design-systems/next-esm-css")(["@devtools-ds/.*"]);

module.exports = withEsmCss({
  productionBrowserSourceMaps: true,
});
