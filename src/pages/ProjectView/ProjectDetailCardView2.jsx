import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Chip, Grid, Box, Divider, Button, Tooltip } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import avatar1 from "../../assets/images/users/avatar-1.png";
import avatar2 from "../../assets/images/users/avatar-2.png";
import avatar3 from "../../assets/images/users/avatar-3.png";
import { getStatusChipProps } from "shared/utility";

// Function to generate the status chip for each status

// Function to render the Avatar Group
const AvatarSection = ({ userData }) => (
  <AvatarGroup spacing="medium" style={{ float: "left" }}>
    {userData?.map((user) => {
      return (
        <Tooltip key={user?.user_id} title={user?.user_name} arrow>
          {user?.user_profile && user?.user_profile !== "null" ? (
            <img
              src={user?.user_profile}
              alt={user?.user_name}
              style={{
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                border: "1px solid grey",
              }}
            />
          ) : (
            <Avatar
              alt={user?.user_name}
              src={avatar1}
              sx={{ width: 40, height: 40 }}
            />
          )}
        </Tooltip>
      );
    })}
  </AvatarGroup>
);

const ProjectDetailsCardView = ({
  data,
  handleClick,
  isExternalProject = false,
}) => {
  const statusChip = (status) => {
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

  return (
    <Grid container>
      <Grid item xs={12} sm={12} md={12} key="#dfds">
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
              <Typography variant="h5">{data.project_name}</Typography>

              {/* Render Chips for each status, floated to the right */}
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {statusChip(data.status)}
              </div>
            </Box>

            {/* Project No and Industry in a row */}
            <Box sx={{ marginTop: "10px" }}>
              <Grid container spacing={2} alignItems="center">
                {/* Labels */}
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.primary">
                    <b>Project No:</b>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {data.project_no}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" color="text.primary">
                    <b>Regulatory Standards:</b>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {data.regulatory_standard}
                  </Typography>
                </Grid>

                {/* <Grid item xs={12}>
                  <Typography variant="body2" color="text.primary">
                    <b>Mapping Standards:</b>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {data.mapping_standards}
                  </Typography>
                </Grid> */}

                <Grid item xs={12}>
                  <Typography variant="body2" color="text.primary">
                    <b>Project Description:</b>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {data.project_description}
                  </Typography>
                </Grid>
              </Grid>
              <Button
                variant="contained"
                style={{ float: "right", margin: "10px  0px" }}
                onClick={(e) => handleClick("Edit")}
                disabled={isExternalProject}
              >
                Edit
              </Button>
            </Box>
          </CardContent>
        </Card>

        {!isExternalProject && (
          <Card
            sx={{ borderRadius: "10px", marginTop: "10px" }}
            style={{
              boxShadow: "0px 7px 15px #d7d5d5",
              border: "1px solid #ececec",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h5">Members Invited</Typography>
              </Box>

              <Box sx={{ marginTop: "10px" }}>
                <AvatarSection userData={data?.invite_members} />
                <Button
                  variant="contained"
                  onClick={(e) => handleClick("Invite")}
                  style={{ float: "right", margin: "10px  0px" }}
                >
                  Invite
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Grid>
    </Grid>
  );
};

export default ProjectDetailsCardView;
