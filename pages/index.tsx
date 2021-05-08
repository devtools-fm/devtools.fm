import {
  MoreInfoIcon,
  NewWindowIcon,
  InfoIcon,
  DataIcon,
} from "@devtools-ds/icon";
import { Navigation } from "@devtools-ds/navigation";
import { useRouter } from "next/router";

import { Logo } from "components/Logo";
import { ColoredText } from "components/ColoredText";
import { Page } from "components/Page";
import { Browser } from "components/Browser";
import { justin, Host, andrew } from "components/Host";
import { MetaTags } from "components/MetaTags";

export default function Home() {
  const router = useRouter();
  const tags = (
    <MetaTags
      title="devtools.fm"
      description="A podcast about developer tools by the people who make them."
      image="https://devtools.fm/og-image.png"
    />
  );

  if (typeof window === "undefined") {
    return tags;
  }

  return (
    <Page>
      {tags}

      <div className="mt-10 mb-12">
        <h1 className="flex justify-center mb-10">
          <Logo />
        </h1>

        <p className="text-lg text-center">
          A podcast about{" "}
          <ColoredText color="purple">developer tools</ColoredText> and the{" "}
          <ColoredText color="blue">people</ColoredText> who make them.
        </p>
      </div>

      <Browser>
        <Navigation index={0} onChange={() => {}}>
          <Navigation.Controls className="overflow-x-auto">
            <Navigation.TabList>
              <Navigation.Tab id="about" icon={<InfoIcon inline />}>
                About
              </Navigation.Tab>
              <Navigation.Tab
                id="episodes"
                icon={<DataIcon inline />}
                onMouseDown={() => router.push("/episodes")}
              >
                Episodes
              </Navigation.Tab>
            </Navigation.TabList>

            <Navigation.Right>
              <Navigation.Button
                icon={<NewWindowIcon inline />}
                aria-label="New Window"
              />

              <Navigation.Divider />
              <Navigation.Button
                icon={<MoreInfoIcon inline />}
                aria-label="More settings"
              />
            </Navigation.Right>
          </Navigation.Controls>
          <Navigation.Panels>
            <Navigation.Panel className="pt-4 md:pt-6 mx-3 mb-4 focus:outline-none">
              <p
                className="mb-6 md:mb-10"
                style={{
                  fontFamily: "Menlo, monospace",
                }}
              >
                No matter what type of code you write, you're going to be
                dealing with developer tools. This podcast will explore the
                bleeding edge of modern developer tooling all up and down the
                stack. Come learn with us as we talk with industry leaders and
                taste-makers from all of the programming world.
              </p>

              <h2 className="text-xl md:text-2xl mb-4 md:mb-6">Hosts</h2>

              <div className="space-y-4 md:space-y-6">
                <Host name="Andrew Lisowski" data={andrew} />
                <Host name="Justin Bennett" data={justin} />
              </div>
            </Navigation.Panel>
          </Navigation.Panels>
        </Navigation>
      </Browser>
    </Page>
  );
}
