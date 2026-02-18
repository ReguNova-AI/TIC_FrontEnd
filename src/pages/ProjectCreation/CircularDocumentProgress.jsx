import React from "react";
import { CircularProgress, Box, Typography } from "@mui/material";

const ProgressRing = ({ label, totalFiles, currentFiles }) => {
  const progress = totalFiles > 0 ? (currentFiles / totalFiles) * 100 : 0;

  // Pick color based on percentage
  const getColor = (value) => {
    if (value < 50) return "error"; // red
    if (value < 80) return "warning"; // orange
    return "success"; // green
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1, // space between label and circle
      }}
    >
      {/* Label */}
      <Typography variant="subtitle1" fontWeight="bold">
        {label}
      </Typography>
      <Box
        sx={{
          position: "relative",
          display: "inline-flex",
        }}
      >
        <CircularProgress
          variant="determinate"
          value={progress}
          color={getColor(progress)}
          size={100}
          thickness={5}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="caption"
            component="div"
            color="text.secondary"
            fontSize={18}
            fontWeight="bold"
          >
            {`${Math.round(progress)}%`}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ProgressRing;
