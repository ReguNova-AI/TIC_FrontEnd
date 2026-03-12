const Loader = () => (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 2001,
      width: "100%",
    }}
  >
    <div
      style={{
        height: "3px",
        background: "linear-gradient(90deg, transparent, #5B0429, transparent)",
        backgroundSize: "200% 100%",
        animation: "loaderSlide 1.2s ease-in-out infinite",
      }}
    />
    <style>{`
      @keyframes loaderSlide {
        0%   { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `}</style>
  </div>
);

export default Loader;
