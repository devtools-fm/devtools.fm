const withEsmCss = require("@design-systems/next-esm-css")(["@devtools-ds/.*"]);

module.exports = {
  ...withEsmCss({
    productionBrowserSourceMaps: true,
  }),
  async redirects() {
    return [
      {
        source: "/subscribe",
        destination: "podcast://anchor.fm/s/dd6922b4/podcast/rss",
        permanent: true,
      },
    ];
  },
};
