import { useEffect, useRef, useState } from "react";

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

// assets
import BellOutlined from "@ant-design/icons/BellOutlined";
import bellicon from "../../../../assets/images/icons/notification.svg";
import CheckCircleOutlined from "@ant-design/icons/CheckCircleOutlined";
import GiftOutlined from "@ant-design/icons/GiftOutlined";
import MessageOutlined from "@ant-design/icons/MessageOutlined";
import SettingOutlined from "@ant-design/icons/SettingOutlined";
import { NotificationApiService } from "services/api/NotificationAPIService";
import {
  FileAddOutlined,
  ShareAltOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Empty,Modal } from "antd";

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

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  useEffect(() => {
    fetchNotification();
    const intervalId = setInterval(() => {
      fetchNotification();
    }, 120000); // 120000 ms = 2 minutes

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  
  },[]);

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
        setNotificationData(response?.data?.details?.slice(0,4));
        setAllNotification(response?.data?.details);
        let count = 0;
        response?.data?.details?.map((item) => {
          if (!item?.is_read) {
            arrayId.push(item?.notification_id);
            count = count + 1;
          }
        });
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
    const currentDate = new Date();
    const inputDate = new Date(date);

    // Array of month names
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

    // Extract Month and Day from the input date
    const month = monthNames[inputDate.getMonth()]; // Get month name
    const day = inputDate.getDate();

    return `${month} ${day}`; // Format as "Jan 7", "Feb 10", etc.
  };

  const getTimeDifference = (date) => {
    const currentDate = new Date();
    const inputDate = new Date(date);
  
    // Calculate the difference in milliseconds
    const timeDifference = currentDate - inputDate;
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60)) % 24;
    const minutesDifference = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const secondsDifference = Math.floor((timeDifference % (1000 * 60)) / 1000);
  
    // You can choose to show either days or exact time difference
    if (daysDifference > 0) {
      return `${daysDifference} day(s) ago`;
    } else if (hoursDifference > 0) {
      return `${hoursDifference} hour(s) ago`;
    } else {
      return `${minutesDifference} minute(s) and ${secondsDifference} second(s) ago`;
    }
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
                    style={{ height: notificationData?.length === 0 ? "160px" :"400px", overflowY: "scroll" }}
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
                    {notificationData?.length === 0 &&
                    <Empty description="No notification to show" />
                    }
                    {notificationData?.map((item) => {
                      return (
                        <>
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
                                  color: "success.main",
                                  bgcolor: "success.lighter",
                                }}
                              >
                                {item?.type === "USER_CREATION" ? (
                                  <UserAddOutlined />
                                ) : item?.type === "INVITE_USER" ? (
                                  <ShareAltOutlined />
                                ) : (
                                  <FileAddOutlined />
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
                          <Divider style={{borderColor:"#ffffff",border:"1.2px solid #ffffff"}}/>
                        </>
                      );
                    })}
                    {allNotification?.length > 4 && (
                      <ListItemButton
                        sx={{ textAlign: "center", py: `${12}px !important` }} onClick={(e)=>handleButtonClick(e)}
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
                ></MainCard>
          <List
                    component="nav"
                    style={{ height: allNotification?.length === 0 ? "160px" :"375px", overflowY: "scroll" }}
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
                    
                    {allNotification?.map((item) => {
                      return (
                        <>
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
                                  color: "success.main",
                                  bgcolor: "success.lighter",
                                }}
                              >
                                {item?.type === "USER_CREATION" ? (
                                  <UserAddOutlined />
                                ) : item?.type === "INVITE_USER" ? (
                                  <ShareAltOutlined />
                                ) : (
                                  <FileAddOutlined />
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
                          <Divider style={{borderColor:"#ffffff",border:"1.2px solid #ffffff"}}/>
                        </>
                      );
                    })}
                   
                  </List>
       
      </Modal>
    </Box>

    
  );
}
