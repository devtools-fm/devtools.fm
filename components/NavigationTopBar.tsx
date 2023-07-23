import {
  MoreInfoIcon,
  NewWindowIcon,
  InfoIcon,
  DataIcon,
  ClipboardIcon,
  ExportIcon,
  StylesIcon,
} from "@devtools-ds/icon";
import { useRouter } from "next/router";
import { Navigation } from "@devtools-ds/navigation";

export const NavigationTopBar = () => {
  const router = useRouter();

  return (
    <Navigation.Controls className="overflow-x-auto">
      <Navigation.TabList>
        <Navigation.Tab
          id="about"
          icon={<InfoIcon inline />}
          onMouseDown={() => router.push("/")}
        >
          About
        </Navigation.Tab>
        <Navigation.Tab
          id="episodes"
          icon={<DataIcon inline />}
          onMouseDown={() => router.push("/episodes")}
        >
          Episodes
        </Navigation.Tab>
        <Navigation.Tab
          id="guests"
          icon={<StylesIcon inline />}
          onMouseDown={() => router.push("/guests")}
        >
          Guests
        </Navigation.Tab>
        <Navigation.Tab
          id="stack"
          icon={<ClipboardIcon inline />}
          onMouseDown={() => router.push("/stack")}
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
          onMouseDown={() => router.push("/sponsor")}
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
