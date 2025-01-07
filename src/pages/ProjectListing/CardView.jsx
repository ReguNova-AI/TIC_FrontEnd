import * as React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Chip, Grid, Box } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import avatar1 from "../../assets/images/users/avatar-1.png";
import avatar2 from "../../assets/images/users/avatar-2.png";
import avatar3 from "../../assets/images/users/avatar-3.png";
import {
  EyeOutlined,
  PlayCircleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import {
  LISTING_PAGE,
  API_SUCCESS_MESSAGE,
  STATUS,
  BUTTON_LABEL,
  GENERIC_DATA_LABEL,
} from "shared/constants";
import { getStatusChipProps } from "shared/utility";
import { useLocation, useNavigate } from "react-router-dom";


// Function to generate the status chip for each status
const getStatusChip = (status) => {
  const { title, color, borderColor } = getStatusChipProps(status);
  return (
    <Chip
      key={status}
      label={title}
      color={borderColor}
      variant="outlined"
      sx={{
        bgcolor: color,
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: 600,
        margin: "1px", // Optional to add some spacing between chips
      }}
    />
  );
};

// Function to render the Avatar Group
const AvatarSection = () => (
  <AvatarGroup spacing="medium">
    <Avatar alt="Remy Sharp" src={avatar1} sx={{ width: 30, height: 30 }} />
    <Avatar alt="Travis Howard" src={avatar2} sx={{ width: 30, height: 30 }} />
    <Avatar alt="Cindy Baker" src={avatar3} sx={{ width: 30, height: 30 }} />
  </AvatarGroup>
);

const CardView = ({ data,gridValue }) => {
  const navigate = useNavigate();
  const handleNavigateToProject = (projectNo) => {
    navigate(`/projectView/${projectNo}`, { state: { projectNo } });
  };

  const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));
const userRole = userdetails?.[0]?.role_name;

  return (
    <Grid container spacing={3} style={{ marginTop: "20px" }}>
      {data.map((item) => {
        const statusArray = Array.isArray(item.status) ? item.status : [item.status];
       return (
        <Grid item xs={12} sm={6} md={gridValue ==2 ? 6 : 4} key={item.project_no}>
          <Card
            sx={{ borderRadius: "10px" }}
            style={{
              boxShadow: "0px 7px 15px #d7d5d5",
              border: "1px solid #ececec",
            }}
          >
            <CardContent>
              {/* Wrap project name and status in a Box */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h5">{item.project_name}</Typography>

                {/* Render Chips for each status, floated to the right */}
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                  {statusArray &&
                    Array.isArray(statusArray) &&
                    statusArray?.map((status) => getStatusChip(status))}
                </div>
              </Box>

              {/* Project No and Industry in a row */}
              <Box sx={{ marginTop: "10px" }}>
                <Grid container spacing={1}>
                  {/* Labels */}
                  <Grid item xs={3}>
                    <Typography variant="body2" color="text.primary">
                      <b>{LISTING_PAGE.PROJECT_No}:</b>
                    </Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography variant="body2" color="text.primary">
                      <b>{LISTING_PAGE.REGULATORY_SANTARDS}: </b>
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.primary">
                      <b>{LISTING_PAGE.INDUSTRY}:</b>
                    </Typography>
                  </Grid>

                  {/* Values */}
                  <Grid item xs={3}>
                    <Typography variant="body2" color="text.secondary">
                      {item.project_no}
                    </Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography variant="body2" color="text.secondary">
                      {item.regulatory_standard}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      {item.industry}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* No. of Runs and Date Section */}
              <Box sx={{ marginTop: "10px" }}>
                {/* Number of Runs */}
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <PlayCircleOutlined style={{ marginRight: "8px" }} />
                  <Typography variant="body2" color="text.primary">
                    {" "}
                    <b>{LISTING_PAGE.NO_OF_RUNS}:</b>{" "}
                    <span style={{ color: "grey" }}>{item.runs}</span>
                  </Typography>
                </Box>

                {/* Date */}
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <CalendarOutlined style={{ marginRight: "8px" }} />
                  <Typography variant="body2" color="text.primary">
                    <b>{LISTING_PAGE.LAST_RUN}:</b>{" "}
                    <span style={{ color: "grey" }}>{item.last_run}</span>
                  </Typography>
                </Box>
              </Box>
            </CardContent>

            <CardActions
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {/* Avatar Section on the Left */}
              <Box sx={{ display: "flex" }}>
                <AvatarSection />
              </Box>

              {/* Action Buttons on the Right */}
              <Box sx={{ display: "flex", gap: "8px" }}>
                <Button
                  size="small"
                  onClick={() => handleNavigateToProject(item.index)}
                  startIcon={<EyeOutlined />}
                  variant="outlined"
                >
                  {BUTTON_LABEL.VIEW}
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  style={{ background: "#003a8c" }}
                  onClick={() => handleNavigateToProject(item.index)}
                >
                  {BUTTON_LABEL.RUN_PROJECT}
                </Button>
              </Box>
            </CardActions>
          </Card>
        </Grid>
)})}
    </Grid>
  );
};

export default CardView;
