import React from "react";
import MuiTypography from "@mui/material/Typography";

// Replaced: styled-components
// All variants share the same base font styles via sx prop.
// Type1–Type5 map directly to the original font-size/weight/line-height values.

const baseStyle = {
  padding: 0,
  margin: 0,
  fontFamily: "'Open Sans', sans-serif",
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
};

export const Type1 = ({ children, style, className }) => (
  <MuiTypography component="p" className={className}
    sx={{ ...baseStyle, fontSize: "20px", lineHeight: "24px", fontWeight: 700, ...style }}>
    {children}
  </MuiTypography>
);

export const Type2 = ({ children, style, className }) => (
  <MuiTypography component="p" className={className}
    sx={{ ...baseStyle, fontSize: "16px", lineHeight: "24px", fontWeight: 600, ...style }}>
    {children}
  </MuiTypography>
);

export const Type3 = ({ children, style, className }) => (
  <MuiTypography component="p" className={className}
    sx={{ ...baseStyle, fontSize: "14px", lineHeight: "24px", fontWeight: 500, ...style }}>
    {children}
  </MuiTypography>
);

export const Type4 = ({ children, style, className }) => (
  <MuiTypography component="p" className={className}
    sx={{ ...baseStyle, fontSize: "13px", lineHeight: "16px", fontWeight: 600, ...style }}>
    {children}
  </MuiTypography>
);

export const Type5 = ({ children, style, className }) => (
  <MuiTypography component="p" className={className}
    sx={{ ...baseStyle, fontSize: "12px", lineHeight: "16px", fontWeight: 600, marginBottom: "revert !important", ...style }}>
    {children}
  </MuiTypography>
);