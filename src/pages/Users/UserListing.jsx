import React, { useEffect, useState } from "react";
import {
  Space,
  Table,
  ConfigProvider,
  Empty,
  Button,
  Spin,
  Modal,
  Avatar,
  Popconfirm,
} from "antd";
import { Tooltip } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import MultiSelectWithChip from "components/form/MultiSelectWithChip";
import {
  SearchOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  EditOutlined,
  FolderAddOutlined,
} from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UserApiService } from "services/api/UserAPIService";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import userListingIcon from "../../assets/images/icons/userListingicon2.svg";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import disableUser from "../../assets/images/icons/disableUser.svg";
import enableUser from "../../assets/images/icons/enableUser.svg";
import {
  API_ERROR_MESSAGE,
  LISTING_PAGE,
  API_SUCCESS_MESSAGE,
  BUTTON_LABEL,
  FORM_LABEL,
  HEADING,
  GENERIC_DATA_LABEL,
} from "shared/constants";
import UserCreation from "./UserCreation";
import addUserIcon from "../../assets/images/icons/addUser.svg";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export const createData = (
  index,
  first_name,
  last_name,
  email,
  phone_no,
  sector,
  industry,
  org_name,
  profile_url,
  isActive,
  user_address,
  sector_id,
  org_id,
  industry_id,
  role_id,
  role_name,
  industry_names
) => ({
  index,
  first_name,
  last_name,
  email,
  phone_no,
  sector,
  industry,
  org_name,
  profile_url,
  isActive,
  user_address,
  sector_id,
  org_id,
  industry_id,
  role_id,
  role_name,
  industry_names,
});

// ---- API fetcher
const fetchUserListing = async () => {
  const response = await UserApiService.userListing();
  return response?.data;
};

