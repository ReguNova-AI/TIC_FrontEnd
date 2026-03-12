import React, { useCallback, useEffect, useRef, useState } from "react";

// material-ui
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
// project import
import MainCard from "components/MainCard";
import Transitions from "components/@extended/Transitions";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

// assets
import BellOutlined from "@ant-design/icons/BellOutlined";
import bellicon from "../../../../assets/images/icons/notification.svg";
import CheckCircleOutlined from "@ant-design/icons/CheckCircleOutlined";
import GiftOutlined from "@ant-design/icons/GiftOutlined";
import MessageOutlined from "@ant-design/icons/MessageOutlined";
import SettingOutlined from "@ant-design/icons/SettingOutlined";
import { NotificationApiService } from "services/api/NotificationAPIService";
import {
  ExclamationCircleOutlined,
  FileAddOutlined,
  FileDoneOutlined,
  ShareAltOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Empty, Modal } from "antd";

// sx styles
const avatarSX = {
  width: 36,
  height: 36,
  fontSize: "1rem",
};

const actionSX = {
  mt: "6px",
  ml: 1,
  top: "auto",
  right: "auto",
  alignSelf: "flex-start",

  transform: "none",
};

// ==============================|| HEADER CONTENT - NOTIFICATION ||============================== //

export default function Notification() {
  const theme = useTheme();
  const navigate = useNavigate();
  const matchesXs = useMediaQuery(theme.breakpoints.down("md"));

  const anchorRef = useRef(null);
  const [read, setRead] = useState(0);
  const [open, setOpen] = useState(false);
  const [notificationData, setNotificationData] = useState([]);
  const [allNotification, setAllNotification] = useState([]);
  const [arrayId, setArrayId] = useState([]);
  const [visible, setVisible] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("PROJECT");
  const [timeKey, setTimeKey] = useState(0); // Force re-render for time updates
  const [forceUpdate, setForceUpdate] = useState(0); // Additional force update mechanism
  const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));
  const roleName = userdetails?.[0]?.role_name;
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };


  useEffect(() => {
    fetchNotification();

    // Fetch notifications every 2 minutes
    const notificationIntervalId = setInterval(() => {
      fetchNotification();
    }, 120000); // 120000 ms = 2 minutes

    // Update time display every 30 seconds for accurate relative time
    const timeUpdateIntervalId = setInterval(() => {
      setTimeKey(prev => prev + 1);
      setForceUpdate(prev => prev + 1);
    }, 30000); // 30000 ms = 30 seconds

    // Cleanup intervals on component unmount
    return () => {
      clearInterval(notificationIntervalId);
      clearInterval(timeUpdateIntervalId);
    };
  }, []);

  const handleButtonClick = (e, tab) => {
    handleClose(e);
    setModalContent({});
    setVisible(true);
  };

  const handleModalClose = () => {
    setVisible(false);
    setModalContent({});
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const iconBackColorOpen = "grey.100";


  const fetchNotification = () => {
    NotificationApiService.notification()
      .then((response) => {
        const details = response?.data?.details || [];

        // show first 4 in popover
        setNotificationData(details.slice(0, 4));
        setAllNotification(details);

        // build unread ids locally (avoid mutating state directly)
        const ids = [];
        let count = 0;
        details.forEach((item) => {
          if (!item?.is_read) {
            ids.push(item?.notification_id);
            count += 1;
          }
        });

        setArrayId(ids);
        setRead(count);
      })
      .catch((errResponse) => {
        console.log(errResponse);
      });
  };



  const handleRead = (id, type, projectId) => {
    let payload = { notifications: type === "single" ? [id] : arrayId };

    NotificationApiService.notificationRead(payload)
      .then((response) => {
        fetchNotification();
        if (projectId) {
          handleModalClose();
          navigate(`/projectView/${projectId}`, {
            state: { project_id: projectId },
          });
        }
      })
      .catch((errResponse) => {
        console.log(errResponse);
      });
  };

  const getDate = (date) => {
    // Ensure date is treated as UTC
    let normalizedDate = date;
    if (typeof date === 'string' && !date.endsWith('Z') && !date.includes('+')) {
      normalizedDate = date.replace(' ', 'T') + 'Z';
    }
    const inputDate = new Date(normalizedDate);
    // Adjust for timezone offset
    inputDate.setTime(inputDate.getTime() - inputDate.getTimezoneOffset() * 60000);

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const month = monthNames[inputDate.getMonth()];
    const day = inputDate.getDate();

    return `${month} ${day}`;
  };

  const getTimeDifference = useCallback((date) => {
    // Parse the server date and keep it in UTC
    let normalizedDate = date;
    if (typeof date === 'string' && !date.endsWith('Z') && !date.includes('+')) {
      normalizedDate = date.replace(' ', 'T') + 'Z';
    }
    const inputDate = new Date(normalizedDate);
    // Adjust for timezone offset
    inputDate.setTime(inputDate.getTime() - inputDate.getTimezoneOffset() * 60000);

    const now = new Date();

    // Calculate difference using UTC times to avoid timezone conversion issues
    const timeDifference = now.getTime() - inputDate.getTime();
    // handle future dates
    if (timeDifference < 0) {
      return "Just now";
    }

    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const totalHoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));
    const minutesDifference = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const secondsDifference = Math.floor((timeDifference % (1000 * 60)) / 1000);

    let result;
    if (daysDifference > 0) {
      if (daysDifference === 1) result = "1 day ago";
      else if (daysDifference < 7) result = `${daysDifference} days ago`;
      else if (daysDifference < 30) {
        const weeks = Math.floor(daysDifference / 7);
        result = weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
      } else if (daysDifference < 365) {
        const months = Math.floor(daysDifference / 30);
        result = months === 1 ? "1 month ago" : `${months} months ago`;
      } else {
        const years = Math.floor(daysDifference / 365);
        result = years === 1 ? "1 year ago" : `${years} years ago`;
      }
    } else if (totalHoursDifference > 0) {
      if (totalHoursDifference === 1) result = "1 hour ago";
      else if (totalHoursDifference < 24) {
        if (minutesDifference > 0 && totalHoursDifference < 6) {
          result = `${totalHoursDifference}h ${minutesDifference}m ago`;
        } else {
          result = `${totalHoursDifference} hours ago`;
        }
      } else {
        result = `${totalHoursDifference} hours ago`;
      }
    } else if (minutesDifference > 0) {
      if (minutesDifference === 1) result = "1 minute ago";
      else if (minutesDifference < 60) {
        if (secondsDifference > 0 && minutesDifference < 5) {
          result = `${minutesDifference}m ${secondsDifference}s ago`;
        } else {
          result = `${minutesDifference} minutes ago`;
        }
      } else {
        result = `${minutesDifference} minutes ago`;
      }
    } else if (secondsDifference > 0) {
      if (secondsDifference < 10) result = "Just now";
      else result = `${secondsDifference} seconds ago`;
    } else {
      result = "Just now";
    }

    return result;
  }, [timeKey, forceUpdate]);
  const filteredNotifications = allNotification.filter((item) => {
    if (selectedCategory === "USER_CREATION") {
      return item?.type === "USER_CREATION";
    } else if (selectedCategory === "INVITE_USER") {
      return item?.type === "INVITE_USER";
    } else if (selectedCategory === "PROJECT") {
      return item?.project_id != null || ['success', 'error', 'info'].includes(item?.type);
    }
    return true;
  });

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setSelectedCategory(newValue);
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <IconButton
        color="secondary"
        variant="light"
        sx={{
          color: "text.primary",
          bgcolor: open ? iconBackColorOpen : "transparent",
        }}
        aria-label="open profile"
        ref={anchorRef}
        aria-controls={open ? "profile-grow" : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <Badge badgeContent={read} color="primary">
          {/* <BellOutlined /> */}
          <img src={bellicon} width="20px" />
        </Badge>
      </IconButton>
      <Popper
        placement={matchesXs ? "bottom" : "bottom-end"}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            { name: "offset", options: { offset: [matchesXs ? -5 : 0, 9] } },
          ],
        }}
      >
        {({ TransitionProps }) => (
          <Transitions
            type="grow"
            position={matchesXs ? "top" : "top-right"}
            in={open}
            {...TransitionProps}
          >
            <Paper
              sx={{
                boxShadow: theme.customShadows.z1,
                width: "100%",
                minWidth: 285,
                maxWidth: { xs: 285, md: 420 },
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard
                  title="Notification"
                  elevation={0}
                  border={false}
                  content={false}
                  secondary={
                    <>
                      {read > 0 && (
                        <Tooltip title="Mark as all read">
                          <IconButton
                            color="success"
                            size="small"
                            style={{ width: "110%" }}
                            onClick={() => handleRead("0", "all")}
                          >
                            <CheckCircleOutlined
                              style={{ fontSize: "1.15rem" }}
                            />
                            <span style={{ color: "black", width: "100%" }}>
                              Mark all as read
                            </span>
                          </IconButton>
                        </Tooltip>
                      )}
                    </>
                  }
                >
                  <List
                    component="nav"
                    style={{ height: notificationData?.length === 0 ? "160px" : "400px", overflowY: "scroll" }}
                    sx={{
                      p: 0,
                      "& .MuiListItemButton-root": {
                        py: 0.5,
                        "&.Mui-selected": {
                          bgcolor: "grey.50",
                          color: "text.primary",
                        },
                        "& .MuiAvatar-root": avatarSX,
                        "& .MuiListItemSecondaryAction-root": {
                          ...actionSX,
                          position: "relative",
                        },
                      },
                    }}
                  >
                    {notificationData?.length === 0 && (
                      <Empty description="No notification to show" />
                    )}
                    {notificationData?.map((item, index) => {
                      return (
                        <React.Fragment key={`${item?.notification_id}-${timeKey}-${forceUpdate}-${index}`}>
                          <ListItemButton
                            selected={!item?.is_read}
                            style={{
                              background: !item?.is_read ? "white" : "#f1f1f0",
                            }}
                            onClick={(e) =>
                              handleRead(
                                item?.notification_id,
                                "single",
                                item?.project_id
                              )
                            }
                          >
                            <ListItemAvatar>
                              <Avatar
                                sx={{
                                  color:
                                    item?.type === "INVITE_USER"
                                      ? "warning.main"
                                      : item?.type === "USER_CREATION"
                                        ? "primary.main"
                                        : item?.notification_message?.includes(
                                          "failed"
                                        )
                                          ? "error.main"
                                          : item?.notification_message?.includes(
                                            "created successfully"
                                          )
                                            ? "warning.main"
                                            : "success.main",
                                  bgcolor:
                                    item?.type === "INVITE_USER"
                                      ? "warning.lighter"
                                      : item?.type === "USER_CREATION"
                                        ? "primary.lighter"
                                        : item?.notification_message?.includes(
                                          "failed"
                                        )
                                          ? "error.lighter"
                                          : item?.notification_message?.includes(
                                            "created successfully"
                                          )
                                            ? "warning.lighter"
                                            : "success.lighter",
                                }}
                              >
                                {item?.type === "USER_CREATION" ? (
                                  <UserAddOutlined />
                                ) : item?.type === "INVITE_USER" ? (
                                  <ShareAltOutlined />
                                ) : item?.notification_message?.includes(
                                  "failed"
                                ) ? (
                                  <ExclamationCircleOutlined />
                                ) : item?.notification_message?.includes(
                                  "created successfully"
                                ) ? (
                                  <FileAddOutlined />
                                ) : (
                                  <FileDoneOutlined />
                                )}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="h6">
                                  {item?.notification_message}
                                </Typography>
                              }
                              secondary={getTimeDifference(item?.created_date)}
                            />
                            <ListItemSecondaryAction>
                              <Typography variant="caption" noWrap>
                                {getDate(item?.created_date)}
                              </Typography>
                            </ListItemSecondaryAction>
                          </ListItemButton>
                          <Divider
                            style={{
                              borderColor: "#ffffff",
                              border: "1.2px solid #ffffff",
                            }}
                          />
                        </React.Fragment>
                      );
                    })}
                    {allNotification?.length > 4 && (
                      <ListItemButton
                        sx={{ textAlign: "center", py: `${12}px !important` }}
                        onClick={(e) => handleButtonClick(e)}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="h6" color="primary">
                              View All
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    )}
                  </List>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
      <Modal
        title={""}
        visible={visible}
        onCancel={handleModalClose}
        footer={null}
        width={600}
      >
        <MainCard
          title="Notification"
          elevation={0}
          border={false}
          content={false}
          secondary={
            <>
              {read > 0 && (
                <Tooltip title="Mark as all read">
                  <IconButton
                    color="success"
                    size="small"
                    style={{ width: "110%" }}
                    onClick={() => handleRead("0", "all")}
                  >
                    <CheckCircleOutlined style={{ fontSize: "1.15rem" }} />
                    <span style={{ color: "black", width: "100%" }}>
                      Mark all as read
                    </span>
                  </IconButton>
                </Tooltip>
              )}
            </>
          }
        ></MainCard>
        <List
          component="nav"
          style={{
            height: allNotification?.length === 0 ? "160px" : "375px",
            overflowY: "scroll",
          }}
          sx={{
            p: 0,
            "& .MuiListItemButton-root": {
              py: 0.5,
              "&.Mui-selected": {
                bgcolor: "grey.50",
                color: "text.primary",
              },
              "& .MuiAvatar-root": avatarSX,
              "& .MuiListItemSecondaryAction-root": {
                ...actionSX,
                position: "relative",
              },
            },
          }}
        >
          <Tabs value={selectedCategory} onChange={handleTabChange} centered style={{ marginBottom: "10px" }}>
            <Tab label="Projects" value="PROJECT" />
            <Tab label="Project Invites" value="INVITE_USER" />
            {roleName === "Super Admin" || roleName === "Org Super Admin" || roleName === "Admin" ? <Tab label="User Creation" value="USER_CREATION" /> : ""}
          </Tabs>

          {/* Notification List */}
          {filteredNotifications.map((item, index) => (
            <React.Fragment key={`${item?.notification_id}-${timeKey}-${forceUpdate}-${index}`}>
              <ListItemButton
                selected={!item?.is_read}
                style={{
                  background: !item?.is_read ? "white" : "#f1f1f0",
                }}
                onClick={(e) =>
                  handleRead(item?.notification_id, "single", item?.project_id)
                }
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      color:
                        item?.type === "INVITE_USER"
                          ? "warning.main"
                          : item?.type === "USER_CREATION"
                            ? "primary.main"
                            : item?.notification_message?.includes("failed")
                              ? "error.main"
                              : item?.notification_message?.includes(
                                "created successfully"
                              )
                                ? "warning.main"
                                : "success.main",
                      bgcolor:
                        item?.type === "INVITE_USER"
                          ? "warning.lighter"
                          : item?.type === "USER_CREATION"
                            ? "primary.lighter"
                            : item?.notification_message?.includes("failed")
                              ? "error.lighter"
                              : item?.notification_message?.includes(
                                "created successfully"
                              )
                                ? "warning.lighter"
                                : "success.lighter",
                    }}
                  >
                    {item?.type === "USER_CREATION" ? (
                      <UserAddOutlined />
                    ) : item?.type === "INVITE_USER" ? (
                      <ShareAltOutlined />
                    ) : item?.notification_message?.includes("failed") ? (
                      <ExclamationCircleOutlined />
                    ) : item?.notification_message?.includes(
                      "created successfully"
                    ) ? (
                      <FileAddOutlined />
                    ) : (
                      <FileDoneOutlined />
                    )}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="h6">
                      {item?.notification_message}
                    </Typography>
                  }
                  secondary={getTimeDifference(item?.created_date)}
                />
                <ListItemSecondaryAction>
                  <Typography variant="caption" noWrap>
                    {getDate(item?.created_date)}
                  </Typography>
                </ListItemSecondaryAction>
              </ListItemButton>
              <Divider
                style={{
                  borderColor: "#ffffff",
                  border: "1.2px solid #ffffff",
                }}
              />
            </React.Fragment>
          ))}
        </List>
      </Modal>
    </Box>
  );
}
