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
  Modal,
} from "antd";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import {
  CloseCircleOutlined,
  DeleteFilled,
  EditOutlined,
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
import IndustryCreation from "./IndustryCreation";
import { useIndustryListing } from "components/hooks/useIndustryListing";

const IndustriesListing = () => {
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Track the current page
  const [pageSize, setPageSize] = useState(10); // Number of rows per page
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState("");
  const [modalData, setModalData] = useState({});
  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });

  // Fetch data
  // useEffect(() => {
  //   fetchData();
  // }, []);

  // const fetchData = () => {
  //   AdminConfigAPIService.industryListing()
  //     .then((response) => {
  //       // Check the response structure and map data accordingly
  //       if (response?.data?.details) {
  //         const newData = response?.data?.details.map((industry) => ({
  //           industry_id: industry.industry_id,
  //           industry_name: industry.industry_name,
  //           sector_name : industry.sector_name
  //         }));
  //         setData(newData);
  //         setCurrentPage(1);
  //         setFilteredData(newData);
  //       }
  //       setLoading(false);

  //       setSnackData({
  //         show: true,
  //         message:
  //           response?.message || API_SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY,
  //         type: "success",
  //       });
  //     })
  //     .catch((errResponse) => {
  //       setLoading(false);
  //       setSnackData({
  //         show: true,
  //         message:
  //           errResponse?.error?.message ||
  //           API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
  //         type: "error",
  //       });
  //     });
  // };

  const {
    data: industryResponse,
    isLoading,
    isError,
    error,
    isSuccess,
    refetch: fetchData,
  } = useIndustryListing(currentPage, pageSize);

  // 🔄 When API call succeeds, transform and store in state
  useEffect(() => {
    if (isSuccess && industryResponse?.details) {
      const newData = industryResponse.details.map((industry) => ({
        industry_id: industry.industry_id,
        industry_name: industry.industry_name,
        sector_name: industry.sector_name,
      }));

      setData(newData);
      setFilteredData(newData);
    }
  }, [isSuccess, industryResponse]);

  // 🔄 Handle errors
  useEffect(() => {
    if (isError) {
      setSnackData({
        show: true,
        message:
          error?.response?.data?.message ||
          API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
        type: "error",
      });
    }
  }, [isError, error]);

  // Debounced search
  const handleSearch = (value) => {
    const searchText = value.toLowerCase();
    setSearchText(searchText);
  };

  const debouncedSearchText = useDebounce(searchText, 500);

  // Centralized filtering logic
  useEffect(() => {
    const filtered = data.filter(
      (item) =>
        item.industry_name.toLowerCase().includes(debouncedSearchText) ||
        item.sector_name.toLowerCase().includes(debouncedSearchText)
    );
    setFilteredData(filtered);
  }, [debouncedSearchText, data]);

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

  const handleModalOpen = (type, data) => {
    console.log("data", data);
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

  // Table columns
  const columns = [
    {
      title: LISTING_PAGE.INDUSTRY,
      dataIndex: "industry_name",
      key: "industry_name",
      render: (text) => text, // Directly display the industry_name
      filterSearch: true,
      onFilter: (value, record) =>
        record.industry_name.toLowerCase().includes(value.toLowerCase()),
    },
    // {
    //     title: LISTING_PAGE.SECTOR,
    //     dataIndex: "sector_name",
    //     key: "sector_name",
    //     render: (text) => text, // Directly display the sector_name
    //     filterSearch: true,
    //     onFilter: (value, record) =>
    //       record.sector_name.toLowerCase().includes(value.toLowerCase()),
    //   },

    {
      title: LISTING_PAGE.ACTION,
      key: "action",
      render: (_, record) => {
        return (
          <>
            <Tooltip title="Edit industry details">
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
              title={`Delete  ${record.industry_name} Industry`}
              description="Are you sure you want to delete?"
              onConfirm={(e) => {
                e.preventDefault();
                handleDelete(record.industry_id);
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
              <Tooltip title="Delete Industry">
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
    AdminConfigAPIService.industryDelete(id)
      .then((response) => {
        // Check the response structure and map data accordingly
        // console.log("response",response)
        setLoading(false);

        setSnackData({
          show: true,
          message: response?.message || API_SUCCESS_MESSAGE.INDUSTRY_DELETED,
          type: "success",
        });
        fetchData();
      })
      .catch((errResponse) => {
        setLoading(false);
        setSnackData({
          show: true,
          message:
            errResponse.response?.data?.message === "This industry is in use"
              ? "Can't delete this industry it is already used for user/organization/project creation"
              : API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
          type: "error",
        });
      });
  };

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
        </Space>

        <Modal
          title={"Industries"}
          visible={isModalVisible}
          onCancel={handleModalClose}
          footer={null}
          width={800}
        >
          <IndustryCreation
            onHandleClose={(e) => handleClose()}
            type={"edit"}
            selecteddata={modalData}
          />
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

export default IndustriesListing;
