"use client";

import makeClass from "clsx";

type ColoredTextColor = "blue" | "purple" | "gray";

const coloredTextColors: Record<ColoredTextColor, string> = {
  blue: "var(--theme-blue)",
  purple: "var(--theme-purple)",
  gray: "var(--theme-gray)",
};

export const ColoredText = (props: {
  children: React.ReactNode;
  className?: string;
  color: ColoredTextColor;
}) => {
  const color = coloredTextColors[props.color];

  return (
    <span
      className={makeClass("font-semibold", props.className)}
      style={{ color }}
    >
      {props.children}
    </span>
  );
};
