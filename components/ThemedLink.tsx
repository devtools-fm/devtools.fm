import makeClass from "clsx";

export const ThemedLink = (props: React.ComponentProps<"a">) => {
  const color = "var(--theme-blue)";

  return (
    <a
      {...props}
      style={{ color, ...props.style }}
      className={makeClass("underline", props.className)}
    />
  );
};
