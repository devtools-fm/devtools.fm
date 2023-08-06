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
      title="devtools.fm - Stack"
      description="The tools we use to produce and publish and episode of devtools.fm"
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
            Join us as we embark on a journey to explore modern developer
            tooling and interview the people who make it possible.
          </p>
        </div>

        <LinkShieldList />
      </div>
    </Page>
  );
}
