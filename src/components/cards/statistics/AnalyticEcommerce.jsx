import PropTypes from "prop-types";

// material-ui
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

// project import
import MainCard from "components/MainCard";

// assets
import {
  RiseOutlined,
  FallOutlined,
  HistoryOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Avatar } from "@mui/material";

const iconSX = {
  fontSize: "0.75rem",
  color: "inherit",
  marginLeft: 0,
  marginRight: 0,
};

export default function AnalyticEcommerce({
  color = "primary",
  title,
  count,
  percentage,
  isLoss,
  extra,
  graphic,
  iconRender,
  icon,
}) {
  let colorValue = "primary.main";
  let bgcolorValue = "primary.lighter";
  let lightColorValue = "#5f9aed";

  if (title === "Success") {
    colorValue = "success.main";
    bgcolorValue = "success.lighter";
    lightColorValue = "#73dc41";
  } else if (title === "Failed") {
    colorValue = "error.main";
    bgcolorValue = "error.lighter";
    lightColorValue = "#f06d6e";
  } else if (title === "In Progress") {
    colorValue = "warning.main";
    bgcolorValue = "warning.lighter";
    lightColorValue = "#f3bf56";
  }
  // else if(title = "Organization Count")
  // {
  //   colorValue='white';
  //   bgcolorValue='white';
  //   lightColorValue = 'none ';
  // }

  const getIcon = (file) => {
    if (title === "Success") {
      return <RiseOutlined />;
    } else if (title === "Failed") {
      return <FallOutlined />;
    } else if (title === "In Progress") {
      return <HistoryOutlined />;
    } else {
      return <FileTextOutlined />;
    }
  };

  return (
    <MainCard
      contentSX={{ p: 2.25 }}
      style={{ boxShadow: "6px 12px 20px #e4e4e4", position: "relative" }}
    >
      <Stack spacing={0.5}>
        <Typography variant="h6" color="text.secondary">
          {title}
        </Typography>
        <Grid container alignItems="center">
          <Grid item>
            {iconRender ? (
              <img src={icon} width="60px" />
            ) : (
              <Avatar sx={{ color: colorValue, bgcolor: bgcolorValue }}>
                {getIcon(title)}
              </Avatar>
            )}
          </Grid>
          <Grid item sx={{ margin: "0px 10px" }}>
            <Typography
              variant="h4"
              color="inherit"
              sx={{ color: iconRender ? "black" :`${color || "primary"}.main`, fontSize: iconRender ? "30px" : "20px", paddingLeft:"20px" }}
            >
              {count}
            </Typography>
          </Grid>
          {percentage && (
            <Grid item>
              <Chip
                variant="combined"
                color={color}
                icon={
                  isLoss ? (
                    <FallOutlined style={iconSX} />
                  ) : (
                    <RiseOutlined style={iconSX} />
                  )
                }
                label={`${percentage}%`}
                sx={{ ml: 1.25, pl: 1 }}
                size="small"
              />
            </Grid>
          )}
        </Grid>
      </Stack>
      {/* Circle elements placed on the top right */}
      {graphic && (
        <Box
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              backgroundColor: lightColorValue, // Match color with Avatar color
              marginBottom: "-16px", // Adjust to overlap
              marginTop: "-50px",
            }}
          />
          <Box
            sx={{
              width: "134px",
              height: "117px",
              borderRadius: "50%",
              backgroundColor: bgcolorValue,
              border: "1px solid" + lightColorValue,
              marginTop: "-84px",
              marginRight: "-70px",
            }}
          />
        </Box>
      )}

      {/* Optional caption */}
      {/* <Box sx={{ pt: 2.25 }}>
        <Typography variant="caption" color="text.secondary">
          You made an extra{' '}
          <Typography variant="caption" sx={{ color: `${color || 'primary'}.main` }}>
            {extra}
          </Typography>{' '}
          this year
        </Typography>
      </Box> */}
    </MainCard>
  );
}

AnalyticEcommerce.propTypes = {
  color: PropTypes.string,
  title: PropTypes.string,
  count: PropTypes.string,
  percentage: PropTypes.number,
  isLoss: PropTypes.bool,
  extra: PropTypes.string,
};
