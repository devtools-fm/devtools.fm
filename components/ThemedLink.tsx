import { useTheme } from "@devtools-ds/themes";
import makeClass from "clsx";
import { coloredTextTheme } from "./ColoredText";

export const ThemedLink = (props: React.ComponentProps<"a">) => {
  const { currentColorScheme, currentTheme } = useTheme({});
  const color = coloredTextTheme[currentColorScheme].blue;

  return (
    <a
      {...props}
      style={{ color, ...props.style }}
      className={makeClass("underline", props.className)}
    />
  );
};
