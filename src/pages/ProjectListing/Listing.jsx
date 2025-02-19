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
  Radio,
} from "antd";
import { Chip } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import MultiSelectWithChip from "components/form/MultiSelectWithChip"; // Assuming this is a custom component
import { SearchOutlined, DownloadOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { ProjectApiService } from "services/api/ProjectAPIService";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CardView from "./CardView";
import ToggleButtons from "./ToggleButton";
import {
  API_ERROR_MESSAGE,
  LISTING_PAGE,
  API_SUCCESS_MESSAGE,
  STATUS,
  BUTTON_LABEL,
  GENERIC_DATA_LABEL,
  FORM_LABEL,
} from "shared/constants";
import { formatDate, getStatusChipProps } from "shared/utility";
import NestedListing from "./NestedListing";
import AdminOrgNestedListing from "./AdminOrgNestedListing";
import projectIcon from "../../assets/images/icons/projectIcon3.svg";
import addProjectIcon from "../../assets/images/icons/addProject.svg";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

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

const Listing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { filterStatusValue } = location.state || {}; // Receive initial status filter
  const [data, setData] = useState([]);
  const [dataInvited, setDataInvited] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [filteredInvitedData, setFilteredInvitedData] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);
  const [statusData, setStatusData] = useState([
    "Draft",
    "In Progress",
    "Processing",
    "Success",
    "Failed",
    "Completed"
  ]);
  const [industryFilter, setIndustryFilter] = useState([]);
  const [popoverVisible, setPopoverVisible] = useState(false); // Control popover visibility
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'card'
  const [currentPage, setCurrentPage] = useState(1); // Track the current page
  const [currentInvitedPage, setCurrentInvitedPage] = useState(1); // Track the current page
  const [pageSize, setPageSize] = useState(10); // Number of rows per page
  const [pageInvitedSize, setPageInvitedSize] = useState(10); // Number of rows per page
  const [loading, setLoading] = useState(true);
  const [orgLevelData, setOrgLevelData] = useState([]);
  const [value, setValue] = React.useState(0);

  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });
  const [sortBy, setSortBy] = useState("status"); // Default sorting by status
  const [sortOrder, setSortOrder] = useState("ascend"); // Default ascending order

  useEffect(() => {
    fetchData();
  }, []);

  // Effect for initializing the status filter based on location state
  useEffect(() => {
    if (filterStatusValue && filterStatusValue != "Total Project") {
      setStatusFilter([filterStatusValue]); // Set the statusFilter if status is passed
      setFilteredData(filterData("created"));
      setFilteredInvitedData(filterData("invited"))
    }
  }, [filterStatusValue]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));
  const userRole = userdetails?.[0]?.role_name;

  const createData = (
    index,
    project_no,
    project_name,
    runs,
    industry,
    mapping_no,
    regulatory_standard,
    start_date,
    last_run,
    status,
    invite_members,
  ) => {
    return {
      index,
      project_no,
      project_name,
      runs,
      industry,
      mapping_no,
      regulatory_standard,
      start_date,
      last_run,
      status,
      invite_members,
    };
  };

  const fetchData = () => {
    ProjectApiService.projectListing()
      .then((response) => {
        setSnackData({
          show: true,
          message:
            response?.message || API_SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY,
          type: "success",
        });

        setOrgLevelData(response?.data?.details);

        const newData = response?.data?.details?.map((project, index) => {
          return createData(
            project.project_id, // index
            project.project_no, // project_no
            project.project_name, // project_name
            project.no_of_runs, // runs
            project.industry_name, // industry
            project.mapping_standards, // mapping_no
            project.regulatory_standard,
            project.created_at !== "null" &&
              project.created_at !== null &&
              project.created_at !== ""
              ? formatDate(project.created_at)
              : "", // start_date
            project.last_run !== "null" &&
              project.last_run !== null &&
              project.last_run !== ""
              ? formatDate(project.last_run)
              : "", // last_run
            project.status, // status
            project.invite_members
          );
        });

        const newInvitedData = response?.data?.invited_projects?.map((project, index) => {
          return createData(
            project.project_id, // index
            project.project_no, // project_no
            project.project_name, // project_name
            project.no_of_runs, // runs
            project.industry_name, // industry
            project.mapping_standards, // mapping_no
            project.regulatory_standard,
            project.created_at !== "null" &&
              project.created_at !== null &&
              project.created_at !== ""
              ? formatDate(project.created_at)
              : "", // start_date
            project.last_run !== "null" &&
              project.last_run !== null &&
              project.last_run !== ""
              ? formatDate(project.last_run)
              : "", // last_run
            project.status, // status
            project.invite_members
          );
        });

        setData(newData);
        setFilteredData(newData);
        setDataInvited(newInvitedData);
        setFilteredInvitedData(newInvitedData);
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

  const handleSearch = (value) => {
    const searchText = value?.toLowerCase();
    setSearchText(searchText);
  };

  const debouncedSearchText = useDebounce(searchText, 500);

  const filterData = (type) => {
    if(type==="created")
    {
    let filteredData = data?.filter((item) => {
      const matchesStatus =
        statusFilter.length === 0 ||
        statusFilter[0] === "Total Projects" ||
        statusFilter?.includes(item.status);
      const matchesIndustry =
        industryFilter.length === 0 || industryFilter?.includes(item.industry);
      const matchesSearchText =
        item?.project_name?.toLowerCase()?.includes(debouncedSearchText) ||
        item?.project_no?.toString()?.includes(debouncedSearchText);

      return matchesStatus && matchesIndustry && matchesSearchText;
    });

    // Sorting logic based on sortBy state
    if (sortOrder === "ascend") {
      filteredData?.sort((a, b) => a.project_name?.localeCompare(b.project_name));
    } else if (sortOrder === "descend") {
      filteredData?.sort((a, b) => b.project_name?.localeCompare(a.project_name));
    }

    return filteredData;
  }
  else
  {
    let filteredData = dataInvited?.filter((item) => {
    const matchesStatus =
      statusFilter.length === 0 ||
      statusFilter[0] === "Total Projects" ||
      statusFilter?.includes(item.status);
    const matchesIndustry =
      industryFilter.length === 0 || industryFilter?.includes(item.industry);
    const matchesSearchText =
      item?.project_name?.toLowerCase()?.includes(debouncedSearchText) ||
      item?.project_no?.toString()?.includes(debouncedSearchText);

    return matchesStatus && matchesIndustry && matchesSearchText;
  });

  // Sorting logic based on sortBy state
  if (sortOrder === "ascend") {
    filteredData?.sort((a, b) => a.project_name?.localeCompare(b.project_name));
  } else if (sortOrder === "descend") {
    filteredData?.sort((a, b) => b.project_name?.localeCompare(a.project_name));
  }

  return filteredData;

  }
  };

  useEffect(() => {
    setFilteredData(filterData("created"));
    setFilteredInvitedData(filterData("invited"));
  }, [statusFilter, industryFilter, debouncedSearchText, sortBy, sortOrder]);

  useEffect(() => {
    if (filteredData && filterStatusValue !== "Total Project") {
      setFilteredData(filterData("created"));
      setFilteredInvitedData(filterData("invited"));
    }
  }, [data,dataInvited]);

  const handleViewModeChange = (newViewMode) => {
    setViewMode(newViewMode);
  };

  const handleNavigateToProject = (projectNo,type) => {
    navigate(`/projectView/${projectNo}`, { state: { projectNo,runAssessmentState:type }});
  };

  const handlePaginationChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const handleInvitedPaginationChange = (page, pageSize) => {
    setCurrentInvitedPage(page);
    setPageInvitedSize(pageSize);
  };

  const paginatedData = filteredData?.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const paginatedInvitedData = filteredInvitedData?.slice(
    (currentInvitedPage - 1) * pageInvitedSize,
    currentInvitedPage * pageInvitedSize
  );

  const filterPopoverContent = (
    <div>
      <MultiSelectWithChip
        label="Status"
        value={statusFilter}
        options={statusData}
        onChange={setStatusFilter}
      />

      {userRole === "Super Admin" ||
      userRole === "Org Super Admin" ||
      userRole === "Admin" ? (
        <MultiSelectWithChip
          label="Industry"
          value={industryFilter}
          onChange={setIndustryFilter}
        />
      ) : (
        ""
      )}

      <div style={{ marginTop: "10px" }}>
        <label>
          <b>Sort Project Name by:</b>
        </label>
        <br />
        <br />
        <Space direction="horizontal">
          <Button
            onClick={() => setSortOrder("ascend")}
            type={sortOrder === "ascend" ? "primary" : "default"}
          >
            Ascending
          </Button>
          <Button
            onClick={() => setSortOrder("descend")}
            type={sortOrder === "descend" ? "primary" : "default"}
          >
            Descending
          </Button>
        </Space>
      </div>

      {/* <Button
        type="primary"
        onClick={() => setPopoverVisible(false)}
        style={{ marginTop: "16px" }}
      >
        Done
      </Button> */}
    </div>
  );

  const columns = [
    {
      title: LISTING_PAGE.PROJECT_NAME,
      dataIndex: "project_name",
      key: "project_name",
      render: (text, record) => (
        <>
          <img
            src={projectIcon}
            width="30px"
            style={{ verticalAlign: "middle", marginRight: "10px" }}
          />
          <a
            onClick={() => handleNavigateToProject(record.index,"view")}
            style={{ color: "#2ba9bc", cursor: "pointer" }}
          >
            {text}
          </a>
        </>
      ),
      filterSearch: true,
      onFilter: (value, record) =>
        record?.project_name?.toLowerCase().includes(value?.toLowerCase()),
    },
    {
      title: LISTING_PAGE.PROJECT_No,
      dataIndex: "project_no",
      key: "project_no",
      filterSearch: true,
      onFilter: (value, record) => record.project_no.toString().includes(value),
    },
    {
      title: LISTING_PAGE.NO_OF_RUNS,
      dataIndex: "runs",
      key: "runs",
    },
    ...(userRole === "Super Admin" ||
    userRole === "Org Super Admin" ||
    userRole === "Admin"
      ? [
          {
            title: LISTING_PAGE.INDUSTRY,
            dataIndex: "industry",
            key: "industry",
            onFilter: (value, record) => record.industry.includes(value),
          },
        ]
      : []),
    {
      title: LISTING_PAGE.REGULATORY_SANTARDS,
      dataIndex: "regulatory_standard",
      key: "regulatory_standard",
    },
    {
      title: LISTING_PAGE.START_DATE,
      dataIndex: "start_date",
      key: "start_date",
    },
    {
      title: LISTING_PAGE.LAST_RUN,
      dataIndex: "last_run",
      key: "last_run",
    },
    {
      title: LISTING_PAGE.STATUS,
      key: "status",
      dataIndex: "status",
      render: (_, { status }) => {
        // Check if status is an array, and handle accordingly
        const statusArray = Array.isArray(status) ? status : [status];

        // Return the mapped JSX elements
        return (
          <>
            {statusArray?.map((tag, index) => {
              const { title, color, borderColor } = getStatusChipProps(tag);

              return (
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  key={index}
                >
                  <Chip
                    label={title}
                    color={borderColor}
                    variant="outlined"
                    sx={{
                      bgcolor: color,
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  />
                </Stack>
              );
            })}
          </>
        );
      },
      // filters: [
      //   { text: "In Progress", value: "In Progress" },
      //   { text: "Active", value: "Active" },
      //   { text: "Success", value: "Success" },
      //   { text: "Failed", value: "Failed" },
      // ],
      onFilter: (value, record) => {
        // Modify the filter logic if status is an array or single value
        const statusArray = Array.isArray(record.status)
          ? record.status
          : [record.status];
        return statusArray.includes(value);
      },
    },
    {
      title: LISTING_PAGE.ACTION,
      key: "action",
      dataIndex: "status",
      render: (status,record) => (
        <Button
          variant="contained"
          style={{
            background:  "#003a8c",
            color: "#ffffff",
          }}
          // style={{
          //   background: status === "In Progress" ? "#dcdfdf" : "#003a8c",
          //   color: status === "In Progress" ? "#959191" : "#ffffff",
          // }}
           // disabled={status === "In Progress" ? true : false}
          onClick={()=>handleNavigateToProject(record.index,"run")}
        >
          {BUTTON_LABEL.RUN_PROJECT}
        </Button>
      ),
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
            {userRole !== "Super Admin" && (
              <Button
                type="primary"
                onClick={() => navigate("/createProject")}
                style={{
                  background: "#2ba9bc",
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "20px",
                }}
              >
                {/* <FileFilled style={{ marginRight: 4 }} /> */}
                <img src={addProjectIcon} width="20px" />
                {BUTTON_LABEL.CREATE_PROJECT}
              </Button>
            )}

            {/* Search Input and Popover Filter */}
            <Space>
              {userRole !== "Super Admin" &&
                userRole !== "Org Super Admin" &&
                userRole !== "Admin" && (
                  <>
                    <ToggleButtons onViewModeChange={handleViewModeChange} />

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

                    <Popover
                      content={filterPopoverContent}
                      title={BUTTON_LABEL.FILTER}
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
                    </Popover>
                    <Button>
                      <DownloadOutlined />
                    </Button>
                  </>
                )}
            </Space>
          </Space>
          {/* Displaying Table or Card View */}

          {userRole === "Super Admin" ? (
            <AdminOrgNestedListing data={orgLevelData} filterStatusValue={filterStatusValue}/>
          ) : userRole === "Org Super Admin" || userRole === "Admin" ? (
            <NestedListing data={orgLevelData} filterStatusValue={filterStatusValue}/>
          ) : (
            <>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={value}
                  onChange={handleChange}
                  aria-label="basic tabs example"
                >
                  <Tab label="Your Projects" {...a11yProps(0)} />
                  <Tab label="Invited Projects" {...a11yProps(1)} />
                </Tabs>
              </Box>
              <CustomTabPanel value={value} index={0}>
                {viewMode === "list" ? (
                  <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="index"
                    pagination={{
                      current: currentPage,
                      pageSize,
                      total: filteredData?.length,
                      onChange: handlePaginationChange,
                    }}
                  />
                ) : (
                  <CardView data={paginatedData} />
                )}
              </CustomTabPanel>
              <CustomTabPanel value={value} index={1}>
                
                {viewMode === "list" ? (
                  <Table
                    columns={columns}
                    dataSource={filteredInvitedData}
                    rowKey="index"
                    pagination={{
                      current: currentInvitedPage,
                      pageInvitedSize,
                      total: filteredInvitedData?.length,
                      onChange: handleInvitedPaginationChange,
                    }}
                  />
                ) : (
                  <CardView data={paginatedInvitedData} />
                )}
              </CustomTabPanel>
            </>
          )}
        </Space>
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

export default Listing;
