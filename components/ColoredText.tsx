import {
  chrome,
  firefox,
  useTheme,
  Theme,
  ColorScheme,
} from "@devtools-ds/themes";
import makeClass from "clsx";

type ColoredTextColor = "blue" | "purple" | "gray";

export const coloredTextTheme: Record<
  Theme,
  Record<ColorScheme, Record<ColoredTextColor, string>>
> = {
  chrome: {
    light: {
      blue: chrome.light.blue03,
      purple: chrome.light.purple03,
      gray: chrome.light.textColor,
    },
    dark: {
      blue: chrome.dark.blue02,
      purple: chrome.dark.purple02,
      gray: chrome.dark.gray02,
    },
  },
  firefox: {
    light: {
      blue: firefox.light.blue03,
      purple: firefox.light.pink01,
      gray: firefox.light.gray06
    },
    dark: {
      blue: firefox.dark.blue03,
      purple: firefox.dark.pink02,
      gray: firefox.light.gray02,
    },
  },
};

export const ColoredText = (props: {
  children: React.ReactNode;
  className?: string;
  color: ColoredTextColor;
}) => {
  const { currentColorScheme, currentTheme } = useTheme({});
  const color = coloredTextTheme[currentTheme][currentColorScheme][props.color];

  return (
    <span
      className={makeClass("font-semibold", props.className)}
      style={{ color }}
    >
      {props.children}
    </span>
  );
};
