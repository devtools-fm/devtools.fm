import {
  MoreInfoIcon,
  NewWindowIcon,
  InfoIcon,
  DataIcon,
} from "@devtools-ds/icon";
import { promises as fs } from "fs";
import path from "path";
import { Navigation } from "@devtools-ds/navigation";
import Link from "next/link";
import { useRouter } from "next/router";
import hydrate from "next-mdx-remote/hydrate";
import { chrome, firefox, useTheme } from "@devtools-ds/themes";

import { Logo } from "components/Logo";
import { ColoredText } from "components/ColoredText";
import { Page } from "components/Page";
import { Browser } from "components/Browser";
import { ProcessedMdx, processMdx } from "utils/processMdx";

const mdxComponents = {};

interface HomeProps {
  episodes: ProcessedMdx[];
}

export default function Home({ episodes }: HomeProps) {
  const router = useRouter();
  const { currentColorScheme, currentTheme } = useTheme({});

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
        <Navigation index={1}>
          <Navigation.Controls>
            <Navigation.TabList>
              <Navigation.Tab
                id="about"
                icon={<InfoIcon inline />}
                onMouseDown={() => router.push("/")}
              >
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
            <Navigation.Panel />
            <Navigation.Panel className="md:p-4 md:pt-6 mx-3 mb-4 focus:outline-none">
              <div className="divide-y-2 divide-gray-300 dark:divide-gray-200">
                {episodes.map((episode) => (
                  <Link passHref href={`episode/${episode.number}`}>
                    <a
                      className="grid grid-cols-2 gap-4 py-4 md:py-6"
                      style={{
                        gridTemplateColumns: "1fr 2fr",
                        borderColor:
                          currentColorScheme === "dark"
                            ? chrome.dark.gray04
                            : undefined,
                      }}
                    >
                      <div className="h-full w-full">
                        <img
                          className="w-full max-w-64 rounded-lg object-cover h-full"
                          src={`https://i.ytimg.com/vi/${episode.youtubeId}/maxresdefault.jpg`}
                        />
                      </div>
                      <div className="flex justify-between flex-col">
                        <div className="mb-2">
                          <ColoredText
                            color="blue"
                            className="text-sm md:text-md pb-2 block"
                          >
                            Episode #{episode.number}
                          </ColoredText>

                          <div className="text-lg md:text-xl mb-3 md:mb-4 font-bold dark:text-white">
                            {" "}
                            {episode.frontMatter.title}
                          </div>
                          <div>
                            <div className="flex space-x-2 mb-2 text-sm">
                              <ColoredText color="gray">Hosts:</ColoredText>
                              <ul className="flex space-x-2">
                                {episode.hosts.map((person, index) => (
                                  <>
                                    <li>{person}</li>
                                    {index !== episode.hosts.length - 1
                                      ? ", "
                                      : ""}
                                  </>
                                ))}
                              </ul>
                            </div>
                            {episode.guests.length > 0 && (
                              <div className="flex space-x-2 mb-2 text-sm">
                                <ColoredText color="gray">Guests:</ColoredText>
                                <ul className="flex space-x-2">
                                  {episode.guests.map((person, index) => (
                                    <>
                                      <li>{person}</li>
                                      {index !== episode.guests.length - 1
                                        ? ", "
                                        : ""}
                                    </>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                        <div
                          style={{
                            color:
                              currentColorScheme === "dark"
                                ? currentTheme === "chrome"
                                  ? chrome.dark.gray03
                                  : firefox.dark.gray01
                                : currentTheme === "chrome"
                                ? chrome.light.gray06
                                : firefox.light.gray05,
                          }}
                        >
                          {episode.runTime}
                        </div>
                      </div>
                    </a>
                  </Link>
                ))}
              </div>
            </Navigation.Panel>
          </Navigation.Panels>
        </Navigation>
      </Browser>
    </Page>
  );
}

export async function getStaticProps() {
  const episodes = (
    await fs.readdir(path.join(process.cwd(), `pages/episode`))
  ).filter((p) => p.endsWith(".mdx"));

  const data = await Promise.all(
    episodes.map((episode) =>
      processMdx(path.join(process.cwd(), "pages/episode", episode), {})
    )
  );

  return { props: { episodes: data } };
}
