import React, { useEffect, useState } from "react";
import { Space, Table, ConfigProvider, Empty, Button, Spin, Tooltip,Popconfirm } from "antd";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import { CloseCircleOutlined, DeleteFilled, SearchOutlined } from "@ant-design/icons";
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

const SectorListing = () => {
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Track the current page
  const [pageSize, setPageSize] = useState(10); // Number of rows per page
  const [loading, setLoading] = useState(true);
  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    AdminConfigAPIService.sectorListing()
      .then((response) => {
        // Check the response structure and map data accordingly
        if (response?.data?.details) {
          const newData = response?.data?.details.map((sector) => ({
            sector_id: sector.sector_id,
            sector_name: sector.sector_name, // Ensure sector_name is included
          }));
          setData(newData);
          setCurrentPage(1);
          setFilteredData(newData);
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

  // Debounced search
  const handleSearch = (value) => {
    const searchText = value.toLowerCase();
    setSearchText(searchText);
  };

  const debouncedSearchText = useDebounce(searchText, 500);

  // Centralized filtering logic
  useEffect(() => {
    const filtered = data.filter((item) =>
      item.sector_name.toLowerCase().includes(debouncedSearchText)
    );
    setFilteredData(filtered);
  }, [debouncedSearchText, data]);

  // Handle pagination change
  const handlePaginationChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const cancel = (e) => {
    console.log(e);
    // message.error('Click on No');
  };

  // Pagination logic
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Table columns
  const columns = [
    {
      title: LISTING_PAGE.SECTOR,
      dataIndex: "sector_name",
      key: "sector_name",
      render: (text) => text, // Directly display the sector_name
      filterSearch: true,
      onFilter: (value, record) =>
        record.sector_name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: LISTING_PAGE.ACTION,
      key: "action",
      render: (_, record) => (
        // <Button
        //   style={{ border: "none" }}
        //   onClick={() => handleDelete(record.sector_id)}
        // >
        //   <DeleteFilled />
        // </Button>
        <Popconfirm
          title={`Delete  ${record.sector_name} Sector`}
          description="Are you sure you want to delete?"
          onConfirm={(e) => handleDelete(record.sector_id)}
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
          <Tooltip title="Delete Sector" >
          <img src={trashIcon} width="22px"/>
        </Tooltip>
        </Popconfirm>

        
      ),
    },
  ];

  // Handle delete action
  const handleDelete = (id) => {
    // Implement your delete logic here
    console.log("Delete sector with id:", id);
    AdminConfigAPIService.sectorDelete(id)
      .then((response) => {
        // Check the response structure and map data accordingly
        console.log("response",response)
        setLoading(false);

        setSnackData({
          show: true,
          message:
            response?.message || API_SUCCESS_MESSAGE.SECTOR_DELETED,
          type: "success",
        });
        fetchData();
      })
      .catch((errResponse) => {
        setLoading(false);
        console.log("errResponse",errResponse.response?.data?.message)
        setSnackData({
          show: true,
          message:
          errResponse.response?.data?.message ==="This sector is in use" ? "Can't delete this sector it is already used for user/organization/project creation" :
            API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
          type: "error",
        });
      });

  };

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

        <Snackbar
        style={{top:"80px"}}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          open={snackData.show}
          autoHideDuration={9000}
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

export default SectorListing;
