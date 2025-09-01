import React, { useEffect, useState } from "react";
import {
  Space,
  Table,
  ConfigProvider,
  Empty,
  Popover,
  Button,
  Spin,
  Modal,
  Avatar,
  Popconfirm,
} from "antd";
import { Chip, Tooltip } from "@mui/material";
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
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import {
  API_ERROR_MESSAGE,
  LISTING_PAGE,
  API_SUCCESS_MESSAGE,
  BUTTON_LABEL,
  GENERIC_DATA_LABEL,
  FORM_LABEL,
  HEADING,
} from "shared/constants";
import { OrganisationApiService } from "services/api/OrganizationAPIService";
import OrgCreation from "./OrgCreation";
import addorgIcon from "../../assets/images/icons/addOrg.svg";
import Orgicon from "../../assets/images/icons/orgListing.svg";
import disableUser from "../../assets/images/icons/disableUser.svg";
import enableUser from "../../assets/images/icons/enableUser.svg";
import { UserApiService } from "services/api/UserAPIService";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { useOrganizations } from "components/hooks/useOrganizations"; // ✅ cached hook

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

const OrganizationListing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { filterStatusValue } = location.state || {};

  const [data, setData] = useState([]);
  const [inActiveData, setInActiveData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [inActiveFilteredData, setInActiveFilteredData] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);
  const [industryFilter, setIndustryFilter] = useState([]);
  const [sectorFilter, setSectorFilter] = useState([]);
  const [industryData, setIndustryData] = useState([]);
  const [sectorData, setSectorData] = useState([]);
  const [sortOrder, setSortOrder] = useState("ascend");
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [inActiveCurrentPage, setInActiveCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [inactivePageSize, setInactivePageSize] = useState(10);
  const [value, setValue] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState("");
  const [modalData, setModalData] = useState({});
  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });
  const [totalActiveOrgs, setTotalActiveOrgs] = useState(0);
  const [totalInactiveOrgs, setTotalInactiveOrgs] = useState(0);

  // ✅ use cached hook
  const {
    data: orgResponse,
    isLoading,
    refetch,
  } = useOrganizations(currentPage, pageSize);

  const handleChange = (event, newValue) => setValue(newValue);

  // ✅ transform API response only when it changes
  useEffect(() => {
    if (!orgResponse) return;

    const mapOrg = (org) => {
      const addressParts = [];
      if (org.org_address?.city) addressParts.push(org.org_address?.city);
      if (org.org_address?.state) addressParts.push(org.org_address?.state);
      if (org.org_address?.street) addressParts.push(org.org_address?.street);
      if (org.org_address?.country) addressParts.push(org.org_address?.country);
      const address = addressParts.join(", ");
      return {
        index: org.org_id,
        org_email: org?.contact_json?.primary_contact?.email,
        org_logo: org.org_logo,
        org_name: org.org_name,
        org_url: org.org_url,
        org_address: address,
        sector: org.sector_name,
        industry: org.industry_names,
        industryId: org.industries,
        sector_id: org.sector_id,
        contact_json: org?.contact_json,
        address: org.org_address,
      };
    };

    setData((orgResponse?.details || []).map(mapOrg));
    setInActiveData((orgResponse?.inActiveOrgs || []).map(mapOrg));
    setFilteredData((orgResponse?.details || []).map(mapOrg));
    setInActiveFilteredData((orgResponse?.inActiveOrgs || []).map(mapOrg));
    setTotalActiveOrgs(orgResponse?.totalActiveOrgs?.[0]?.count || 0);
    setTotalInactiveOrgs(orgResponse?.totalInActiveOrgs?.[0]?.count || 0);
  }, [orgResponse]);

  // fetch industries (not cached yet)
  useEffect(() => {
    UserApiService.industryDetails()
      .then((response) => {
        const industryNames = response?.data?.details.map(
          (item) => item.industry_name
        );
        setIndustryData(industryNames || []);
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
  }, []);

  const handleSearch = (value) => setSearchText(value.toLowerCase());
  const debouncedSearchText = useDebounce(searchText, 500);

  const filterData = (type) => {
    const source = type === "Active" ? data : inActiveData;
    let filtered = source.filter((item) => {
      const matchesStatus =
        statusFilter.length === 0 || statusFilter.includes(filterStatusValue);
      const matchesIndustry =
        industryFilter.length === 0 ||
        industryFilter.some((ind) => item.industry.includes(ind));
      const matchesSector =
        sectorFilter.length === 0 || sectorFilter.includes(item.sector);
      const matchesSearchText =
        item.org_name.toLowerCase().includes(debouncedSearchText) ||
        item.org_email?.toString().includes(debouncedSearchText);
      return (
        matchesStatus && matchesSector && matchesIndustry && matchesSearchText
      );
    });

    if (sortOrder === "ascend")
      filtered.sort((a, b) => a.org_name.localeCompare(b.org_name));
    if (sortOrder === "descend")
      filtered.sort((a, b) => b.org_name.localeCompare(a.org_name));
    return filtered;
  };

  useEffect(() => {
    setFilteredData(filterData("Active"));
    setInActiveFilteredData(filterData("InActive"));
  }, [
    statusFilter,
    industryFilter,
    sectorFilter,
    debouncedSearchText,
    sortOrder,
    data,
    inActiveData,
  ]);

  // const paginatedData = filteredData.slice(
  //   (currentPage - 1) * pageSize,
  //   currentPage * pageSize
  // );
  // const inActivePaginatedData = inActiveFilteredData.slice(
  //   (inActiveCurrentPage - 1) * inactivePageSize,
  //   inActiveCurrentPage * inactivePageSize
  // );

  const handleModalOpen = (type, data) => {
    setModalData(data);
    setModalType(type);
    setIsModalVisible(true);
  };
  const handleModalClose = () => {
    setIsModalVisible(false);
    refetch(); // ✅ refresh only after modal actions
  };
  const handleClose = () => {
    setIsModalVisible(false);
    refetch();
  };

  const handleDelete = (orgId, type) => {
    let active = type === "Active" ? 0 : 1;
    OrganisationApiService.orgAccess(orgId, active)
      .then((response) => {
        setSnackData({
          show: true,
          message:
            response?.message ||
            (active
              ? API_SUCCESS_MESSAGE.ORG_ENABLED
              : API_SUCCESS_MESSAGE.ORG_DISABLED),
          type: "success",
        });
        refetch(); // ✅ refresh cache after mutation
      })
      .catch((errResponse) => {
        setSnackData({
          show: true,
          message:
            errResponse?.response?.data?.message ||
            API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
          type: "error",
        });
      });
  };

  const columns = (type) => [
    {
      title: LISTING_PAGE.ORG_NAME,
      dataIndex: "org_name",
      key: "org_name",
      render: (text, record) => (
        <>
          {record.org_logo ? (
            <Avatar
              sx={{ width: 40, height: 40 }}
              alt={record.org_name}
              src={record.org_logo}
            />
          ) : (
            <img
              src={Orgicon}
              width="32px"
              style={{ verticalAlign: "middle" }}
            />
          )}
          <span style={{ marginLeft: 10 }}>
            <a style={{ color: "#2ba9bc", cursor: "pointer" }}>{text}</a>
          </span>
        </>
      ),
    },
    { title: LISTING_PAGE.ORG_WEBSITE, dataIndex: "org_url", key: "org_url" },
    { title: LISTING_PAGE.INDUSTRY, dataIndex: "industry", key: "industry" },
    {
      title: LISTING_PAGE.ORG_ADDRESS,
      dataIndex: "org_address",
      key: "org_address",
      render: (address) => <span>{address || GENERIC_DATA_LABEL.NO_DATA}</span>,
    },
    {
      title: LISTING_PAGE.ORG_PRIMARY_EMAIL,
      dataIndex: "org_email",
      key: "org_email",
    },
    {
      title: LISTING_PAGE.ACTION,
      key: "action",
      width: "150px",
      render: (_, record) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            flexWrap: "wrap",
          }}
        >
          <Tooltip title="Edit organization details">
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
              type === "Active"
                ? `Disable ${record?.org_name}`
                : `Enable ${record?.org_name}`
            }
            onConfirm={() => handleDelete(record?.index, type)}
            okText="Confirm"
            cancelText="Cancel"
            icon={
              type === "Active" ? (
                <CloseCircleOutlined style={{ color: "red" }} />
              ) : (
                <CheckCircleOutlined style={{ color: "green" }} />
              )
            }
          >
            <Tooltip title={type === "Active" ? "Disable Org" : "Enable Org"}>
              <img
                src={type === "Active" ? disableUser : enableUser}
                width="26px"
              />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

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
          {/* Top Section */}
          <Space
            style={{
              width: "100%",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Button
              type="primary"
              onClick={() => handleModalOpen("new", null)}
              style={{
                background: "#2ba9bc",
                display: "flex",
                alignItems: "center",
                borderRadius: "20px",
              }}
            >
              <img src={addorgIcon} width="18px" />
              {BUTTON_LABEL.CREATE_ORGANIZATION}
            </Button>
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
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </FormControl>
              <Popover
                content={
                  <div style={{ padding: "10px", minWidth: "200px" }}>
                    <div style={{ marginTop: "10px" }}>
                      <label>
                        <b>Industry</b>
                      </label>
                      <MultiSelectWithChip
                        value={industryFilter}
                        onChange={setIndustryFilter}
                        options={industryData}
                        placeholder="Select Industry"
                      />
                    </div>
                    <div style={{ marginTop: "10px" }}>
                      <label>
                        <b>Sort Organization Name by:</b>
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
            </Space>
          </Space>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="basic tabs example"
            >
              <Tab label="Active Organization" {...a11yProps(0)} />
              <Tab label="Inactive Organization" {...a11yProps(1)} />
            </Tabs>
          </Box>
          <CustomTabPanel value={value} index={0}>
            <div style={{ overflowY: "auto", overflowX: "auto" }}>
              <Table
                columns={columns("Active")}
                // dataSource={paginatedData}
                dataSource={filteredData}
                rowKey="index"
                pagination={{
                  current: currentPage,
                  pageSize,
                  total: totalActiveOrgs,
                  onChange: (p, ps) => {
                    setCurrentPage(p);
                    setPageSize(ps);
                  },
                  showSizeChanger: true,
                }}
              />
            </div>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <div style={{ overflowY: "auto", overflowX: "auto" }}>
              <Table
                columns={columns("Inactive")}
                // dataSource={inActivePaginatedData}
                dataSource={inActiveFilteredData}
                rowKey="index"
                pagination={{
                  current: inActiveCurrentPage,
                  pageSize: inactivePageSize,
                  total: totalInactiveOrgs,
                  onChange: (p, ps) => {
                    setInActiveCurrentPage(p);
                    setInactivePageSize(ps);
                  },
                }}
              />
            </div>
          </CustomTabPanel>
        </Space>

        {/* Modal */}
        <Modal
          title={HEADING.CREATE_ORG}
          visible={isModalVisible}
          onCancel={handleModalClose}
          footer={null}
          width={800}
        >
          <OrgCreation
            onHandleClose={(e) => handleClose()}
            type={modalType}
            selecteddata={modalData}
          />
        </Modal>

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

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default OrganizationListing;
