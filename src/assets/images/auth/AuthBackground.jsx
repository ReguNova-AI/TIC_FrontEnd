// src/components/AuthBackground.js
import React from "react";
import Box from "@mui/material/Box";

// ==============================|| AUTH BACKGROUND (ONLY RIGHT HALF SHOWN ON LEFT) ||============================== //

export default function AuthBackground() {
  return (
    <Box
      sx={{
        position: "absolute",
        top: 70,
        left: 0,
        width: "60%", // only occupy left half of the screen
        height: "90%",
        zIndex: -1,
        overflow: "hidden",
      }}
    >
      {/* Background SVG */}
      {/* <Box
        component="img"
        src="/favicon.svg" // <-- put your svg in public/favicon.svg
        alt="background"
        sx={{
          width: "80%", // double width to allow cropping
          height: "100%",
          objectFit: "cover",
          filter: "blur(10px) brightness(1.1)", // before: "blur(18px)",
          opacity: 0.9,
          objectPosition: "right center", // keep right half
          transform: "translateX(-50%)", // shift so only right half is visible
        }}
      /> */}
      <Box
        sx={{
          // Applied background styles directly to the Box component to reduce LCP
          backgroundImage: "url('/favicon.svg')",
          backgroundSize: "cover",
          backgroundPosition: "right center",
          filter: "blur(10px) brightness(1.1)",
          opacity: 0.9,
          width: "80%",
          height: "100%",
          objectPosition: "right center",
          transform: "translateX(-50%)",
        }}
      />
    </Box>
  );
}
