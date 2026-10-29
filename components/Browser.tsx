import makeClass from "clsx";

interface BrowserProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * A grayscale browser-window frame around page content. Plain CSS
 * (`.browser-window` in styles/globals.css) so it renders without client JS;
 * this replaced react-window-ui, whose styled-components styles only exist
 * after hydration.
 */
export const Browser = ({ children, className }: BrowserProps) => {
  return (
    <div className={makeClass("browser-window mb-12 md:mb-20", className)}>
      {children}
    </div>
  );
};
