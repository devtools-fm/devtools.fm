import {
  chrome,
  firefox,
  useTheme,
  Theme,
  ColorScheme,
} from "@devtools-ds/themes";

type ColoredTextColors = "blue" | "purple";

export const coloredTextTheme: Record<
  Theme,
  Record<ColorScheme, Record<ColoredTextColors, string>>
> = {
  chrome: {
    light: {
      blue: chrome.light.blue03,
      purple: chrome.light.purple03,
    },
    dark: {
      blue: chrome.dark.blue02,
      purple: chrome.dark.purple02,
    },
  },
  firefox: {
    light: {
      blue: firefox.light.blue03,
      purple: firefox.light.pink01,
    },
    dark: {
      blue: firefox.dark.blue03,
      purple: firefox.dark.pink02,
    },
  },
};

export const ColoredText = (props: {
  children: React.ReactNode;
  color: "blue" | "purple";
}) => {
  const { currentColorScheme, currentTheme } = useTheme({});
  const color = coloredTextTheme[currentTheme][currentColorScheme][props.color];

  return (
    <span className="font-semibold" style={{ color }}>
      {props.children}
    </span>
  );
};
