import Head from "next/head";

interface MetaTagsProps {
  title: string;
  description: string;
  image: string;
}

export const MetaTags = (props: MetaTagsProps) => {
  const url = "https://devtools.fm/";

  return (
    <Head>
      {/* <!-- Primary Meta Tags --> */}
      <title>{props.title}</title>
      <meta name="title" content={props.title} />
      <meta name="description" content={props.description} />

      {/* <!-- Open Graph / Facebook --> */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={props.title} />
      <meta property="og:description" content={props.description} />
      <meta property="og:image" content={props.image} />

      {/* <!-- Twitter --> */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={url} />
      <meta name="twitter:title" content={props.title} />
      <meta name="twitter:description" content={props.description} />
      <meta name="twitter:image" content={props.image} />
    </Head>
  );
};
