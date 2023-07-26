import Image from "next/image";

export const Logo = () => {
  return (
    <div className="max-w-[130px] md:max-w-[220px] h-full">
      <Image src="/logo.png" alt="" height={605} width={602} />
    </div>
  );
};
