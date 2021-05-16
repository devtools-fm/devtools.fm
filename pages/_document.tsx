import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link
            rel="icon"
            type="image/png"
            href="icons/favicon-196x196.png"
            sizes="196x196"
          />
          <link
            rel="icon"
            type="image/png"
            href="icons/favicon-96x96.png"
            sizes="96x96"
          />
          <link
            rel="icon"
            type="image/png"
            href="icons/favicon-32x32.png"
            sizes="32x32"
          />
          <link
            rel="icon"
            type="image/png"
            href="icons/favicon-16x16.png"
            sizes="16x16"
          />
          <link
            rel="icon"
            type="image/png"
            href="icons/favicon-128.png"
            sizes="128x128"
          />

          <link
            rel="apple-touch-icon-precomposed"
            sizes="57x57"
            href="icons/apple-touch-icon-57x57.png"
          />
          <link
            rel="apple-touch-icon-precomposed"
            sizes="114x114"
            href="icons/apple-touch-icon-114x114.png"
          />
          <link
            rel="apple-touch-icon-precomposed"
            sizes="72x72"
            href="icons/apple-touch-icon-72x72.png"
          />
          <link
            rel="apple-touch-icon-precomposed"
            sizes="144x144"
            href="icons/apple-touch-icon-144x144.png"
          />
          <link
            rel="apple-touch-icon-precomposed"
            sizes="60x60"
            href="icons/apple-touch-icon-60x60.png"
          />
          <link
            rel="apple-touch-icon-precomposed"
            sizes="120x120"
            href="icons/apple-touch-icon-120x120.png"
          />
          <link
            rel="apple-touch-icon-precomposed"
            sizes="76x76"
            href="icons/apple-touch-icon-76x76.png"
          />
          <link
            rel="apple-touch-icon-precomposed"
            sizes="152x152"
            href="icons/apple-touch-icon-152x152.png"
          />
          <meta name="application-name" content="devtools.fm" />
          <meta name="msapplication-TileColor" content="#FFFFFF" />
          <meta name="msapplication-TileImage" content="icons/mstile-144x144.png" />
          <meta
            name="msapplication-square70x70logo"
            content="icons/mstile-70x70.png"
          />
          <meta
            name="msapplication-square150x150logo"
            content="icons/mstile-150x150.png"
          />
          <meta
            name="msapplication-wide310x150logo"
            content="icons/mstile-310x150.png"
          />
          <meta
            name="msapplication-square310x310logo"
            content="icons/mstile-310x310.png"
          />

          {process.env.NODE_ENV === "production" && (
            <script
              async
              defer
              data-domain="devtools.fm"
              src="https://plausible.io/js/plausible.js"
            ></script>
          )}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
