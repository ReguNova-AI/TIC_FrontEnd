import React, { useEffect, useState } from "react";
import {
  Space,
  Table,
  ConfigProvider,
  Empty,
  Popover,
  Button,
  Spin,
} from "antd";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import Stack from "@mui/material/Stack";
import MultiSelectWithChip from "components/form/MultiSelectWithChip";
import DownloadOutlined from "@ant-design/icons/DownloadOutlined";
import { useLocation, useNavigate } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CardView from "./CardView";
import ToggleButtons from "./ToggleButton";
import {
  LISTING_PAGE,
  BUTTON_LABEL,
  GENERIC_DATA_LABEL,
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
import { useProjects } from "components/hooks/useProjects";
import SearchInput from "components/form/SearchInput";
import { brand } from "themes/theme/brand";
import FilterAltIcon from "@mui/icons-material/FilterAlt";

// ------------------ CustomTabPanel ------------------
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

const STATUS_OPTIONS = [
  "Draft",
  "In Progress",
  "Processing",
  "Success",
  "Failed",
  "Completed",
];

// ------------------ StatusColumnTitle (outside Listing) ------------------
const StatusColumnTitle = ({
  statusFilter,
  setStatusFilter,
  setCurrentPage,
  setCurrentInvitedPage,
}) => {
  const [open, setOpen] = useState(false);

  const handleChange = (newValue) => {
    // MultiSelectWithChip passes the full updated array directly
    setStatusFilter(newValue);
    setCurrentPage(1);
    setCurrentInvitedPage(1);
  };

  return (
    <Popover
      content={
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            minWidth: "150px",
          }}
        >
          <MultiSelectWithChip
            label="Status"
            value={statusFilter}
            options={STATUS_OPTIONS}
            onChange={handleChange}
          />
        </div>
      }
      title="Filter by Status"
      trigger="click"
      open={open}
      onOpenChange={setOpen}
    >
      <div
        style={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          userSelect: "none",
        }}
      >
        {LISTING_PAGE.STATUS}
        <span
          style={{
            marginLeft: "6px",
            fontSize: "11px",
            color: statusFilter.length > 0 ? brand.primary : "#bbb",
          }}
        >
          <FilterAltIcon
            fontSize="small"
            sx={{ position: "relative", top: "2px" }}
          />
        </span>
      </div>
    </Popover>
  );
};

