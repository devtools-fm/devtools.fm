import {
  MoreInfoIcon,
  NewWindowIcon,
  InfoIcon,
  DataIcon,
} from "@devtools-ds/icon";
import { Navigation } from "@devtools-ds/navigation";

import { Logo } from "./components/Logo";
import { ColoredText } from "./components/ColoredText";
import { Page } from "./components/Page";
import { Browser } from "./components/Browser";
import { justin, Host, andrew } from "./components/Host";

export default function Home() {
  return (
    <Page title="devtools.fm">
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
        <Navigation>
          <Navigation.Controls>
            <Navigation.TabList>
              <Navigation.Tab id="about" icon={<InfoIcon inline />}>
                About
              </Navigation.Tab>
              <Navigation.Tab id="episodes" icon={<DataIcon inline />}>
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
            <Navigation.Panel className="pt-4 md:pt-6 mx-3 mb-4">
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
            <Navigation.Panel className="pt-4 md:pt-6 mx-3 mb-4">
              Work in progress...
            </Navigation.Panel>
          </Navigation.Panels>
        </Navigation>
      </Browser>
    </Page>
  );
}
