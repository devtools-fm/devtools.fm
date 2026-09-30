import { Browser as BrowserWindow } from "react-window-ui";

interface BrowserProps {
  children: React.ReactNode;
}

export const Browser = ({ children }: BrowserProps) => {
  return (
    <BrowserWindow
      padding="32px 0 0 0"
      className="mb-12 md:mb-20"
      background="inherit"
      grayscale={true}
      topbarTitle="devtools.fm"
      topbarTitleColor="inherit"
      divider="var(--browser-divider)"
      topbarColor="var(--browser-topbar)"
      border="var(--browser-border)"
      boxShadow="var(--browser-shadow)"
    >
      {children}
    </BrowserWindow>
  );
};
