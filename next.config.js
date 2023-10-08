const withEsmCss = require("@design-systems/next-esm-css")(["@devtools-ds/.*"]);

module.exports = withEsmCss({
  productionBrowserSourceMaps: true,
  async redirects() {
    return [
      {
        source: "/",
        basePath: false,
        permanent: false,
        has: [
          {
            type: "host",
            value: "mail.devtools.fm",
          },
        ],
        destination: "https://devtoolsfm.beehiiv.com/subscribe",
      },
    ];
  },
});
