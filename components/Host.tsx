import { useTheme } from "@devtools-ds/themes";
import { ObjectInspector } from "@devtools-ds/object-inspector";
import { coloredTextTheme } from "./ColoredText";

interface HostData {
  twitter: string;
  github: string;
  location: string;
  employer: string;
  [key: string]: unknown;
}

interface HostProps {
  name: string;
  data: HostData;
}

export const justin = {
  description:
    "An engineer who loves building tools and thinking about ways to make tech more human",
  twitter: "https://twitter.com/Zephraph",
  github: "https://github.com/Zephraph",
  site: "https://just-be.dev",
  location: "Brooklyn, NY",
  employer: "Artsy",
};

export const andrew = {
  description:
    "A front-end dev with a passion for ergonomic developer tools, buttery smooth UX, and open source..",
  twitter: "https://twitter.com/hipstersmoothie",
  github: "https://github.com/hipstersmoothie",
  location: "San Diego, CA",
  employer: "Descript",
  pets: [
    { type: "dog", name: "Bonsai" },
    { type: "dog", name: "Fred" },
  ],
};

export const Host = ({ name, data }: HostProps) => {
  const { currentColorScheme, currentTheme } = useTheme({});

  return (
    <div>
      <h3 className="mb-2">
        <a
          target="_blank"
          rel="noopener"
          href={data.twitter}
          className="underline"
          style={{
            color: coloredTextTheme[currentTheme][currentColorScheme].blue,
          }}
        >
          {name}
        </a>
      </h3>
      <div className="max-w-full overflow-x-auto">
        <ObjectInspector data={data} expandLevel={1} />
      </div>
    </div>
  );
};
