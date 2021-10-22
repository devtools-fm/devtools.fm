import Image from "next/image";

export const Logo = () => {
  return (
    <div className="max-w-[130px] md:max-w-[220px] h-full">
      <Image src="/logo.png" height="605px" width="602px" />
    </div>
  );
};
