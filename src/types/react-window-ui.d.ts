declare module "react-window-ui" {
  import type { ComponentType, HTMLAttributes } from "react";

  export interface BrowserProps extends HTMLAttributes<HTMLDivElement> {
    padding?: string;
    background?: string;
    grayscale?: boolean;
    topbarTitle?: string;
    topbarTitleColor?: string;
    divider?: string;
    topbarColor?: string;
    border?: string;
    boxShadow?: string;
  }

  export const Browser: ComponentType<BrowserProps>;
}
