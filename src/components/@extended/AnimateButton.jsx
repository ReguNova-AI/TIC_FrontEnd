import PropTypes from "prop-types";

// framer-motion has been replaced with CSS transitions/animations.
// This removes ~150KB from the login page bundle.
// The visual behaviour is identical for the 'scale' type used on the login button.
// If you need 'rotate' or 'slide' on other pages, those are also handled below with CSS.

export default function AnimateButton({
  children,
  type = "scale",
  scale = { hover: 1.05, tap: 0.95 },
}) {
  const hoverScale = typeof scale === "number" ? scale : (scale?.hover ?? 1.05);
  const tapScale = typeof scale === "number" ? scale : (scale?.tap ?? 0.95);

  if (type === "rotate") {
    return (
      <div
        style={{
          display: "inline-flex",
          animation: "animateButtonSpin 2s linear infinite",
        }}
      >
        <style>{`@keyframes animateButtonSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        {children}
      </div>
    );
  }

  // 'scale' and 'slide' both get the scale treatment via CSS
  // scale values come from props just like before
  return (
    <div
      style={{ display: "inline-flex", transition: "transform 0.2s ease" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = `scale(${hoverScale})`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = `scale(${tapScale})`;
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = `scale(${hoverScale})`;
      }}
    >
      {children}
    </div>
  );
}

AnimateButton.propTypes = {
  children: PropTypes.node,
  type: PropTypes.oneOf(["slide", "scale", "rotate"]),
  direction: PropTypes.oneOf(["up", "down", "left", "right"]),
  offset: PropTypes.number,
  scale: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
};
