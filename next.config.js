const withEsmCss = require("@design-systems/next-esm-css")(["@devtools-ds/.*"]);

module.exports = {
  ...withEsmCss({
    productionBrowserSourceMaps: true,
  }),
  async redirects() {
    return [
      {
        source: "/subscribe",
        destination:
          "https://podcasts.apple.com/us/podcast/devtools-fm/id1566647758?itsct=podcast_box&itscg=30200&ls=1",
        permanent: true,
      },
    ];
  },
};
