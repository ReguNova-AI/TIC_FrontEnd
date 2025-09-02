/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  Avatar,
  Button,
  ConfigProvider,
  Empty,
  Modal,
  Popconfirm,
  Space,
  Spin,
  Table,
} from "antd";
import { useEffect, useState } from "react";
import {
  API_ERROR_MESSAGE,
  API_SUCCESS_MESSAGE,
  FORM_LABEL,
  GENERIC_DATA_LABEL,
  HEADING,
  LISTING_PAGE,
} from "shared/constants";
import userListingIcon from "../../assets/images/icons/userListingicon2.svg";
import disableUser from "../../assets/images/icons/disableUser.svg";
import enableUser from "../../assets/images/icons/enableUser.svg";

import {
  Alert,
  Box,
  FormControl,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Snackbar,
  Tab,
  Tabs,
  Tooltip,
} from "@mui/material";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  FolderAddOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import PropTypes from "prop-types";
import ProjectSelectionModal from "components/modal/ProjectSelectionModal";
import { createData } from "./UserListing";
import UserCreation from "./UserCreation";

// ✅ Import hooks
import {
  useExternalUsers,
  useToggleUserAccess,
  useAssignProjects,
} from "components/hooks/useExternalUsers";
import { UserApiService } from "services/api/UserAPIService";

