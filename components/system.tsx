import makeClass from "clsx";
import { firefox } from "@devtools-ds/themes";
import { ComponentProps } from "react";
import { ColoredText } from "components/ColoredText";

export const H1 = ({ className, ...props }: ComponentProps<"h1">) => (
  <h1 className={makeClass(className, "text-3xl mb-6")} {...props} />
);

export const H2 = ({ className, ...props }: ComponentProps<"h2">) => (
  <h2
    className={makeClass(
      className,
      "text-2xl border-b-2 pb-2 border-dashed border-gray-600 mb-6"
    )}
    {...props}
  />
);

export const H3 = ({ className, ...props }: ComponentProps<"h3">) => (
  <h3
    className={makeClass(className, "text-xl mb-6 mt-6 font-medium")}
    {...props}
  />
);

export const H4 = ({ className, ...props }: ComponentProps<"h4">) => (
  <h4
    className={makeClass(className, "text-lg mb-6 mt-6 font-semibold")}
    {...props}
  />
);

export const Blockquote = ({
  className,
  ...props
}: ComponentProps<"blockquote">) => (
  <blockquote
    className={makeClass(className, "my-8 pl-4 border-l-4")}
    style={{ borderColor: firefox.dark.pink02 }}
    {...props}
  />
);

export const P = ({ className, ...props }: ComponentProps<"p">) => (
  <p className={makeClass(className, "my-6")} {...props} />
);

export const Ul = ({ className, ...props }: ComponentProps<"ul">) => (
  <ul className={makeClass(className, "list-disc pl-6 my-4")} {...props} />
);

export const Link = ({
  className,
  children,
  ...props
}: ComponentProps<"a">) => (
  <a className={makeClass(className, "my-6")} {...props}>
    <ColoredText color="purple" className="underline">
      {children}
    </ColoredText>
  </a>
);

export const HR = ({ className, ...props }: ComponentProps<"hr">) => (
  <hr className={makeClass(className, "my-12 border-gray-600")} {...props} />
);
