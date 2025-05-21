import React, { useEffect, useState } from "react";
import {
  Space,
  Table,
  ConfigProvider,
  Empty,
  Button,
  Spin,
  Tooltip,
  Popconfirm,
} from "antd";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloudSyncOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { AdminConfigAPIService } from "services/api/AdminConfigAPIService";
import {
  API_ERROR_MESSAGE,
  LISTING_PAGE,
  API_SUCCESS_MESSAGE,
  GENERIC_DATA_LABEL,
  FORM_LABEL,
} from "shared/constants";
import trashIcon from "../../assets/images/icons/trash4.svg";

import { Modal } from "antd";
import { Tab, Tabs } from "@mui/material";

const StandardListing = () => {
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Track the current page
  const [pageSize, setPageSize] = useState(5); // Number of rows per page
  const [loading, setLoading] = useState(true);

  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState("");

  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });

  const [tabsValue, setTabsValue] = useState(0);
  const [userUploadData, setUserUploadData] = useState([]);
  const [userUploadFilterData, setUserUploadFilterData] = useState([]);
  const [currentPageUserUpload, setCurrentPageUserUpload] = useState(1); // Track the current page
  const [pageSizeUserUpload, setPageSizeUserUpload] = useState(5); // Number of rows per page

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    AdminConfigAPIService.standardListing()
      .then((response) => {
        // Check the response structure and map data accordingly
        if (response?.data?.details) {
          setData(response?.data?.details);
          setCurrentPage(1);
          setFilteredData(response?.data?.details);
        }

        if (response?.data?.userRegulatories) {
          setUserUploadData(response?.data?.userRegulatories);
          setUserUploadFilterData(response?.data?.userRegulatories);
        }
        setLoading(false);

        setSnackData({
          show: true,
          message:
            response?.message || API_SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY,
          type: "success",
        });
      })
      .catch((errResponse) => {
        setLoading(false);
        setSnackData({
          show: true,
          message:
            errResponse?.error?.message ||
            API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
          type: "error",
        });
      });
  };

  const handleViewText = (content) => {
    setModalContent(content); // Set the content to display in the modal
    setViewModalVisible(true); // Open the modal
  };

  const handleCopyText = () => {
    navigator.clipboard
      .writeText(modalContent)
      .then(() => {
        setSnackData({
          show: true,
          message: "Text copied to clipboard!",
          type: "success",
        });
      })
      .catch((err) => {
        setSnackData({
          show: true,
          message: "Failed to copy text.",
          type: "error",
        });
      });
  };

  // Debounced search
  const handleSearch = (value) => {
    const searchText = value.toLowerCase();
    setSearchText(searchText);
  };

  const debouncedSearchText = useDebounce(searchText, 500);

  // Centralized filtering logic
  useEffect(() => {
    if (tabsValue === 0) {
      const filtered = data.filter((item) =>
        item.standard_name.toLowerCase().includes(debouncedSearchText)
      );
      setFilteredData(filtered);
    } else if (tabsValue === 1) {
      const filtered = userUploadData.filter((item) =>
        item.regulatory_standard.toLowerCase().includes(debouncedSearchText)
      );
      setUserUploadFilterData(filtered);
    }
  }, [debouncedSearchText, data, userUploadData]);

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

  const runChecklistAPI = (file, id, satndardName) => {
    let fileName = file;

    if (fileName !== undefined) {
      const regex = /\/([^/]+)$/; // Match the part after the last "/"
      const match = fileName?.match(regex);

      const payload = new FormData();
      payload.append("imageKey", match?.[1]);
      payload.append("standard_id", id);
      payload.append("standard_name", satndardName);

      AdminConfigAPIService.standardChecklistUpdate(payload)
        .then((response) => {
          console.log("response", response);
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
    }
  };

  // Table columns
  const columns = [
    {
      title: LISTING_PAGE.INDUSTRY,
      dataIndex: "industry_name",
      key: "industry_name",
      render: (text) => text, // Directly display the role_name
      filterSearch: true,
      onFilter: (value, record) =>
        record.industry_name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: LISTING_PAGE.STANDARD_NAME,
      dataIndex: "standard_name",
      key: "standard_name",
      render: (text) => text, // Directly display the role_name
      filterSearch: true,
      onFilter: (value, record) =>
        record.standard_name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: LISTING_PAGE.CHECKLIST_GENERATED,
      dataIndex: "checkListResponse",
      key: "checkListResponse",
      render: (text) => (
        <>
          <Button
            style={{
              border: "none",
              background: "transparent",
              boxShadow: "none",
            }}
          >
            {text ? (
              <CheckCircleOutlined style={{ color: "green" }} />
            ) : (
              <CloseCircleOutlined style={{ color: "red" }} />
            )}
          </Button>
          <Button
            style={{
              border: "none",
              background: "transparent",
              boxShadow: "none",
            }}
            onClick={() => handleViewText(text)} // Pass the text to display
          >
            View
          </Button>
        </>
      ), // Directly display the role_name
    },
    {
      title: LISTING_PAGE.ACTION,
      key: "action",
      render: (_, record) => {
        return (
          <>
            {/* {record?.checkListResponse === null || record?.checkListResponse === "" ? */}
            <Tooltip
              title={
                record?.checkListResponse === null ||
                record?.checkListResponse === ""
                  ? "Run checklist for this standard"
                  : "Re-Run the checklist for the satndard"
              }
            >
              <Button
                style={{
                  border: "none",
                  background: "transparent",
                  boxShadow: "none",
                }}
                onClick={() =>
                  runChecklistAPI(
                    record.standard_url,
                    record.standard_id,
                    record.standard_name
                  )
                }
              >
                {/* <UploadOutlined /> */}
                <CloudSyncOutlined style={{ fontSize: "20px" }} />
              </Button>
            </Tooltip>
            {/* :""} */}
            <Popconfirm
              title={`Delete  ${record.standard_name} Standard`}
              description="Are you sure you want to delete?"
              onConfirm={(e) => {
                e.preventDefault();
                handleDelete(record.standard_id);
              }}
              onCancel={cancel}
              okText="Confirm"
              cancelText="Cancel"
              icon={
                <CloseCircleOutlined
                  style={{
                    color: "red",
                  }}
                />
              }
            >
              <Tooltip title="Delete Standard">
                <img src={trashIcon} width="22px" />
              </Tooltip>
            </Popconfirm>
          </>
        );
      },
    },
  ];

  const cancel = (e) => {
    console.log(e);
    // message.error('Click on No');
  };

  // Handle delete action
  const handleDelete = (id) => {
    // Implement your delete logic here
    AdminConfigAPIService.standardDelete(id)
      .then((response) => {
        // Check the response structure and map data accordingly
        setLoading(false);

        setSnackData({
          show: true,
          message: response?.message || API_SUCCESS_MESSAGE.STANDARD_DELETED,
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
            errResponse.response?.data?.message === "This regulatory is in use"
              ? "Can't delete this standard, it is already used in project creation"
              : API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
          type: "error",
        });
      });
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

  // Pagination logic
  const userUploadPaginationData = userUploadFilterData.slice(
    (currentPageUserUpload - 1) * pageSizeUserUpload,
    currentPageUserUpload * pageSizeUserUpload
  );

  const handleUserUploadPagination = (page, pageSize) => {
    setCurrentPageUserUpload(page);
    setPageSizeUserUpload(pageSize);
  };

  const userUploadedTableColumns = [
    {
      title: LISTING_PAGE.INDUSTRY,
      dataIndex: "industry_name",
      key: "industry_name",
      render: (text) => text, // Directly display the role_name
      filterSearch: true,
      onFilter: (value, record) =>
        record.industry_name.toLowerCase().includes(value.toLowerCase()),
    },

    {
      title: LISTING_PAGE.STANDARD_NAME,
      dataIndex: "regulatory_standard",
      key: "regulatory_standard",

      render: (text) => text, // Directly display the role_name
      filterSearch: true,
      onFilter: (value, record) =>
        record.regulatory_standard.toLowerCase().includes(value.toLowerCase()),
    },

    {
      title: LISTING_PAGE.USER_NAME,
      dataIndex: "created_by_name",
      key: "created_by_name",
      render: (text) => text, // Directly display the role_name
      filterSearch: true,
      onFilter: (value, record) =>
        record.created_by_name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: LISTING_PAGE.ORG_NAME,
      dataIndex: "org_name",
      key: "org_name",
      render: (text) => text, // Directly display the role_name
      filterSearch: true,
      onFilter: (value, record) =>
        record.org_name.toLowerCase().includes(value.toLowerCase()),
    },

    {
      title: LISTING_PAGE.PROJECT_NAME,
      dataIndex: "project_name",
      key: "index",
      render: (text) => text, // Directly display the role_name
      filterSearch: true,
      onFilter: (value, record) =>
        record.project_name.toLowerCase().includes(value.toLowerCase()),
    },

    {
      title: LISTING_PAGE.CHECKLIST_GENERATED,
      dataIndex: "checkListResponse",
      key: "checkListResponse",
      render: (text) => (
        <>
          <Button
            style={{
              border: "none",
              background: "transparent",
              boxShadow: "none",
            }}
            onClick={() => handleViewText(text)} // Pass the text to display
          >
            View
          </Button>
        </>
      ), // Directly display the role_name
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
            {/* Search Input */}
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
            </Space>
          </Space>

          <Tabs value={tabsValue} onChange={handleTabChange}>
            <Tab label="Admin Uploaded" {...tabHeaders(0)} />
            <Tab label="User Uploaded" {...tabHeaders(1)} />
          </Tabs>
          {tabsValue === 0 ? (
            <Table
              columns={columns}
              dataSource={paginatedData}
              rowKey="sector_id" // Unique key for each row
              pagination={{
                current: currentPage,
                pageSize,
                total: filteredData.length,
                onChange: handlePaginationChange,
              }}
            />
          ) : (
            <Table
              columns={userUploadedTableColumns}
              dataSource={userUploadPaginationData}
              rowKey={"index"}
              pagination={{
                current: currentPageUserUpload,
                pageSize: pageSizeUserUpload,
                total: userUploadFilterData.length,
                onChange: handleUserUploadPagination,
              }}
            />
          )}

          <Modal
            title="View Text"
            visible={viewModalVisible}
            onCancel={() => setViewModalVisible(false)}
            footer={[
              // <Button key="copy" onClick={handleCopyText}>
              //   Copy Text
              // </Button>,
              <Button key="close" onClick={() => setViewModalVisible(false)}>
                Close
              </Button>,
            ]}
            width={"800px"}
          >
            <div
              style={{
                whiteSpace: "pre-wrap", // Preserve whitespace and line breaks
                wordWrap: "break-word", // Allow long words to break and avoid overflow
              }}
            >
              {/* {modalContent} */}
              {modalContent?.checklist?.map((data) => {
                return <div style={{ margin: "10px 0px" }}>{data}</div>;
              })}
            </div>
          </Modal>
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

export default StandardListing;
