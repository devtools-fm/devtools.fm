const withEsmCss = require("@design-systems/next-esm-css")(["@devtools-ds/.*"]);

module.exports = withEsmCss({
  productionBrowserSourceMaps: true,
  async redirects() {
    return [
      {
        source: "/docs",
        destination: "https://github.com/devtools-fm/devtools.fm/discussions",
      },
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
