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
  Modal,Avatar
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
  HEADING,
} from "shared/constants";
import { formatDate, getStatusChipProps } from "shared/utility";
import { OrganisationApiService } from "services/api/OrganizationAPIService";
import OrgCreation from "./OrgCreation";
import { ApartmentOutlined } from '@ant-design/icons';


const OrganizationListing = () => {
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
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const createData = (
    index,
    org_email,
    org_logo,
    org_name,
    org_url,
    org_address,
    sector,
    industry
  ) => {
    return {
      index,
      org_email,
      org_logo,
      org_name,
      org_url,
      org_address,
      sector,
      industry,
    };
  };

  const fetchData = () => {
    OrganisationApiService.organisationListing()
      .then((response) => {
        // On success, you can add any additional logic here
        setSnackData({
          show: true,
          message:
            response?.message || API_SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY,
          type: "success",
        });

        const newData = response?.data?.details.map((org, index) => {
          const addressParts = [];
          if (org.org_address?.city) addressParts.push(org.org_address?.city);
          if (org.org_address?.state) addressParts.push(org.org_address?.state);
          if (org.org_address?.street)
            addressParts.push(org.org_address?.street);
          if (org.org_address?.country)
            addressParts.push(org.org_address?.country);

          // Join the address parts with a comma
          const address = addressParts.join(", ");

          return createData(
            org.org_id, // index
            org.org_email,
            org.org_logo,
            org.org_name,
            org.org_url,
            address,
            org.sector_name,
            org.industry_names
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
    return data.filter((item) => {
      const matchesStatus =
        statusFilter.length === 0 || statusFilter.includes(filterStatusValue);
      const matchesIndustry =
        industryFilter.length === 0 || industryFilter.includes(item.industry);
      const matchesSearchText =
        item.org_name.toLowerCase().includes(debouncedSearchText) ||
        item.org_email.toString().includes(debouncedSearchText);

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
  const handleNavigateToOrganization = (org_id) => {
    // navigate(`/projectView/${org_id}`, { state: { org_id } });
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

  const handleModalOpen = () => {
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

  // Table columns
  const columns = [
    {
      title: LISTING_PAGE.ORG_NAME,
      dataIndex: "org_name",
      key: "org_name",
      render: (text, record) => (
        <>
          <Avatar
            sx={{ width: 40, height: 40 }}
            alt={record.org_name}
            src={
              record.org_logo || (
                <ApartmentOutlined style={{ color: "black" }} />
              )
            }
          />
          <span style={{ marginLeft: 10 }}>
            <a
              onClick={() => handleNavigateToOrganization(record.index)}
              style={{ color: "#2ba9bc", cursor: "pointer" }}
            >
              {text}
            </a>
          </span>
        </>
      ),
      filterSearch: true,
      onFilter: (value, record) =>
        record.org_name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: LISTING_PAGE.ORG_EMAIL,
      dataIndex: "org_email",
      key: "org_email",
      filterSearch: true,
      onFilter: (value, record) => record.org_email.toString().includes(value),
    },
    {
      title: LISTING_PAGE.ORG_WEBSITE,
      dataIndex: "org_url",
      key: "org_url",
    },
    {
      title: LISTING_PAGE.ORG_ADDRESS,
      dataIndex: "org_address",
      key: "org_address",
    },
    {
      title: LISTING_PAGE.SECTOR,
      dataIndex: "sector",
      key: "sector",
    },
    {
      title: LISTING_PAGE.INDUSTRY,
      dataIndex: "industry",
      key: "industry",
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
              onClick={handleModalOpen}
              style={{
                background: "#2ba9bc",
                display: "flex",
                alignItems: "center",
                borderRadius: "20px",
              }}
            >
              <FileFilled style={{ marginRight: 4 }} />
              {BUTTON_LABEL.CREATE_ORGANIZATION}
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
              </Popover> */}
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
        <Modal
          title={HEADING.CREATE_ORG}
          visible={isModalVisible}
          onCancel={handleModalClose}
          footer={null}
          width={800}
        >
          <OrgCreation onHandleClose={(e) => handleClose()} />
        </Modal>
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

export default OrganizationListing;
