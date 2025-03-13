import React, { useEffect, useState } from "react";
import {
  Space,
  Table,
  ConfigProvider,
  Empty,
  Input,
  Popover,
  Button,
  Spin,
  Modal,
  Form,
  Avatar,
  message,
  Popconfirm,
} from "antd";
import { Chip, Tooltip } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import MultiSelectWithChip from "components/form/MultiSelectWithChip"; // Assuming this is a custom component
import {
  SearchOutlined,
  DownloadOutlined,
  FileFilled,
  QuestionCircleOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { UserApiService } from "services/api/UserAPIService";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { UserOutlined } from "@ant-design/icons";
import addUserIcon from "../../assets/images/icons/addUser.svg";
import userListingIcon from "../../assets/images/icons/userListingicon2.svg";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import disableUser from "../../assets/images/icons/disableUser.svg";
import enableUser from "../../assets/images/icons/enableUser.svg";

// import CardView from "./CardView";
// import ToggleButtons from "./ToggleButton";
import {
  API_ERROR_MESSAGE,
  LISTING_PAGE,
  API_SUCCESS_MESSAGE,
  STATUS,
  BUTTON_LABEL,
  GENERIC_DATA_LABEL,
  FORM_LABEL,
  HEADING,
} from "shared/constants";
import { formatDate, getStatusChipProps } from "shared/utility";
import UserCreation from "./UserCreation";

function CustomTabPanel(props) {
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

const UserListing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { filterStatusValue } = location.state || {}; // Receive initial status filter
  const [data, setData] = useState([]);
  const [inactiveUserData, setInactiveUserData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [filteredDataforInactive, setFilteredDataforInactive] = useState([]);

  const [statusFilter, setStatusFilter] = useState([]);
  const [industryFilter, setIndustryFilter] = useState([]);
  const [popoverVisible, setPopoverVisible] = useState(false); // Control popover visibility
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'card'
  const [currentPage, setCurrentPage] = useState(1); // Track the current page
  const [currentPageforInactive, setCurrentPageforInactive] = useState(1); // Track the current page
  const [pageSize, setPageSize] = useState(10); // Number of rows per page
  const [pageSizeinactive, setPageSizeinactive] = useState(10); // Number of rows per page

  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false); // To control modal visibility
    const [modalType,setModalType] = useState("");
    const [modalData,setModalData] = useState({});
  const [form] = Form.useForm(); // For form handling

  const [value, setValue] = React.useState(0);

  const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));
  
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Use effect for initializing the status filter based on location state
  useEffect(() => {
    if (filterStatusValue && filterStatusValue != "Total Project") {
      setStatusFilter([filterStatusValue]); // Set the statusFilter if status is passed
    }
  }, [filterStatusValue]);

  const createData = (
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
            isActive
  ) => {
    return {
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
            isActive
    };
  };

  const fetchData = () => {
    UserApiService.userListing()
      .then((response) => {
        // On success, you can add any additional logic here
        setSnackData({
          show: true,
          message:
            response?.message || API_SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY,
          type: "success",
        });

        // console.log("response",response)
        const newData = response?.data?.activeUsers.map((user, index) => {
          return createData(
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
            user.isActive
          );
        });

        const inactiveUsersData = response?.data?.inactiveUsers.map(
          (user, index) => {
            return createData(
              user.user_id,
              user.user_first_name,
              user.user_last_name,
              user.user_email,
              user.user_phone_no,
              user.sector_name,
              user.industry_name,
              user.org_name,
              user.user_profile,
              user.is_active
            );
          }
        );
        setCurrentPage(1);
        setCurrentPageforInactive(1);
        setData(newData);
        setInactiveUserData(inactiveUsersData);
        setFilteredData(newData);
        setFilteredDataforInactive(inactiveUsersData);

        setLoading(false);
      })
      .catch((errResponse) => {
        setSnackData({
          show: true,
          message:
            errResponse?.error?.message ||
            API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
          type: "error",
        });
        setLoading(false);
      });
  };

  // Handle search with debounce
  const handleSearch = (value) => {
    const searchText = value.toLowerCase();
    setSearchText(searchText);
  };

  // Debounced search input (500ms delay)
  const debouncedSearchText = useDebounce(searchText, 500);

  // Centralized filtering logic
  const filterData = (type) => {
    if (type === "Active") {
      return data.filter((item) => {
        const matchesStatus =
          statusFilter.length === 0 ||
          item?.status.some((status) => statusFilter.includes(status));
        const matchesIndustry =
          industryFilter.length === 0 || industryFilter.includes(item.industry);
        const matchesSearchText =
          item.first_name.toLowerCase().includes(debouncedSearchText) ||
          item.email.toString().includes(debouncedSearchText);

        return matchesStatus && matchesIndustry && matchesSearchText;
      });
    } else {
      return inactiveUserData.filter((item) => {
        const matchesStatus =
          statusFilter.length === 0 ||
          item?.status.some((status) => statusFilter.includes(status));
        const matchesIndustry =
          industryFilter.length === 0 || industryFilter.includes(item.industry);
        const matchesSearchText =
          item.first_name.toLowerCase().includes(debouncedSearchText) ||
          item.email.toString().includes(debouncedSearchText);

        return matchesStatus && matchesIndustry && matchesSearchText;
      });
    }
  };

  // Effect for updating filtered data based on filters
  useEffect(() => {
    setFilteredData(filterData("Active"));
    setFilteredDataforInactive(filterData("Inactive"));
  }, [statusFilter, industryFilter, debouncedSearchText]);

  // Handle view mode switch
  const handleViewModeChange = (newViewMode) => {
    setViewMode(newViewMode); // Update view mode (list or card)
  };

  // Handle project navigation
  const handleNavigateToUsers = (userId) => {

    // navigate(`/projectView/${projectNo}`, { state: { projectNo } });
  };

  // Handle pagination change
  const handlePaginationChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const handlePaginationChangeforInactive = (page, pageSize) => {
    setCurrentPageforInactive(page);
    setPageSizeinactive(pageSize);
  };

  // Pagination logic
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const paginatedDataforInactive = filteredDataforInactive.slice(
    (currentPageforInactive - 1) * pageSizeinactive,
    currentPageforInactive * pageSizeinactive
  );

  const handleModalOpen = (type,data) => {
    setModalData(data);
    setModalType(type);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    fetchData();
  };
  const handleClose = () => {
    setIsModalVisible(false);
    fetchData();
  };
  const cancel = (e) => {
    console.log(e);
    // message.error('Click on No');
  };

  const handleDelete = (id, active) => {
    if (active) {
      active = 0;
    } else {
      active = 1;
    }

    UserApiService.userAccess(id, active)
      .then((response) => {
        // Check the response structure and map data accordingly
        setLoading(false);

        setSnackData({
          show: true,
          message:
            response?.message || active
              ? API_SUCCESS_MESSAGE.USER_ENABLED
              : API_SUCCESS_MESSAGE.USER_DISABLED,
          type: "success",
        });
        fetchData();
      })
      .catch((errResponse) => {
        setLoading(false);
        console.log("errResponse", errResponse.response?.data?.message);
        setSnackData({
          show: true,
          message:
            errResponse.response?.data?.message || API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
          type: "error",
        });
      });
  };

  // Filter popover content
  const filterPopoverContent = (
    <div>
      <MultiSelectWithChip
        label="Status"
        value={statusFilter}
        onChange={setStatusFilter}
      />
      <MultiSelectWithChip
        label="Industry"
        value={industryFilter}
        onChange={setIndustryFilter}
      />
      <Button type="primary" onClick={() => setPopoverVisible(false)}>
        Done
      </Button>
    </div>
  );

  // Table columns
  const columns = [
    // {
    //   title: "",
    //   key: "profile_url",
    //   render: (value, record) => {
    //     // Ensure that 'value' is a string before processing
    //     let avatarSrc = value.profile_url || "";

    //     return (
    //       <>
    //       {avatarSrc && avatarSrc !== "null" ?
    //       <Avatar
    //         key={value.user_id}
    //         sx={{ width: 40, height: 40 }}
    //         alt={value.user_first_name}
    //       >

    //           <img src={avatarSrc} alt={value.user_first_name} style={{borderRadius: '50%' }} />

    //       </Avatar>
    //       :
    //       <img  src={userListingIcon} width="20px" />
    //   }
    //   </>
    //     );
    //   },
    // },
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
                width="32px"
                style={{ verticalAlign: "middle" }}
              />
            )}
            <a
              onClick={() => handleNavigateToUsers(record.index)}
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
      filterSearch: true,
      onFilter: (value, record) =>
        record.first_name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: LISTING_PAGE.EMAIL,
      dataIndex: "email",
      key: "email",
      filterSearch: true,
      onFilter: (value, record) => record.email.toString().includes(value),
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
    // {
    //   title: LISTING_PAGE.SECTOR,
    //   dataIndex: "sector",
    //   key: "sector",
    // },
    {
      title: LISTING_PAGE.INDUSTRY,
      dataIndex: "industry",
      key: "industry",
    },

    {
      title: LISTING_PAGE.ACTION,
      key: "action",
      render: (record) => {
       
        if(userdetails?.[0]?.user_email !== record.email)
        {
       return (
       <>
       <Tooltip title="Edit user details" >
       <Button style={{border:"none",background:"transparent",boxShadow:"none",}}  onClick={()=>handleModalOpen("update",record)}>
          <EditOutlined style={{fontSize:"20px"}}/>
       </Button>
       </Tooltip><Popconfirm
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
          onConfirm={(e) =>{ e.preventDefault(); handleDelete(record?.index, record?.isActive)}}
          onCancel={cancel}
          okText="Confirm"
          cancelText="Cancel"
          icon={
            record.isActive ? (
              <CloseCircleOutlined
                style={{
                  color: "red",
                }}
              />
            ) : (
              <CheckCircleOutlined
                style={{
                  color: "green",
                }}
              />
            )
          }
        >
          <Tooltip
            title={
              record.isActive ? "Disable User Access" : "Enable User Access"
            }
          >
            <img
              src={record.isActive ? disableUser : enableUser}
              width="26px"
            />
          </Tooltip>
        </Popconfirm>
        </>
        );}
      },
    },
  ];

  return (
    <Spin tip="Loading" size="large" spinning={loading}>
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
          {/* Top Section with buttons */}
          <Space
            style={{
              width: "100%",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Button
              type="primary"
              onClick={()=>handleModalOpen('new',null)}
              style={{
                background: "#2ba9bc",
                display: "flex",
                alignItems: "center",
                borderRadius: "20px",
              }}
            >
              {/* <FileFilled style={{ marginRight: 4 }} /> */}
              <img src={addUserIcon} width="18px" />
              {BUTTON_LABEL.CREATE_USER}
            </Button>

            {/* Search Input and Popover Filter */}
            <Space>
              {/* <ToggleButtons onViewModeChange={handleViewModeChange} /> */}
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
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </FormControl>

              {/* <Popover
                content={filterPopoverContent}
                title="Filters"
                visible={popoverVisible}
                onVisibleChange={setPopoverVisible}
                trigger="click"
              >
                <Button
                  type="primary"
                  style={{ background: "#003a8c", color: "#ffffff" }}
                >
                  {BUTTON_LABEL.FILTER}
                </Button>
              </Popover> */}
              <Button>
                <DownloadOutlined />
              </Button>
            </Space>
          </Space>
          {/* Displaying Table or Card View */}
          {
            viewMode === "list" ? (
              <>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tabs
                    value={value}
                    onChange={handleChange}
                    aria-label="basic tabs example"
                  >
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
                      total: filteredData?.length,
                      onChange: handlePaginationChange,
                    }}
                  />
                </CustomTabPanel>
                <CustomTabPanel value={value} index={1}>
                  <Table
                    columns={columns}
                    dataSource={paginatedDataforInactive}
                    rowKey="index"
                    pagination={{
                      current: currentPageforInactive,
                      pageSizeinactive,
                      total: filteredDataforInactive?.length,
                      onChange: handlePaginationChange,
                    }}
                  />
                </CustomTabPanel>
              </>
            ) : null
            // <CardView data={paginatedData} />
          }
        </Space>

        {/* Modal for User Creation */}
        <Modal
          title={HEADING.CREATE_USER}
          visible={isModalVisible}
          onCancel={handleModalClose}
          footer={null}
          width={800}
        >
          <UserCreation onHandleClose={(e) => handleClose()} type={modalType} selecteddata={modalData}/>
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
};

// Custom hook for debouncing input value
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

export default UserListing;
