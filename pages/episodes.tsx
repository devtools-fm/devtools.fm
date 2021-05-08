import {
  MoreInfoIcon,
  NewWindowIcon,
  InfoIcon,
  DataIcon,
} from "@devtools-ds/icon";
import makeClass from "clsx";
import { promises as fs } from "fs";
import path from "path";
import { Navigation } from "@devtools-ds/navigation";
import Link from "next/link";
import { useRouter } from "next/router";
import { chrome, firefox, useTheme } from "@devtools-ds/themes";

import { Logo } from "components/Logo";
import { ColoredText } from "components/ColoredText";
import { Page } from "components/Page";
import { Browser } from "components/Browser";
import { ProcessedMdx, processMdx } from "utils/processMdx";
import { Fragment } from "react";
import styles from "../styles/episodes.module.css";
import { MetaTags } from "components/MetaTags";

interface HomeProps {
  episodes: ProcessedMdx[];
}

export default function Home({ episodes }: HomeProps) {
  const router = useRouter();
  const { currentColorScheme, currentTheme } = useTheme({});
  const tags = (
    <MetaTags
      title="devtools.fm - Episodes"
      description="A list of the the episodes."
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
        <Navigation index={1} onChange={() => {}}>
          <Navigation.Controls className="overflow-x-auto">
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
            <Navigation.Panel className="md:p-4 pt-4 mx-3 mb-4 focus:outline-none">
              <div className="divide-y-2 divide-gray-300 dark:divide-gray-200">
                {episodes.map((episode) => (
                  <Link passHref href={`episode/${episode.number}`}>
                    <a
                      className={makeClass(
                        "grid grid-cols-[1fr 2fr] gap-4 pt-4",
                        styles.row
                      )}
                      style={{
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

                          <div className="text-lg md:text-xl mb-3 md:mb-4 font-bold dark:text-gray-200">
                            {" "}
                            {episode.frontMatter.title}
                          </div>
                          <div>
                            <div className="flex space-x-2 mb-2 text-sm">
                              <ColoredText color="gray">Hosts:</ColoredText>
                              <ul className="flex space-x-2 dark:text-gray-400">
                                {episode.hosts.map((person, index) => (
                                  <Fragment key={person}>
                                    <li>{person}</li>
                                    {index !== episode.hosts.length - 1
                                      ? ", "
                                      : ""}
                                  </Fragment>
                                ))}
                              </ul>
                            </div>
                            {episode.guests.length > 0 && (
                              <div className="flex space-x-2 mb-2 text-sm">
                                <ColoredText color="gray">Guests:</ColoredText>
                                <ul className="flex space-x-2">
                                  {episode.guests.map((person, index) => (
                                    <Fragment key={person}>
                                      <li>{person}</li>
                                      {index !== episode.guests.length - 1
                                        ? ", "
                                        : ""}
                                    </Fragment>
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
