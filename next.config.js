const withEsmCss = require("@design-systems/next-esm-css")(["@devtools-ds/.*"]);

module.exports = {
  ...withEsmCss({
    productionBrowserSourceMaps: true,
  }),
  async redirects() {
    return [
      {
        source: "/subscribe",
        destination: "https://www.pod.link/1566647758",
        permanent: true,
      },
    ];
  },
};
