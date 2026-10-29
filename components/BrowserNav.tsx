import {
  ClipboardIcon,
  DataIcon,
  ExportIcon,
  InfoIcon,
  MoreInfoIcon,
  NewWindowIcon,
  StylesIcon,
} from "@devtools-ds/icon";
// The class-name map behind devtools-ds' <Navigation>. We render the same markup
// statically (no React state, no @reach/tabs) so pages ship no client JS.
import navStyles from "@devtools-ds/navigation/dist/cjs/Navigation.css.js";
import makeClass from "clsx";
import type { ComponentProps, ReactNode } from "react";

export { navStyles };

/** Light firefox classes; dark mode comes from the prefers-color-scheme CSS in globals.css. */
export const navClassName = makeClass(
  navStyles.nav,
  navStyles.firefox,
  navStyles.light
);

export const NavIcon = ({ children }: { children: ReactNode }) => (
  <div className={navStyles.icon}>{children}</div>
);

export function tabClassName(selected: boolean, className?: string) {
  return makeClass(
    className,
    navStyles.tab,
    navStyles.button,
    selected && navStyles.selected
  );
}

/** The decorative buttons on the right of the devtools nav bar. */
export const NavRight = () => (
  <div className={navStyles.right}>
    <button type="button" className={navStyles.button} aria-label="New Window">
      <NavIcon>
        <NewWindowIcon inline />
      </NavIcon>
    </button>
    <div className={navStyles.divider} />
    <button type="button" className={navStyles.button} aria-label="More settings">
      <NavIcon>
        <MoreInfoIcon inline />
      </NavIcon>
    </button>
  </div>
);

export const NavControls = ({ children }: { children: ReactNode }) => (
  <div className={makeClass(navStyles.controls, "overflow-x-auto")}>
    {children}
    <NavRight />
  </div>
);

type SiteSection = "about" | "episodes" | "guests" | "stack" | "sponsor";

const siteLinks: {
  id: SiteSection | "merch";
  href: string;
  label: string;
  icon?: ReactNode;
  external?: boolean;
}[] = [
  { id: "about", href: "/", label: "About", icon: <InfoIcon inline /> },
  { id: "episodes", href: "/episodes", label: "Episodes", icon: <DataIcon inline /> },
  { id: "guests", href: "/guests", label: "Guests", icon: <StylesIcon inline /> },
  { id: "stack", href: "/stack", label: "Stack", icon: <ClipboardIcon inline /> },
  {
    id: "merch",
    href: "https://shop.devtools.fm/",
    label: "Merch",
    icon: <ExportIcon inline />,
    external: true,
  },
  { id: "sponsor", href: "/sponsor", label: "$ Sponsor" },
];

interface SiteNavProps extends ComponentProps<"div"> {
  active: SiteSection;
}

/** The site-wide nav bar: real links styled as devtools tabs, followed by the page content. */
export const SiteNav = ({ active, className, children, ...props }: SiteNavProps) => (
  <nav className={navClassName}>
    <NavControls>
      <div className={navStyles.overflow}>
        {siteLinks.map((link) => (
          <a
            key={link.id}
            href={link.href}
            className={tabClassName(link.id === active)}
            aria-current={link.id === active ? "page" : undefined}
            {...(link.external ? { target: "_blank", rel: "noopener" } : {})}
          >
            {link.icon && <NavIcon>{link.icon}</NavIcon>}
            <div>{link.label}</div>
          </a>
        ))}
      </div>
    </NavControls>
    <div className={makeClass("focus:outline-none", className)} {...props}>
      {children}
    </div>
  </nav>
);
