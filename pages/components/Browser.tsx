import { Browser as BrowserWindow } from "react-window-ui";
import { useTheme } from "@devtools-ds/themes";
import endent from "endent";

interface BrowserProps {
  children: React.ReactNode;
}

export const Browser = ({ children }: BrowserProps) => {
  const { currentColorScheme } = useTheme({});

  return (
    <BrowserWindow
      padding="32px 0 0 0"
      background="inherit"
      grayscale={true}
      topbarTitle="devtools.fm"
      topbarTitleColor="inherit"
      divider={currentColorScheme === "dark" ? "black" : undefined}
      topbarColor={
        currentColorScheme === "dark"
          ? "linear-gradient(rgba(67,67,67,1) 0%, rgba(55,55,55,1) 99%, rgba(0,0,0,1) 100%)"
          : "linear-gradient(rgba(244,244,244,1) 0%, rgba(211,211,212,1) 99%, rgba(174,174,173,1) 100%)"
      }
      border={currentColorScheme === "dark" ? "#888" : undefined}
      boxShadow={
        currentColorScheme === "dark"
          ? undefined
          : endent`
            0 1px 2px rgba(0,0,0,0.07), 
            0 2px 4px rgba(0,0,0,0.07), 
            0 4px 8px rgba(0,0,0,0.07), 
            0 8px 16px rgba(0,0,0,0.07),
            0 16px 32px rgba(0,0,0,0.07), 
            0 32px 64px rgba(0,0,0,0.07)
          `
      }
    >
      {children}
    </BrowserWindow>
  );
};
