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
import MultiSelectWithChip from "components/form/MultiSelectWithChip"; // Assuming this is a custom component
import {
  SearchOutlined,
  DownloadOutlined,
  FileFilled,
} from "@ant-design/icons";
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

const Listing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { filterStatusValue } = location.state || {}; // Receive initial status filter
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);
  const [industryFilter, setIndustryFilter] = useState([]);
  const [popoverVisible, setPopoverVisible] = useState(false); // Control popover visibility
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'card'
  const [currentPage, setCurrentPage] = useState(1); // Track the current page
  const [pageSize, setPageSize] = useState(10); // Number of rows per page
  const [loading, setLoading] = useState(true);

  console.log("filterStatusValue",filterStatusValue)

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
    setFilteredData(filterData());
  }, [filterStatusValue]);

  

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
    status
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
    };
  };

  const fetchData = () => {
    ProjectApiService.projectListing()
      .then((response) => {
        // On success, you can add any additional logic here
        setSnackData({
          show: true,
          message:
            response?.message || API_SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY,
          type: "success",
        });

        // console.log("response",response)

        const newData = response?.data?.details.map((project, index) => {
          return createData(
            project.project_id, // index
            project.project_no, // project_no
            project.project_name, // project_name
            project.no_of_runs, // runs
            project.industry_name, // industry
            project.mapping_standards, // mapping_no
            project.regulatory_standard,
            project.created_at !== "null" && project.created_at !== ""  ? formatDate(project.created_at) : "", // start_date
            project.last_run !== "null" && project.last_run !== "" ? formatDate(project.last_run) : "", // last_run
            project.status // status
          );
        });

        setData(newData);
        setFilteredData(newData);
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
  const filterData = () => {
    console.log("data",filteredData)
    return data.filter((item) => {
      console.log("statusFilter",statusFilter,filterStatusValue)
      const matchesStatus =
        statusFilter.length === 0 ||
        statusFilter.includes(filterStatusValue);
      const matchesIndustry =
        industryFilter.length === 0 || industryFilter.includes(item.industry);
      const matchesSearchText =
        item.project_name.toLowerCase().includes(debouncedSearchText) ||
        item.project_no.toString().includes(debouncedSearchText);

      return matchesStatus && matchesIndustry && matchesSearchText;
    });
  };

  // Effect for updating filtered data based on filters
  useEffect(() => {
    setFilteredData(filterData());
  }, [statusFilter, industryFilter, debouncedSearchText]);

  // Handle view mode switch
  const handleViewModeChange = (newViewMode) => {
    setViewMode(newViewMode); // Update view mode (list or card)
  };

  // Handle project navigation
  const handleNavigateToProject = (projectNo) => {
    navigate(`/projectView/${projectNo}`, { state: { projectNo } });
  };

  // Handle pagination change
  const handlePaginationChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  // Pagination logic
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
    {
      title: LISTING_PAGE.PROJECT_NAME,
      dataIndex: "project_name",
      key: "project_name",
      render: (text, record) => (
        <a
          onClick={() => handleNavigateToProject(record.index)}
          style={{ color: "#1890ff", cursor: "pointer" }}
        >
          {text}
        </a>
      ),
      filterSearch: true,
      onFilter: (value, record) =>
        record.project_name.toLowerCase().includes(value.toLowerCase()),
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
    {
      title: LISTING_PAGE.INDUSTRY,
      dataIndex: "industry",
      key: "industry",
      // filters: [
      //   { text: "Manufacturing", value: "Manufacturing" },
      //   { text: "Tech", value: "Tech" },
      // ],
      onFilter: (value, record) => record.industry.includes(value),
    },
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
            {statusArray.map((tag, index) => {
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
      render: (_,  { status }) => (
        <Button
          variant="contained"
          style={{ background: status === "In Progress" ? "#dcdfdf" :"#003a8c", color:status === "In Progress" ? "#959191" : "#ffffff" }}
          disabled={status === "In Progress" ? true : false}
        >
          {BUTTON_LABEL.RUN_PROJECT}
        </Button>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
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
              onClick={() => navigate("/createProject")}
              style={{
                background: "#00bfa5",
                display: "flex",
                alignItems: "center",
                borderRadius: "20px",
              }}
            >
              <FileFilled style={{ marginRight: 4 }} />
              {BUTTON_LABEL.CREATE_PROJECT}
            </Button>

            {/* Search Input and Popover Filter */}
            <Space>
              {paginatedData.length > 0 &&
                <ToggleButtons onViewModeChange={handleViewModeChange} />
              }
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
            </Space>
          </Space>
          {/* Displaying Table or Card View */}
          {viewMode === "list" ? (
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
          ) : (
            <CardView data={paginatedData} />
          )}
        </Space>
        <Snackbar
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
