import { ConsoleIcon } from "@devtools-ds/icon";

export const Logo = () => {
  return (
    <div className=" bg-[#881180] py-4 px-6 w-[fit-content] rounded-xl">
      <span
        className="flex items-center space-x-4 w-[fit-content] rounded-xl !text-black"
        style={{ filter: "invert()" }}
      >
        <ConsoleIcon
          height="0"
          width="0"
          className="!w-12 md:!w-[60px] !h-12 md:!h-[60px] fill-current"
        />
        <span className="font-bold text-3xl md:text-5xl">devtools.fm</span>
      </span>
    </div>
  );
};