const UserListing = () => {
  const location = useLocation();
  const { filterStatusValue } = location.state || {};
  const queryClient = useQueryClient();

  // Pagination and filters
  const [statusFilter, setStatusFilter] = useState([]);
  const [industryFilter, setIndustryFilter] = useState([]);
  const [searchText, setSearchText] = useState("");
  const debouncedSearchText = useDebounce(searchText, 500);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [currentPageforInactive, setCurrentPageforInactive] = useState(1);
  const [pageSizeInactive, setPageSizeInactive] = useState(10);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState("");
  const [modalData, setModalData] = useState({});
  const [value, setValue] = useState(0);
  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });

  const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));

  // Fetch user list with react-query
  const {
    data: userData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["userListing"],
    queryFn: fetchUserListing,
    staleTime: 1000 * 60 * 5, // cache 5 min
    refetchOnWindowFocus: false,
    select: (data) => {
      // transform API response into mapped data directly
      const active =
        data?.activeUsers?.map((user) =>
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
      const inactive =
        data?.inactiveUsers?.map((user) =>
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
      const external =
        data?.externalUsers?.map((user) =>
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
      return { active, inactive, external };
    },
  });

  // Init status filter from navigation state
  useEffect(() => {
    if (filterStatusValue && filterStatusValue !== "Total Project") {
      setStatusFilter([filterStatusValue]);
    }
  }, [filterStatusValue]);

  // Filtering logic
  const filterData = (list) =>
    list.filter((item) => {
      const matchesStatus =
        statusFilter.length === 0 ||
        item?.status?.some((s) => statusFilter.includes(s));
      const matchesIndustry =
        industryFilter.length === 0 || industryFilter.includes(item.industry);
      const matchesSearch =
        item.first_name.toLowerCase().includes(debouncedSearchText) ||
        item.email.toString().includes(debouncedSearchText);
      return matchesStatus && matchesIndustry && matchesSearch;
    });

  const filteredActive = userData ? filterData(userData.active) : [];
  const filteredInactive = userData ? filterData(userData.inactive) : [];

  // Pagination
  const paginatedData = filteredActive.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const paginatedInactive = filteredInactive.slice(
    (currentPageforInactive - 1) * pageSizeInactive,
    currentPageforInactive * pageSizeInactive
  );

  // Handlers
  const handleSearch = (val) => setSearchText(val.toLowerCase());
  const handleModalOpen = (type, data) => {
    setModalType(type);
    setModalData(data);
    setIsModalVisible(true);
  };
  const handleModalClose = () => {
    setIsModalVisible(false);
    queryClient.invalidateQueries(["userListing"]); // refresh cache after modal actions
  };
  const handleDelete = async (id, active) => {
    try {
      const newActive = active ? 0 : 1;
      const response = await UserApiService.userAccess(id, newActive);
      setSnackData({
        show: true,
        message:
          response?.message ||
          (newActive
            ? API_SUCCESS_MESSAGE.USER_ENABLED
            : API_SUCCESS_MESSAGE.USER_DISABLED),
        type: "success",
      });
      queryClient.invalidateQueries(["userListing"]);
    } catch (err) {
      setSnackData({
        show: true,
        message:
          err?.response?.data?.message ||
          API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
        type: "error",
      });
    }
  };

  const columns = [
    {
      title: LISTING_PAGE.NAME,
      dataIndex: "first_name",
      key: "first_name",
      render: (text, record) => {
        const avatarSrc = record.profile_url || "";
        return (
          <>
            {avatarSrc && avatarSrc !== "null" ? (
              <Avatar sx={{ width: 40, height: 40 }} alt={record.first_name}>
                <img
                  src={avatarSrc}
                  alt={record.first_name}
                  style={{ borderRadius: "50%" }}
                />
              </Avatar>
            ) : (
              <img src={userListingIcon} alt="User" width="32px" />
            )}
            <a
              onClick={() => console.log("Navigate", record.index)}
              style={{ color: "#2ba9bc", cursor: "pointer", marginLeft: 10 }}
            >
              {text}
            </a>
          </>
        );
      },
    },
    { title: LISTING_PAGE.EMAIL, dataIndex: "email", key: "email" },
    { title: LISTING_PAGE.PHONE_NO, dataIndex: "phone_no", key: "phone_no" },
    { title: LISTING_PAGE.ORG_NAME, dataIndex: "org_name", key: "org_name" },
    {
      title: LISTING_PAGE.INDUSTRY,
      key: "industry_names",
      render: (record) =>
        (Array.isArray(record.industry_names)
          ? record.industry_names
          : [record.industry_names]
        ).join(", "),
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
                  onClick={() => handleModalOpen("update", record)}
                  style={{ border: "none", background: "transparent" }}
                >
                  <EditOutlined />
                </Button>
              </Tooltip>
              <Popconfirm
                title={
                  record.isActive
                    ? `Disable ${record.first_name}`
                    : `Enable ${record.first_name}`
                }
                onConfirm={() => handleDelete(record.index, record.isActive)}
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
                  title={record.isActive ? "Disable User" : "Enable User"}
                >
                  <img
                    src={record.isActive ? disableUser : enableUser}
                    width="26px"
                  />
                </Tooltip>
              </Popconfirm>
              {record.role_name === "External" && (
                <Tooltip title="Add multiple projects">
                  <Button
                    onClick={() => console.log("Add projects")}
                    style={{ border: "none", background: "transparent" }}
                  >
                    <FolderAddOutlined />
                  </Button>
                </Tooltip>
              )}
            </>
          );
        }
      },
    },
  ];

  return (
    <Spin spinning={isLoading}>
      <ConfigProvider
        renderEmpty={() => <Empty description={GENERIC_DATA_LABEL.NO_DATA} />}
      >
        <Space
          direction="vertical"
          style={{
            width: "100%",
            background: "#fff",
            padding: 20,
            borderRadius: 10,
            boxShadow: "6px 12px 20px #e4e4e4",
          }}
        >
          <Space style={{ justifyContent: "space-between", width: "100%" }}>
            <Button
              type="primary"
              onClick={() => handleModalOpen("new", null)}
              style={{ background: "#2ba9bc", borderRadius: 20 }}
            >
              <img src={addUserIcon} width="18px" alt="" />{" "}
              {BUTTON_LABEL.CREATE_USER}
            </Button>
            <FormControl>
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
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
          </Space>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={value} onChange={(_, v) => setValue(v)}>
              <Tab label="Active Users" {...a11yProps(0)} />
              <Tab label="Inactive Users" {...a11yProps(1)} />
            </Tabs>
          </Box>
          <CustomTabPanel value={value} index={0}>
            <Table
              columns={columns}
              dataSource={paginatedData}
              rowKey="index"
              pagination={{
                current: currentPage,
                pageSize,
                total: filteredActive.length,
                onChange: (p, ps) => {
                  setCurrentPage(p);
                  setPageSize(ps);
                },
              }}
            />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <Table
              columns={columns}
              dataSource={paginatedInactive}
              rowKey="index"
              pagination={{
                current: currentPageforInactive,
                pageSize: pageSizeInactive,
                total: filteredInactive.length,
                onChange: (p, ps) => {
                  setCurrentPageforInactive(p);
                  setPageSizeInactive(ps);
                },
              }}
            />
          </CustomTabPanel>
        </Space>
        <Modal
          title={HEADING.CREATE_USER}
          open={isModalVisible}
          onCancel={handleModalClose}
          footer={null}
          width={800}
        >
          <UserCreation
            onHandleClose={handleModalClose}
            type={modalType}
            selecteddata={modalData}
          />
        </Modal>
        <Snackbar
          open={snackData.show}
          autoHideDuration={3000}
          onClose={() => setSnackData({ show: false })}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
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
};

// Debounce hook
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

export default UserListing;