// ------------------ Listing Component ------------------
const Listing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { filterStatusValue } = location.state || {};

  // Local state for filtering, search, pagination
  const [viewMode, setViewMode] = useState("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentInvitedPage, setCurrentInvitedPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pageInvitedSize, setPageInvitedSize] = useState(10);
  const [value, setValue] = useState(0);
  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });

  // ------------------ Search and Filter ------------------

  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState([]);

  // ------------------ Misc ------------------
  const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));
  const userRole = userdetails?.[0]?.role_name;

  // Tanstack Query
  const debouncedSearch = useDebounce(searchText, 500);
  const {
    data: projectData,
    isLoading,
    isError,
    error,
  } = useProjects(
    currentPage,
    pageSize,
    sortBy,
    sortOrder,
    debouncedSearch,
    statusFilter,
  );

  // ------------------ Data Transformation ------------------
  const transformProjects = (projects = []) =>
    projects.map((project) => ({
      index: project.project_id,
      project_name: project.project_name,
      no_of_runs: project.no_of_runs,
      industry: project.industry_name,
      mapping_no: project.mapping_standards,
      regulatory_standard: project.regulatory_standard,
      created_at:
        project.created_at && project.created_at !== "null"
          ? formatDate(project.created_at)
          : "",
      last_run:
        project.last_run && project.last_run !== "null"
          ? formatDate(project.last_run)
          : "",
      status: project.status,
      invite_members: project.invite_members,
    }));

  const filteredData = transformProjects(projectData?.details);
  const filteredInvitedData = transformProjects(projectData?.invited_projects);

  const TotalProjectRecords =
    userRole === "Super Admin" ||
    userRole === "Org Super Admin" ||
    userRole === "Admin"
      ? projectData?.total_count || 0
      : projectData?.total_project_count || 0;

  const TotalInvitedProjectRecords =
    userRole === "Super Admin" ||
    userRole === "Org Super Admin" ||
    userRole === "Admin"
      ? projectData?.total_count || 0
      : projectData?.total_invited_project_count || 0;

  // ------------------ Search handler ------------------
  const handleSearch = (val) => {
    setSearchText(val);
    setCurrentPage(1);
    setCurrentInvitedPage(1);
  };

  // ------------------ Pagination ------------------

  const handleNavigateToProject = (projectNo, type) => {
    navigate(`/projectView/${projectNo}`, {
      state: { projectNo, runAssessmentState: type },
    });
  };

  const handleTableChange = (pagination, _, sorter) => {
    if (sorter?.columnKey) {
      const dbColumn = sorter.columnKey;
      setSortBy(dbColumn);
      setSortOrder(sorter.order === "ascend" ? "asc" : "desc");
    } else {
      // Sorter cleared
      setSortBy(null);
      setSortOrder(null);
    }
    // Reset to page 1 on sort change
    setCurrentPage(1);
    setCurrentInvitedPage(1);
  };

  const columns = [
    {
      title: <span style={{ textTransform: 'none', fontSize: '14px' }}>{LISTING_PAGE.PROJECT_NAME}</span>,
      dataIndex: "project_name",
      key: "project_name",
      sorter: true,
      sortDirections: ["ascend", "descend", "ascend"],
      render: (text, record) => (
        <>
          <img
            src={projectIcon}
            width="30px"
            style={{ verticalAlign: "middle", marginRight: "10px" }}
          />
          <a
            onClick={() => handleNavigateToProject(record.index, "view")}
            style={{ color: brand.primary, cursor: "pointer" }}
          >
            {text}
          </a>
        </>
      ),
    },
    {
      title: <span style={{ textTransform: 'none', fontSize: '14px' }}>{LISTING_PAGE.PROJECT_No}</span>,
      dataIndex: "index",
      key: "project_id",
      sorter: true,
      sortDirections: ["ascend", "descend", "ascend"],
    },
    {
      title: <span style={{ textTransform: 'none', fontSize: '14px' }}>{LISTING_PAGE.NO_OF_RUNS}</span>,
      dataIndex: "no_of_runs",
      key: "no_of_runs",
      sorter: true,
      sortDirections: ["ascend", "descend", "ascend"],
    },
    ...(userRole === "Super Admin" ||
    userRole === "Org Super Admin" ||
    userRole === "Admin"
      ? [
          {
            title: <span style={{ textTransform: 'none', fontSize: '14px' }}>{LISTING_PAGE.INDUSTRY}</span>,
            dataIndex: "industry",
            key: "industry",
            sorter: true,
            sortDirections: ["ascend", "descend", "ascend"],
          },
        ]
      : []),
    {
      title: <span style={{ textTransform: 'none', fontSize: '14px' }}>{LISTING_PAGE.REGULATORY_SANTARDS}</span>,
      dataIndex: "regulatory_standard",
      key: "regulatory_standard",
    },
    {
      title: <span style={{ textTransform: 'none', fontSize: '14px' }}>{LISTING_PAGE.START_DATE}</span>,
      dataIndex: "created_at",
      key: "created_at",
      sorter: true,
      sortDirections: ["ascend", "descend", "ascend"],
    },
    {
      title: <span style={{ textTransform: 'none', fontSize: '14px' }}>{LISTING_PAGE.LAST_RUN}</span>,
      dataIndex: "last_run",
      key: "last_run",
      sorter: true,
      sortDirections: ["ascend", "descend", "ascend"],
    },
    {
      title: (
        <StatusColumnTitle
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          setCurrentPage={setCurrentPage}
          setCurrentInvitedPage={setCurrentInvitedPage}
        />
      ),
      key: "status",
      dataIndex: "status",
      render: (_, { status }) => {
        const statusArray = Array.isArray(status) ? status : [status];
        return (
          <>
            {statusArray?.map((tag, i) => {
              const { title, color, borderColor } = getStatusChipProps(tag);
              return (
                <Stack direction="row" spacing={1} alignItems="center" key={i}>
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
    },
    {
      title: <span style={{ textTransform: 'none' }}>{LISTING_PAGE.ACTION}</span>,
      key: "action",
      align: "center",
      dataIndex: "status",
      render: (status, record) => (
        <Button
          style={{ background: brand.primary, color: "#ffffff" }}
          onClick={() => handleNavigateToProject(record.index, "run")}
        >
          {BUTTON_LABEL.RUN_PROJECT}
        </Button>
      ),
    },
  ];

  return (
    <Spin spinning={isLoading} tip="Loading projects...">
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
          {/* Top Section */}
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
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "20px",
                  boxShadow: "none",
                }}
              >
                <img src={addProjectIcon} width="20px" />
                {BUTTON_LABEL.CREATE_PROJECT}
              </Button>
            )}

            {/* Search + Filter */}
            <Space>
              {userRole !== "Super Admin" &&
                userRole !== "Org Super Admin" &&
                userRole !== "Admin" && (
                  <>
                    <ToggleButtons
                      onViewModeChange={(newViewMode) =>
                        setViewMode(newViewMode)
                      }
                    />

                    <FormControl fullWidth>
                      <SearchInput
                        value={searchText}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search"
                        width={300}
                      />
                    </FormControl>

                    <Button>
                      <DownloadOutlined />
                    </Button>
                  </>
                )}
            </Space>
          </Space>

          {/* Main Content */}
          {isError ? (
            <Alert severity="error">
              {error?.message || "Failed to fetch projects"}
            </Alert>
          ) : userRole === "Super Admin" ? (
            <AdminOrgNestedListing
              data={projectData?.details}
              filterStatusValue={filterStatusValue}
            />
          ) : userRole === "Org Super Admin" || userRole === "Admin" ? (
            <NestedListing
              data={projectData?.details}
              filterStatusValue={filterStatusValue}
            />
          ) : (
            <>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={value}
                  onChange={(e, newValue) => setValue(newValue)}
                  aria-label="basic tabs example"
                >
                  <Tab label="Your Projects" {...a11yProps(0)} />
                  <Tab label="Invited Projects" {...a11yProps(1)} />
                </Tabs>
              </Box>
              <CustomTabPanel value={value} index={0}>
                {viewMode === "list" ? (
                  <Table
                    onChange={handleTableChange}
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="index"
                    pagination={{
                      current: currentPage,
                      pageSize,
                      total: TotalProjectRecords,
                      onChange: (page, size) => {
                        setCurrentPage(page);
                        setPageSize(size);
                      },
                    }}
                  />
                ) : (
                  <CardView data={filteredData} />
                )}
              </CustomTabPanel>
              <CustomTabPanel value={value} index={1}>
                {viewMode === "list" ? (
                  <Table
                    onChange={handleTableChange}
                    columns={columns}
                    dataSource={filteredInvitedData}
                    rowKey="index"
                    pagination={{
                      current: currentInvitedPage,
                      pageSize: pageInvitedSize,
                      total: TotalInvitedProjectRecords,
                      onChange: (page, size) => {
                        setCurrentInvitedPage(page);
                        setPageInvitedSize(size);
                      },
                    }}
                  />
                ) : (
                  <CardView data={filteredInvitedData} />
                )}
              </CustomTabPanel>
            </>
          )}
        </Space>

        {/* Snackbar */}
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

// ------------------ useDebounce Hook ------------------
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default Listing;
