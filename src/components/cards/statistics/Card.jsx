import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";
import { Type4, Type5 } from "./Typography";
import Loader from "./Loader";
import content from "./content";

// ─── Replaced: styled-components + polished ───────────────────────────────────
// styled-components (28KB) and polished (19KB) were the only reason these
// packages loaded on the dashboard. polished was only used in COMMENTED OUT
// box-shadow code — it had zero runtime effect. Both are now gone.
// All styles are inline sx props or style attributes, matching the original
// visual output exactly.
// ─────────────────────────────────────────────────────────────────────────────

// Shared transition string used across card variants
const makeTransition = (easeSpeed, easeFunction) => [
  `height ${easeSpeed}s ${easeFunction}`,
  `transform ${2 * easeSpeed}s ${easeFunction} 0.1s`,
  `opacity ${2 * easeSpeed}s ${easeFunction} 0.1s`,
].join(", ");

const Card = ({
  wide = false,
  title,
  logo,
  counter,
  favorited = false,
  cardColor = "#f1f5fb",
  borderColor = "#f1f5fb",
  iconColor = "#b8bbc2",
  shadowColor = iconColor,
  easeSpeed = 0.5,
  easeFunction = "linear",
  simpleCard,
  addPipe = false,
  children,
}) => {
  const [loading, setToLoading] = useState(false);
  const [cardVisibility, updateCardVisibility] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    updateCardVisibility(true);
  }, []);

  const handleClick = (title) => {
    setToLoading(true);
    navigate("/projects", { state: { filterStatusValue: title } });
  };

  // Base card styles — maps 1:1 to the original StyledSimpleCard
  const baseCardSx = {
    position: "relative",
    backgroundColor: cardColor,
    height: "192px",
    cursor: "pointer",
    color: "#001738",
    border: `1px solid ${iconColor}`,
    borderRadius: "16px",
    textAlign: "center",
    opacity: cardVisibility ? 1 : 0,
    transform: cardVisibility ? "translateY(0)" : "translateY(8px)",
    transition: makeTransition(easeSpeed, easeFunction),
    // Pseudo-element ::before is handled via a real child div (see PseudoBefore)
    "& path": {
      transition: `fill ${easeSpeed}s ${easeFunction}`,
    },
    "&:hover": {
      "& .card__logo-wrapper path": { fill: iconColor },
    },
  };

  // The ::before overlay — replicated as a real positioned div
  const PseudoBefore = (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        borderRadius: "12px",
        transition: `all ${easeSpeed}s ${easeFunction}`,
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );

  const logoWrapperSx = {
    position: "relative",
    top: 0,
    margin: "24px auto 16px",
    width: "56px",
    height: "56px",
    display: "block",
    "& .card__logo": {
      position: "absolute",
      width: "100%",
      height: "100%",
      top: 0,
      left: 0,
      backgroundColor: "transparent",
      transition: `background-color ${easeSpeed}s ${easeFunction}`,
    },
    "& svg": { position: "relative", width: "56px", height: "56px", margin: "auto" },
    "& path": {
      transition: `fill ${easeSpeed}s ${easeFunction}`,
      fill: iconColor,
    },
  };

  const counterSx = {
    position: "absolute",
    transition: `color ${easeSpeed}s ${easeFunction}`,
    color: iconColor,
    bottom: "12px",
    width: "100%",
    margin: 0,
    display: "block",
  };

  // ── simpleCard variant ──────────────────────────────────────────────────────
  if (simpleCard) {
    return (
      <Box sx={baseCardSx}>
        {PseudoBefore}
        <Box
          sx={{
            position: "absolute",
            boxSizing: "border-box",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            transition: `transform ${easeSpeed}s ${easeFunction}`,
          }}
        >
          <Box className="card__logo-wrapper" sx={logoWrapperSx}>
            <span className="card__logo">{logo}</span>
            {loading && <Loader className="card__loader" size="56px" color={iconColor} />}
          </Box>
          <Type4 style={{ fontSize: "17px", margin: "0 auto" }}>{title}</Type4>
        </Box>
      </Box>
    );
  }

  // ── wide variant ────────────────────────────────────────────────────────────
  if (wide) {
    return (
      <Box
        sx={{
          ...baseCardSx,
          height: "88px",
          gridColumn: "auto / span 2",
          padding: "16px",
          boxSizing: "border-box",
          backgroundColor: content.colors.gray["100"],
          border: `1px solid ${content.colors.gray["200"]}`,
          "&:hover::before": { borderColor, boxShadow: "none" },
        }}
        onClick={() => handleClick(title)}
      >
        {PseudoBefore}
        <Box
          sx={{
            position: "relative",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            flexWrap: "nowrap",
            padding: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <Box
            className="card__logo-wrapper"
            sx={{ ...logoWrapperSx, margin: "0 10px 0 0" }}
          >
            <span className="card__logo">{logo}</span>
            {loading && <Loader size="56px" color={iconColor} />}
          </Box>
          <Box sx={{ position: "relative", width: "calc(100% - 66px - 32px)", height: "32px", textAlign: "left", margin: 0 }}>
            <Type4>{title}</Type4>
            <Type5 style={{ color: content.colors.default.subtitle }}>{counter || 0}</Type5>
          </Box>
        </Box>
      </Box>
    );
  }

  // ── default card variant ────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        ...baseCardSx,
        "&:hover": {
          color: "#fff",
          border: `1px solid ${iconColor}`,
          backgroundColor: iconColor,
          "& path": { fill: "#fff" },
          "& .card__logo-wrapper span div": { background: "#fff" },
          "& .card__logo path": { fill: "#fff" },
          "& .card__counter": { color: "#fff" },
        },
      }}
      onClick={() => handleClick(title)}
    >
      {PseudoBefore}
      <Box
        sx={{
          position: "absolute",
          boxSizing: "border-box",
          width: "100%",
          height: "100%",
          padding: "0 0 32px",
          margin: 0,
          transition: `transform ${easeSpeed}s ${easeFunction}`,
        }}
      >
        <Box component="p" sx={counterSx} className="card__counter">
          {counter || 0}
        </Box>
        <Box className="card__logo-wrapper" sx={logoWrapperSx}>
          <span className="card__logo">{logo}</span>
          {loading && <Loader size="56px" color={iconColor} />}
        </Box>
        <Type4 style={{ fontSize: "17px", margin: "0 auto" }}>{title}</Type4>
      </Box>
    </Box>
  );
};

export default Card;