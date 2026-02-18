import { SearchOutlined } from "@ant-design/icons";
import {
  Alert,
  Box,
  Chip,
  FormControl,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Snackbar,
  Stack,
} from "@mui/material";
import { ConfigProvider, Empty, Space, Spin, Table } from "antd";
import { useEffect, useState } from "react";
import {
  API_ERROR_MESSAGE,
  API_SUCCESS_MESSAGE,
  FORM_LABEL,
  GENERIC_DATA_LABEL,
  LISTING_PAGE,
} from "shared/constants";
import projectIcon from "../../assets/images/icons/projectIcon3.svg";
import { getStatusChipProps } from "shared/utility";
import { ProjectApiService } from "services/api/ProjectAPIService";
import { useNavigate } from "react-router";

const createData = (
  index,
  project_id,
  project_no,
  project_name,
  industry,
  regulatory_standard,
  status
) => {
  return {
    index,
    project_id,
    project_no,
    project_name,
    industry,
    regulatory_standard,
    status,
  };
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

const ExternalProjectListing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });

  const [projectData, setProjectData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const debouncedSearchText = useDebounce(searchText, 500);
  const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));
  const userRole = userdetails?.[0]?.role_name;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setFilteredData(filterData());
  }, [debouncedSearchText]);

  const filterData = () => {
    return projectData.filter((item) => {
      const matchesSearchText =
        item.project_name?.toLowerCase().includes(debouncedSearchText) ||
        item.regulatory_standard?.toLowerCase().includes(debouncedSearchText);
      return matchesSearchText;
    });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      ProjectApiService.externalProjectListing().then((res) => {
        if (res?.status) {
          setSnackData({
            show: true,
            message:
              res?.data?.message || API_SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY,
            type: "success",
          });

          const resultData = res?.data?.details?.map((item, index) => {
            return createData(
              index || 0,
              item?.project_id || 0,
              item?.project_no || 0,
              item?.project_name || "",
              item?.industry || "",
              item?.regulatory_standard || "",
              item?.status || ""
            );
          });
          setProjectData(resultData);
          setFilteredData(resultData);
        }
      });
    } catch (error) {
      setSnackData({
        show: true,
        message:
          error?.error?.message || API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserSearch = (value) => {
    const searchText = value.toLowerCase();
    setSearchText(searchText);
  };

  const handleNavigateToProject = (project_id) => {
    navigate(`/externalProjectView/${project_id}`, {
      state: { project_id },
    });
  };

  const handlePaginationChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
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
            onClick={() => handleNavigateToProject(record.project_id, "view")}
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
      title: LISTING_PAGE.REGULATORY_SANTARDS,
      dataIndex: "regulatory_standard",
      key: "regulatory_standard",
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
      onFilter: (value, record) => {
        // Modify the filter logic if status is an array or single value
        const statusArray = Array.isArray(record.status)
          ? record.status
          : [record.status];
        return statusArray.includes(value);
      },
    },
  ];

  return (
    <Spin tip="Loading..." size="large" spinning={loading}>
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
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Space
              style={{
                width: "100%",
                // justifyContent: "space-between",
                // alignItems: "center",
                alignSelf: "flex-end",
              }}
            >
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
                  onChange={(e) => handleUserSearch(e.target.value)}
                />
              </FormControl>
            </Space>
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
          </Box>
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

export default ExternalProjectListing;
