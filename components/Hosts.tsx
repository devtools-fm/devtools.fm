import { ThemeProvider } from "@devtools-ds/themes";

import { andrew, Host, justin } from "components/Host";

/**
 * The host cards use devtools-ds' ObjectInspector, which builds its tree in an
 * effect and is expandable, so this is the one piece of the home page that is
 * hydrated (client:visible). Light firefox classes + CSS handle dark mode.
 * The tree's stylesheet is imported in styles/globals.css.
 */
export default function Hosts() {
  return (
    <ThemeProvider theme="firefox" colorScheme="light">
      <div className="hosts space-y-4 md:space-y-6">
        <Host name="Andrew Lisowski" data={andrew} />
        <Host name="Justin Bennett" data={justin} />
      </div>
    </ThemeProvider>
  );
}
