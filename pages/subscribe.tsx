import { Logo } from "components/Logo";
import { ColoredText } from "components/ColoredText";
import { Page } from "components/Page";
import { MetaTags } from "components/MetaTags";
import { Link } from "components/system";
import { useIsClient } from "utils/useIsClient";
import { LinkShieldList } from "components/LinkShieldList";

export default function Episodes() {
  const isClient = useIsClient();
  const tags = (
    <MetaTags
      title="devtools.fm - Subscribe"
      description="A podcast about developer tools by the people who make them."
      image="https://devtools.fm/og-image.png"
    />
  );

  if (!isClient) {
    return tags;
  }

  return (
    <Page hideFooter>
      {tags}

      <div className="h-full flex-1 flex flex-col justify-center">
        <div className="mb-8">
          <h1 className="flex justify-center mb-2 md:mb-6">
            <Link href="/">
              <Logo />
            </Link>
          </h1>

          <p className="text-lg text-center mb-4">
            A podcast about{" "}
            <ColoredText color="purple">developer tools</ColoredText> and the{" "}
            <ColoredText color="blue">people</ColoredText> who make them.
          </p>
          <p className="text-center">
            Click an icon below to follow us on your favorite platform.
          </p>
        </div>

        <LinkShieldList />
      </div>
    </Page>
  );
}
