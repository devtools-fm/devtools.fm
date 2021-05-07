import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
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
