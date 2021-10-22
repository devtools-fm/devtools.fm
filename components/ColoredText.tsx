import {
  firefox,
  useTheme,
  ColorScheme,
} from "@devtools-ds/themes";
import makeClass from "clsx";

type ColoredTextColor = "blue" | "purple" | "gray";

export const coloredTextTheme: Record<
  ColorScheme,
  Record<ColoredTextColor, string>
> = {
  light: {
    blue: firefox.light.blue03,
    purple: firefox.light.pink01,
    gray: firefox.light.gray06,
  },
  dark: {
    blue: firefox.dark.blue03,
    purple: firefox.dark.pink02,
    gray: firefox.light.gray02,
  },
};

export const ColoredText = (props: {
  children: React.ReactNode;
  className?: string;
  color: ColoredTextColor;
}) => {
  const { currentColorScheme } = useTheme({});
  const color = coloredTextTheme[currentColorScheme][props.color];

  return (
    <span
      className={makeClass("font-semibold", props.className)}
      style={{ color }}
    >
      {props.children}
    </span>
  );
};
