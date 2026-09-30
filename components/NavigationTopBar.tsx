
import {
  MoreInfoIcon,
  NewWindowIcon,
  InfoIcon,
  DataIcon,
  ClipboardIcon,
  ExportIcon,
  StylesIcon,
} from "@devtools-ds/icon";
import { Navigation } from "@devtools-ds/navigation";

export const NavigationTopBar = () => {
  const navigate = (href: string) => {
    window.location.assign(href);
  };

  return (
    <Navigation.Controls className="overflow-x-auto">
      <Navigation.TabList>
        <Navigation.Tab
          id="about"
          icon={<InfoIcon inline />}
          onMouseDown={() => navigate("/")}
        >
          About
        </Navigation.Tab>
        <Navigation.Tab
          id="episodes"
          icon={<DataIcon inline />}
          onMouseDown={() => navigate("/episodes")}
        >
          Episodes
        </Navigation.Tab>
        <Navigation.Tab
          id="guests"
          icon={<StylesIcon inline />}
          onMouseDown={() => navigate("/guests")}
        >
          Guests
        </Navigation.Tab>
        <Navigation.Tab
          id="stack"
          icon={<ClipboardIcon inline />}
          onMouseDown={() => navigate("/stack")}
        >
          Stack
        </Navigation.Tab>
        <Navigation.Tab
          id="merch"
          icon={<ExportIcon inline />}
          onMouseDown={() => window.open("https://shop.devtools.fm/")}
        >
          Merch
        </Navigation.Tab>
        <Navigation.Tab
          id="sponsor"
          onMouseDown={() => navigate("/sponsor")}
        >
          $ Sponsor
        </Navigation.Tab>
      </Navigation.TabList>

      <Navigation.Right>
        <Navigation.Button
          icon={<NewWindowIcon inline />}
          aria-label="New Window"
        />

        <Navigation.Divider />
        <Navigation.Button
          icon={<MoreInfoIcon inline />}
          aria-label="More settings"
        />
      </Navigation.Right>
    </Navigation.Controls>
  );
};
