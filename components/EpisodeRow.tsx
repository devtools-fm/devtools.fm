import makeClass from "clsx";
import Link from "next/link";
import { firefox, useTheme } from "@devtools-ds/themes";

import { ColoredText } from "components/ColoredText";
import { ProcessedMdx } from "utils/processMdx";
import { Fragment } from "react";
import styles from "../styles/episodes.module.css";

const DimmedText = (props: React.ComponentProps<"div">) => {
  const { currentColorScheme } = useTheme({});
  const color =
    currentColorScheme === "dark" ? firefox.dark.gray01 : firefox.light.gray05;

  return <div {...props} style={{ ...props.style, color }} />;
};

export const EpisodeRow = (episode: ProcessedMdx) => {
  return (
    <Link
      className={makeClass(
        "grid grid-cols-[1fr 2fr] gap-4 py-4 items-center",
        styles.row
      )}
      href={`episode/${episode.number}`}
    >
      <div className="w-full h-[fit-content]">
        <img
          className="w-full max-w-64 rounded-lg h-full"
          src={`https://i.ytimg.com/vi/${
            episode.thumbnailId || episode.youtubeId
          }/maxresdefault.jpg`}
        />
      </div>
      <div className="flex justify-between flex-col">
        <div className="mb-2">
          <div className="pb-2 flex items-center space-x-4">
            <ColoredText color="blue" className="text-sm md:text-md">
              Episode #{episode.number}
            </ColoredText>

            <DimmedText className="text-xs">
              ({new Date(episode.postCreationDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                timeZone: 'UTC'
              })})
            </DimmedText>
          </div>

          <div className="text-lg md:text-xl mb-3 md:mb-4 font-bold dark:text-gray-200">
            {" "}
            {episode.frontMatter.title}
          </div>
          <div>
            <div className="flex space-x-2 mb-2 text-sm">
              <ColoredText color="gray">Hosts:</ColoredText>
              <ul className="flex space-x-1 dark:text-gray-400">
                {episode.hosts.map((person, index) => (
                  <li key={person}>
                    {person}{index !== episode.hosts.length - 1 ? ", " : ""}
                  </li>
                ))}
              </ul>
            </div>
            {episode.guests.length > 0 && (
              <div className="flex space-x-2 mb-2 text-sm">
                <ColoredText color="gray">Guests:</ColoredText>
                <ul className="flex space-x-1">
                  {episode.guests.map((person, index) => (
                    <li key={person}>
                      {person}{index !== episode.guests.length - 1 ? ", " : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {episode.frontMatter.sponsor && (
              <div className="flex space-x-2 mb-2 text-sm">
                <ColoredText color="purple">Sponsored by:</ColoredText>
                <span className="dark:text-gray-300">
                  {Array.isArray(episode.frontMatter.sponsor) 
                    ? episode.frontMatter.sponsor.join(', ')
                    : episode.frontMatter.sponsor}
                </span>
              </div>
            )}
          </div>
        </div>
        <DimmedText>{episode.runTime}</DimmedText>
      </div>
    </Link>
  );
};
