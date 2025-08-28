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
} from "antd";
import { Chip } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import MultiSelectWithChip from "components/form/MultiSelectWithChip";
import { SearchOutlined, DownloadOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CardView from "./CardView";
import ToggleButtons from "./ToggleButton";
import {
  LISTING_PAGE,
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
import { useProjects } from "components/hooks/useProjects";

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

// ------------------ Listing Component ------------------
const Listing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { filterStatusValue } = location.state || {};

  // Tanstack Query
  const { data: projectData, isLoading, isError, error } = useProjects();

  // Local state for filtering, search, pagination
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState([]);
  const [industryFilter, setIndustryFilter] = useState([]);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentInvitedPage, setCurrentInvitedPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pageInvitedSize, setPageInvitedSize] = useState(10);
  const [value, setValue] = useState(0);
  const [sortOrder, setSortOrder] = useState("ascend");
  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });

  // ------------------ Data Transformation ------------------
  const transformProjects = (projects = []) =>
    projects.map((project) => ({
      index: project.project_id,
      project_no: project.project_no,
      project_name: project.project_name,
      runs: project.no_of_runs,
      industry: project.industry_name,
      mapping_no: project.mapping_standards,
      regulatory_standard: project.regulatory_standard,
      start_date:
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

  const createdProjects = transformProjects(projectData?.details);
  const invitedProjects = transformProjects(projectData?.invited_projects);

  // ------------------ Search & Filters ------------------
  const debouncedSearchText = useDebounce(searchText, 500);

  const filterData = (data) => {
    let filtered = data?.filter((item) => {
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

    if (sortOrder === "ascend") {
      filtered?.sort((a, b) => a.project_name?.localeCompare(b.project_name));
    } else if (sortOrder === "descend") {
      filtered?.sort((a, b) => b.project_name?.localeCompare(a.project_name));
    }

    return filtered;
  };

  const filteredData = filterData(createdProjects);
  const filteredInvitedData = filterData(invitedProjects);

  // ------------------ Pagination ------------------
  const paginatedData = filteredData?.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const paginatedInvitedData = filteredInvitedData?.slice(
    (currentInvitedPage - 1) * pageInvitedSize,
    currentInvitedPage * pageInvitedSize
  );

  // ------------------ Misc ------------------
  const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));
  const userRole = userdetails?.[0]?.role_name;

  const handleNavigateToProject = (projectNo, type) => {
    navigate(`/projectView/${projectNo}`, {
      state: { projectNo, runAssessmentState: type },
    });
  };

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
            onClick={() => handleNavigateToProject(record.index, "view")}
            style={{ color: "#2ba9bc", cursor: "pointer" }}
          >
            {text}
          </a>
        </>
      ),
    },
    {
      title: LISTING_PAGE.PROJECT_No,
      dataIndex: "project_no",
      key: "project_no",
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
        const statusArray = Array.isArray(status) ? status : [status];
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
    },
    {
      title: LISTING_PAGE.ACTION,
      key: "action",
      dataIndex: "status",
      render: (status, record) => (
        <Button
          style={{ background: "#003a8c", color: "#ffffff" }}
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
                  background: "#2ba9bc",
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "20px",
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
                        onChange={(e) => setSearchText(e.target.value)}
                      />
                    </FormControl>

                    <Popover
                      content={
                        <div>
                          <MultiSelectWithChip
                            label="Status"
                            value={statusFilter}
                            options={[
                              "Draft",
                              "In Progress",
                              "Processing",
                              "Success",
                              "Failed",
                              "Completed",
                            ]}
                            onChange={setStatusFilter}
                          />
                          {(userRole === "Super Admin" ||
                            userRole === "Org Super Admin" ||
                            userRole === "Admin") && (
                            <MultiSelectWithChip
                              label="Industry"
                              value={industryFilter}
                              onChange={setIndustryFilter}
                            />
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
                                type={
                                  sortOrder === "ascend" ? "primary" : "default"
                                }
                              >
                                Ascending
                              </Button>
                              <Button
                                onClick={() => setSortOrder("descend")}
                                type={
                                  sortOrder === "descend"
                                    ? "primary"
                                    : "default"
                                }
                              >
                                Descending
                              </Button>
                            </Space>
                          </div>
                        </div>
                      }
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
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="index"
                    pagination={{
                      current: currentPage,
                      pageSize,
                      total: filteredData?.length,
                      onChange: (page, size) => {
                        setCurrentPage(page);
                        setPageSize(size);
                      },
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
                      onChange: (page, size) => {
                        setCurrentInvitedPage(page);
                        setPageInvitedSize(size);
                      },
                    }}
                  />
                ) : (
                  <CardView data={paginatedInvitedData} />
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
