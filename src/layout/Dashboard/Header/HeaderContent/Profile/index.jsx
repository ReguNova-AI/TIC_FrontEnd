import { useRef, useState } from "react";
import * as actionTypes from "../../../../../store/actions/actionTypes";
import { useDispatch } from "react-redux";
// material-ui
import { useTheme } from "@mui/material/styles";
import ButtonBase from "@mui/material/ButtonBase";
import CardContent from "@mui/material/CardContent";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Popper from "@mui/material/Popper";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

// project import
import ProfileTab from "./ProfileTab";
import SettingTab from "./SettingTab";
import Avatar from "components/@extended/Avatar";
import MainCard from "components/MainCard";
import Transitions from "components/@extended/Transitions";

// assets
import LogoutOutlined from "@ant-design/icons/LogoutOutlined";
import SettingOutlined from "@ant-design/icons/SettingOutlined";
import avatar1 from "assets/images/users/avatar-1.png";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { QuestionCircleOutlined, UserOutlined } from "@ant-design/icons";
import { AuthApiService } from "services/api/AuthApiService";
import { useNavigate } from "react-router";
import { API_SUCCESS_MESSAGE } from "shared/constants";
import userIcon from  "../../../../../assets/images/icons/users2.svg";
import informationIcon from  "../../../../../assets/images/icons/information.svg";
import logoutIcon from  "../../../../../assets/images/icons/logout.svg";




// ==============================|| HEADER CONTENT - PROFILE ||============================== //

export default function Profile() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });

  const handleListItemClick = (index, url) => {
    setSelectedIndex(index);
    if (url === "logout") {
      handleLogout();
    }
    if(url === "profileDetails")
    {
      navigate("/profileDetails");
    }
  };

  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const iconBackColorOpen = "grey.100";

  const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));
  const handleLogout = () => {
    let payload = {
      user_id: userdetails?.[0]?.user_id,
    };
    AuthApiService.logout(payload)
      .then((response) => {
        // On success, you can add any additional logic here

        setSnackData({
          show: true,
          message: API_SUCCESS_MESSAGE.LOGGED_OUT,
          type: "success",
        });

        sessionStorage.clear();
        localStorage.clear();
       
        navigate("/login");
      })
      .catch((errResponse) => {
        setSnackData({
          show: true,
          message: errResponse?.error?.message || "Internal server error",
          type: "error",
        });
      });
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <ButtonBase
        sx={{
          p: 0.25,
          bgcolor: open ? iconBackColorOpen : "transparent",
          borderRadius: 1,
          "&:hover": { bgcolor: "secondary.lighter" },
          "&:focus-visible": {
            outline: `2px solid ${theme.palette.secondary.dark}`,
            outlineOffset: 2,
          },
        }}
        aria-label="open profile"
        ref={anchorRef}
        aria-controls={open ? "profile-grow" : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <Stack
          direction="row"
          spacing={1.25}
          alignItems="center"
          sx={{ p: 0.5 }}
        >
          {userdetails?.[0]?.user_profile && userdetails?.[0]?.user_profile !== "null" ? (
            <img
              src={userdetails?.[0]?.user_profile}
              alt={value.user_first_name}
              style={{ borderRadius: "50%", width: "32px", height: "32px" }}
            />
          ) : (
            <Avatar alt="profile user" src={avatar1} size="sm" />
          )}

          <Typography variant="subtitle1" sx={{ textTransform: "capitalize" }}>
            {userdetails?.[0]?.user_first_name} {userdetails?.[0]?.user_last_name}
          </Typography>
        </Stack>
      </ButtonBase>
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: "offset",
              options: {
                offset: [0, 9],
              },
            },
          ],
        }}
      >
        {({ TransitionProps }) => (
          <Transitions
            type="grow"
            position="top-right"
            in={open}
            {...TransitionProps}
          >
            <Paper
              sx={{
                boxShadow: theme.customShadows.z1,
                width: 290,
                minWidth: 240,
                maxWidth: { xs: 250, md: 290 },
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard elevation={0} border={false} content={false}>
                  <CardContent sx={{ px: 2.5, pt: 3 }}>
                    <Grid
                      container
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Grid item style={{width:"80%"}}>
                        <Stack
                          direction="row"
                          spacing={1.25}
                          alignItems="center"
                        >
                          {userdetails?.[0]?.user_profile ? (
                            <img
                              src={userdetails?.[0]?.user_profile}
                              alt={value.user_first_name}
                              style={{
                                borderRadius: "50%",
                                width: "32px",
                                height: "32px",
                              }}
                            />
                          ) : (
                            <Avatar
                              alt="profile user"
                              src={avatar1}
                              sx={{ width: 32, height: 32 }}
                            />
                          )}
                          <Stack style={{width:"80%"}}>
                            <Typography variant="h6" style={{wordBreak:"break-word"}}>
                              {" "}
                              {userdetails?.[0]?.user_first_name}{" "}
                              {userdetails?.[0]?.user_last_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" style={{wordBreak:"break-word"}}>
                              {userdetails?.[0]?.user_email}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Grid>
                      <Grid item>
                        <Tooltip title="Logout">
                          <IconButton
                            size="large"
                            sx={{ color: "text.primary" }}
                            onClick={(event) =>
                              handleListItemClick(3, "logout")
                            }
                          >
                            {/* <LogoutOutlined /> */}
                            <img src={logoutIcon} width="20px"/>
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </CardContent>

                  <List
                    component="nav"
                    sx={{ p: 0, "& .MuiListItemIcon-root": { minWidth: 32 } }}
                  >
                    <ListItemButton
                      selected={selectedIndex === 1}
                      onClick={(event) =>
                        handleListItemClick(1, "profileDetails")
                      }
                    >
                      <ListItemIcon>
                        {/* <UserOutlined /> */}
                        <img src={userIcon} width="20px"/>
                      </ListItemIcon>
                      <ListItemText primary="View Profile" />
                    </ListItemButton>

                    <ListItemButton
                      selected={selectedIndex === 2}
                      onClick={(event) => handleListItemClick(2, "/apps")}
                    >
                      <ListItemIcon>
                        {/* <QuestionCircleOutlined /> */}
                        <img src={informationIcon} width="20px"/>
                      </ListItemIcon>
                      <ListItemText primary="Support" />
                    </ListItemButton>
                    <ListItemButton
                      selected={selectedIndex === 3}
                      onClick={(event) => handleListItemClick(3, "logout")}
                    >
                      <ListItemIcon>
                        {/* <LogoutOutlined /> */}
                        <img src={logoutIcon} width="20px"/>
                      </ListItemIcon>
                      <ListItemText primary="Logout" />
                    </ListItemButton>
                  </List>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
      <Snackbar
      style={{top:"80px"}}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={snackData.show}
        autoHideDuration={3000}
        onClose={() => setSnackData({ show: false })}
      >
        <Alert
          onClose={() => setSnackData({ show: false })}
          severity={snackData.type}
        >
          {snackData.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