const ExternalUsers = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState("");
  const [modalData, setModalData] = useState({});
  const [isProjectModalVisible, setIsProjectModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState({
    user_id: null,
    org_id: null,
  });

  const [searchText, setSearchText] = useState("");
  const [tabsValue, setTabsValue] = useState(0);

  const [filteredActiveData, setFilteredActiveData] = useState([]);
  const [filteredInActiveData, setFilteredInActiveData] = useState([]);
  // const [currentPageForActive, setCurrentPageForActive] = useState(1);
  // const [currentPageForInactive, setCurrentPageForInactive] = useState(1);
  // const [pageSizeForActive, setPageSizeForActive] = useState(10);
  // const [pageSizeForInactive, setPageSizeForInactive] = useState(10);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const [inactiveUsersCount, setInactiveUsersCount] = useState(0);

  const [selectedUserprojects, setSelectedUserprojects] = useState([]);
  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });

  const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));
  const debouncedSearchText = useDebounce(searchText, 500);

  // ✅ React Query hooks
  const {
    data: usersData,
    isLoading,
    isError,
    error,
  } = useExternalUsers(currentPage, pageSize);

  const toggleUserAccess = useToggleUserAccess();
  const assignProjects = useAssignProjects();

  // transform + filter users when data or search changes
  useEffect(() => {
    if (!usersData) return;

    const activeUsersData =
      usersData?.activeUsers?.map((user, index) =>
        createData(
          user.user_id,
          user.user_first_name,
          user.user_last_name,
          user.user_email,
          user.user_phone_no,
          user.sector_name,
          user.industry_name,
          user.org_name,
          user.user_profile,
          user.is_active,
          user.user_address,
          user.sector_id,
          user.org_id,
          user.industry_id,
          user.role_id,
          user.role_name,
          user.industry_names
        )
      ) || [];

    const inactiveUsersData =
      usersData?.inactiveUsers?.map((user, index) =>
        createData(
          user.user_id,
          user.user_first_name,
          user.user_last_name,
          user.user_email,
          user.user_phone_no,
          user.sector_name,
          user.industry_name,
          user.org_name,
          user.user_profile,
          user.is_active,
          user.user_address,
          user.sector_id,
          user.org_id,
          user.industry_id,
          user.role_id,
          user.role_name,
          user.industry_names
        )
      ) || [];

    const filterData = (data) =>
      data.filter(
        (item) =>
          item.first_name?.toLowerCase().includes(debouncedSearchText) ||
          item.email?.toLowerCase().includes(debouncedSearchText)
      );

    setFilteredActiveData(filterData(activeUsersData));
    setFilteredInActiveData(filterData(inactiveUsersData));
    setActiveUsersCount(
      usersData?.totalActiveUsers?.[0]?.total_active_external_users || 0
    );
    setInactiveUsersCount(
      usersData?.totalInactiveUsers?.[0]?.total_inactive_external_users || 0
    );
  }, [usersData, debouncedSearchText]);

  // handle enable/disable user
  const handleDisableUser = (userId, isActive) => {
    toggleUserAccess.mutate(
      { userId, isActive: !isActive },
      {
        onSuccess: (response) => {
          setSnackData({
            show: true,
            message:
              response?.message ||
              (isActive
                ? API_SUCCESS_MESSAGE.USER_DISABLED
                : API_SUCCESS_MESSAGE.USER_ENABLED),
            type: "success",
          });
        },
        onError: (err) => {
          setSnackData({
            show: true,
            message:
              err?.error?.message || API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
            type: "error",
          });
        },
      }
    );
  };

  const handleSubmitProjects = (payload) => {
    const reqData = {
      ...payload,
      user_id: selectedUser.user_id || 0,
      org_id: selectedUser.org_id || 0,
    };

    assignProjects.mutate(reqData, {
      onSuccess: (response) => {
        setSnackData({
          show: true,
          message:
            response?.message || API_SUCCESS_MESSAGE.UPDATED_SUCCESSFULLY,
          type: "success",
        });
      },
      onError: (err) => {
        setSnackData({
          show: true,
          message:
            err?.error?.message || API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
          type: "error",
        });
      },
    });
  };

  const handleModalOpen = (type, data) => {
    setModalData(data);
    setModalType(type);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const handleClose = () => {
    setIsModalVisible(false);
  };

  const handleUserSearch = (value) => {
    setSearchText(value.toLowerCase());
  };

  const handleTabChange = (event, newValue) => {
    setTabsValue(newValue);
  };

  const tabHeaders = (index) => {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  };

  const CustomTabPanel = (props) => {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  };

  CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  };

  const handleAssignProjectModal = (record) => {
    fetchUserProjects(record?.index, record?.org_id);
    setSelectedUser({
      user_id: record.index,
      org_id: record.org_id,
    });
    setIsProjectModalVisible(true);
  };

  const fetchUserProjects = async (userId = 0, orgId = 0) => {
    await UserApiService.getExternalUserPeojects(userId, orgId)
      .then((response) => {
        if (response?.data?.length > 0) {
          setSelectedUserprojects(response?.data);
        }
        setSnackData({
          show: true,
          message:
            response?.message || API_SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY,
          type: "success",
        });
      })
      .catch((errResponse) => {
        setSnackData({
          show: true,
          message:
            errResponse?.error?.message ||
            API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
          type: "error",
        });
      });
  };

  // Table columns
  const columns = [
    {
      title: LISTING_PAGE.NAME,
      dataIndex: "first_name",
      key: "first_name",
      render: (text, record) => {
        let avatarSrc = record.profile_url || "";
        return (
          <>
            {avatarSrc && avatarSrc !== "null" ? (
              <Avatar
                key={record.user_id}
                sx={{ width: 40, height: 40 }}
                alt={record.user_first_name}
              >
                <img
                  src={avatarSrc}
                  alt={record.user_first_name}
                  style={{ borderRadius: "50%" }}
                />
              </Avatar>
            ) : (
              <img
                src={userListingIcon}
                alt="User"
                width="32px"
                style={{ verticalAlign: "middle" }}
              />
            )}
            <a
              alt="User"
              style={{
                color: "#2ba9bc",
                cursor: "pointer",
                marginLeft: "10px",
              }}
            >
              {text}
            </a>
          </>
        );
      },
    },
    {
      title: LISTING_PAGE.EMAIL,
      dataIndex: "email",
      key: "email",
    },
    {
      title: LISTING_PAGE.PHONE_NO,
      dataIndex: "phone_no",
      key: "phone_no",
    },
    {
      title: LISTING_PAGE.ORG_NAME,
      dataIndex: "org_name",
      key: "org_name",
    },
    {
      title: LISTING_PAGE.INDUSTRY,
      key: "industry_names",
      render: (record) => {
        let industry_namearray = Array.isArray(record.industry_names)
          ? record.industry_names
          : [record.industry_names];
        return industry_namearray?.map((name, index) =>
          index === 0 ? name : ", " + name
        );
      },
    },
    {
      title: LISTING_PAGE.ACTION,
      key: "action",
      render: (record) => {
        if (userdetails?.[0]?.user_email !== record.email) {
          return (
            <>
              <Tooltip title="Edit user details">
                <Button
                  style={{
                    border: "none",
                    background: "transparent",
                    boxShadow: "none",
                  }}
                  onClick={() => handleModalOpen("update", record)}
                >
                  <EditOutlined style={{ fontSize: "20px" }} />
                </Button>
              </Tooltip>
              <Popconfirm
                title={
                  record.isActive
                    ? `Disable access for ${record.first_name}`
                    : `Enable access for ${record.first_name}`
                }
                description={
                  record.isActive
                    ? "Are you sure you want to disable the user's access?"
                    : "Are you sure you want to enable the user's access?"
                }
                onConfirm={(e) => {
                  e.preventDefault();
                  handleDisableUser(record?.index, record?.isActive);
                }}
                okText="Confirm"
                cancelText="Cancel"
                icon={
                  record.isActive ? (
                    <CloseCircleOutlined style={{ color: "red" }} />
                  ) : (
                    <CheckCircleOutlined style={{ color: "green" }} />
                  )
                }
              >
                <Tooltip
                  title={
                    record.isActive
                      ? "Disable User Access"
                      : "Enable User Access"
                  }
                >
                  <img
                    src={record.isActive ? disableUser : enableUser}
                    width="26px"
                    alt=""
                  ></img>
                </Tooltip>
              </Popconfirm>
              <Tooltip title="Add multiple projects">
                <Button
                  style={{
                    border: "none",
                    background: "transparent",
                    boxShadow: "none",
                  }}
                  onClick={() => handleAssignProjectModal(record)}
                >
                  <FolderAddOutlined style={{ fontSize: "20px" }} />
                </Button>
              </Tooltip>
            </>
          );
        }
      },
    },
  ];

  // Pagination logic
  // const paginatedData = filteredActiveData.slice(
  //   (currentPageForActive - 1) * pageSizeForActive,
  //   currentPageForActive * pageSizeForActive
  // );

  // const paginatedDataforInactive = filteredInActiveData.slice(
  //   (currentPageForInactive - 1) * pageSizeForInactive,
  //   currentPageForInactive * pageSizeForInactive
  // );

  // const handlePaginationChange = (page, pageSize) => {
  //   setCurrentPageForActive(page);
  //   setPageSizeForActive(pageSize);
  // };

  const handlePaginationChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  // if (isLoading) {
  //   return <Spin tip="Loading" size="large" spinning />;
  // }

  if (isError) {
    return (
      <Alert
        severity="error"
        message={error?.message || API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR}
      />
    );
  }

  try {
    return (
      <Spin tip="Loading" size="large" spinning={isLoading}>
        <ConfigProvider
          renderEmpty={() => <Empty description={GENERIC_DATA_LABEL.NO_DATA} />}
        >
          <Space
            direction="vertical"
            style={{
              width: "100%",
              background: "#ffffff",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "6px 12px 20px #e4e4e4",
            }}
          >
            <>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Space
                  style={{
                    width: "100%",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Tabs
                    value={tabsValue}
                    onChange={handleTabChange}
                    aria-label="basic tabs example"
                  >
                    <Tab label="Active Users" {...tabHeaders(0)} />
                    <Tab label="Inactive Users" {...tabHeaders(1)} />
                  </Tabs>
                  <Space>
                    <FormControl fullWidth>
                      <InputLabel htmlFor="outlined-adornment-search">
                        {FORM_LABEL.SEARCH}
                      </InputLabel>
                      <OutlinedInput
                        id="outlined-adornment-search"
                        startAdornment={
                          <InputAdornment position="start">
                            <SearchOutlined />
                          </InputAdornment>
                        }
                        label={FORM_LABEL.SEARCH}
                        onChange={(e) => handleUserSearch(e.target.value)}
                      />
                    </FormControl>
                  </Space>
                </Space>
              </Box>
              <CustomTabPanel value={tabsValue} index={0}>
                <Table
                  columns={columns}
                  // dataSource={paginatedData}
                  dataSource={filteredActiveData}
                  rowKey="index"
                  pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: activeUsersCount,
                    onChange: handlePaginationChange,
                  }}
                />
              </CustomTabPanel>
              <CustomTabPanel value={tabsValue} index={1}>
                <Table
                  columns={columns}
                  // dataSource={paginatedDataforInactive}
                  dataSource={filteredInActiveData}
                  rowKey="index"
                  pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: inactiveUsersCount,
                    onChange: handlePaginationChange,
                  }}
                />
              </CustomTabPanel>
            </>
          </Space>

          <ProjectSelectionModal
            visible={isProjectModalVisible}
            onClose={(event, reason) => {
              if (reason !== "backdropClick") {
                setIsProjectModalVisible(false);
              }
            }}
            allProjects={selectedUserprojects}
            onSubmit={handleSubmitProjects}
          />

          <Modal
            title={HEADING.CREATE_USER}
            visible={isModalVisible}
            onCancel={handleModalClose}
            footer={null}
            width={800}
          >
            <UserCreation
              onHandleClose={(e) => handleClose()}
              type={modalType}
              selecteddata={modalData}
            />
          </Modal>

          <Snackbar
            style={{ top: "80px" }}
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
        </ConfigProvider>
      </Spin>
    );
  } catch (error) {
    console.error("Error in ExternalUsers", error);
  }
};

// Debounce Hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default ExternalUsers;
