const OSXTitleBar = () => {
  return (
    <header
      className="rounded-t"
      style={{
        height: "44px",
        background: "linear-gradient(#EBEBEB, #D3D4D3)",
      }}
    ></header>
  );
};

export const Window = () => {
  return <OSXTitleBar />;
};
