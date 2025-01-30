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
  Avatar,
} from "antd";
import { Chip } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import MultiSelectWithChip from "components/form/MultiSelectWithChip"; // Assuming this is a custom component
import {
  SearchOutlined,
  DownloadOutlined,
  FileFilled,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
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
import { OrganisationApiService } from "services/api/OrganizationAPIService";
import OrgCreation from "./OrgCreation";
import addorgIcon from "../../assets/images/icons/addOrg.svg";
import Orgicon from "../../assets/images/icons/orgListing.svg";
import { UserApiService } from "services/api/UserAPIService";


const OrganizationListing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { filterStatusValue } = location.state || {}; // Receive initial status filter
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);
  const [industryFilter, setIndustryFilter] = useState([]);
  const [sectorFilter, setSectorFilter] = useState([]);
  const [nameFilter, setNameFilter] = useState(""); // For sorting by name
  const [industryData, setIndustryData] = useState([]);
  const [sectorData, setSectorData] = useState([]);
  const [sortOrder, setSortOrder] = useState("ascend"); // 'ascend' or 'descend'
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
    fetchSectorDetails();
    fetchIndustryDetails();
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

  const fetchIndustryDetails = () => {
    UserApiService.industryDetails()
      .then((response) => {
        setSnackData({
          show: true,
          message:
            response?.message || API_SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY,
          type: "success",
        });
        const industryNames = response?.data?.details.map(item => item.industry_name);
        setIndustryData(industryNames || []); // Use an empty array as fallback
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

  const fetchSectorDetails = () => {
    UserApiService.sectorDetails()
      .then((response) => {
        setSnackData({
          show: true,
          message:
            response?.message || API_SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY,
          type: "success",
        });
        const sectors = response?.data?.details.map(item => item.sector_name);
        setSectorData(sectors || []);
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

  const handleSearch = (value) => {
    const searchText = value.toLowerCase();
    setSearchText(searchText);
  };

  const debouncedSearchText = useDebounce(searchText, 500);

  const filterData = () => {
    let filtered = data.filter((item) => {
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(filterStatusValue);
      const matchesIndustry = industryFilter.length === 0 || industryFilter.some(ind => item.industry.includes(ind));
      const matchesSector = sectorFilter.length === 0 || sectorFilter.includes(item.sector);
      const matchesSearchText =
        item.org_name.toLowerCase().includes(debouncedSearchText) ||
        item.org_email.toString().includes(debouncedSearchText);

      return matchesStatus && matchesSector && matchesIndustry && matchesSearchText;
    });

    if (sortOrder === "ascend") {
      filtered.sort((a, b) => a.org_name.localeCompare(b.org_name));
    } else if (sortOrder === "descend") {
      filtered.sort((a, b) => b.org_name.localeCompare(a.org_name));
    }

    return filtered;
  };

  useEffect(() => {
    setFilteredData(filterData());
  }, [statusFilter, industryFilter, sectorFilter, debouncedSearchText, sortOrder]);

  const handleViewModeChange = (newViewMode) => {
    setViewMode(newViewMode); // Update view mode (list or card)
  };

  const handleNavigateToOrganization = (org_id) => {
    // navigate(`/projectView/${org_id}`, { state: { org_id } });
  };

  const handlePaginationChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

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

  const filterPopoverContent = (
    <div style={{ padding: "10px", minWidth: "200px" }}>
      <div>
        <label><b>Sector</b></label>
        <MultiSelectWithChip
          value={sectorFilter}
          onChange={setSectorFilter}
          options={sectorData}
          placeholder="Select Sector"
        />
      </div>
      <div style={{ marginTop: "10px" }}>
        <label><b>Industry</b></label>
        <MultiSelectWithChip
          value={industryFilter}
          onChange={setIndustryFilter}
          options={industryData}
          placeholder="Select Industry"
        />
      </div>
      <div style={{ marginTop: "10px" }}>
        <label><b>Sort Organization Name by:</b></label>
        <br />
        <br />
        <Space direction="horizontal">
          <Button onClick={() => setSortOrder("ascend")} type={sortOrder === "ascend" ? "primary" : "default"}>Ascending</Button>
          <Button onClick={() => setSortOrder("descend")} type={sortOrder === "descend" ? "primary" : "default"}>Descending</Button>
        </Space>
      </div>
    </div>
  );

  const columns = [
    {
      title: LISTING_PAGE.ORG_NAME,
      dataIndex: "org_name",
      key: "org_name",
      render: (text, record) => (
        <>
          {record.org_logo ?
            <Avatar
              sx={{ width: 40, height: 40 }}
              alt={record.org_name}
              src={record.org_logo}
            />
            :
            <img src={Orgicon} width="32px" style={{verticalAlign:"middle"}} />
          }
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
      title: LISTING_PAGE.SECTOR,
      dataIndex: "sector",
      key: "sector",
    },
    {
      title: LISTING_PAGE.INDUSTRY,
      dataIndex: "industry",
      key: "industry",
      // render: (industry) => (
      //   <>
      //     {industry?.map((item, index) => (
      //       <Chip label={item} key={index} sx={{ marginBottom: 1 }} />
      //     ))}
      //   </>
      // ),
    },
    {
      title: LISTING_PAGE.ORG_ADDRESS,
      dataIndex: "org_address",
      key: "org_address",
      render: (address) => <span>{address || GENERIC_DATA_LABEL.NO_DATA}</span>,
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
              {/* <FileFilled style={{ marginRight: 4 }} /> */}
              <img src={addorgIcon} width="18px" />
              {BUTTON_LABEL.CREATE_ORGANIZATION}
            </Button>       
            
            <Space>
             <FormControl fullWidth>
          <InputLabel htmlFor="outlined-adornment-search">{FORM_LABEL.SEARCH}</InputLabel>
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

      </Space>
      </Space>
            <Table
              columns={columns}
              dataSource={paginatedData}
              rowKey="index"
              pagination={{
                current: currentPage,
                pageSize,
                total: filteredData.length,
                onChange: handlePaginationChange,
              }}
            />
            </Space>
      {/* Modal for Organization Creation */}
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
