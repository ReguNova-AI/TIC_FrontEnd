import PropTypes from "prop-types";

// material-ui
import { alpha, styled } from "@mui/material/styles";
import Box from "@mui/material/Box";

// ─── Native CSS scrollbar — replaces simplebar-react (42KB) + react-device-detect (66KB) ───

const ScrollBox = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  height: "100%",
  overflow: "auto",
  // Hide scrollbar on mobile (touch devices scroll natively without a visible bar)
  // Show a styled scrollbar on desktop
  "&::-webkit-scrollbar": {
    width: 6,
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    background: alpha(theme.palette.grey[500], 0.48),
    borderRadius: 3,
    "&:hover": {
      background: alpha(theme.palette.grey[500], 0.72),
    },
  },
  // Firefox
  scrollbarWidth: "thin",
  scrollbarColor: `${alpha(theme.palette.grey[500], 0.48)} transparent`,
}));

// ==============================|| SIMPLE SCROLL BAR ||============================== //

export default function SimpleBarScroll({ children, sx, ...other }) {
  return (
    <ScrollBox sx={sx} {...other}>
      {children}
    </ScrollBox>
  );
}

SimpleBarScroll.propTypes = {
  children: PropTypes.any,
  sx: PropTypes.any,
  other: PropTypes.any,
};
