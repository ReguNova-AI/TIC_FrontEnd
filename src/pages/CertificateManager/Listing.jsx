import React, { useEffect, useState } from "react";
import { Space, Table, ConfigProvider, Empty, Button, Spin, Modal } from "antd";
import { Chip } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
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
} from "shared/constants";
import { formatDate, getStatusChipProps } from "shared/utility";
import { CertificateApiService } from "services/api/CertificateAPIService";
import CreateCertificate from "./CreateCertificate";
import { FileUploadApiService } from "services/api/FileUploadAPIService";
import certificateIcon from "../../assets/images/icons/certificateIcon.svg";
import addCertificateIcon from "../../assets/images/icons/addCertificate.svg";


const Listing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { filterStatusValue } = location.state || {}; // Receive initial status filter
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Track the current page
  const [pageSize, setPageSize] = useState(10); // Number of rows per page
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false); // To control modal visibility

  const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));

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
  }, [filterStatusValue]);

  const createData = (
    index,
    certificate_name,
    certificate_status,
    certificate_subject,
    created_at,
    created_by_id,
    created_by_name,
    date_of_expiry,
    date_of_issued,
    file_name,
    file_url,
    industry_id,
    industry_name,
    issuer,
    org_id,
    org_name,
    sector_id,
    sector_name,
    updated_at
  ) => {

    const today = new Date();
  today.setHours(0, 0, 0, 0); // Set time to midnight to only compare date

  // Check if the expiry date is greater than today
  const expiryDate = new Date(date_of_expiry);
  expiryDate.setHours(0, 0,  0, 0);
  
  // // If the expiry date is in the past, set status to 'Expired'
  // console.log("expiryDate",expiryDate,"today",today)
  // const finalStatus = expiryDate < today ? 'Expired' : certificate_status;

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');  // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  const todayString = formatDate(today);
  const expiryDateString = formatDate(expiryDate);

// Compare the dates (now they are just "YYYY-MM-DD")
const finalStatus = expiryDateString < todayString ? 'Expired' : certificate_status;



    return {
      index,
      certificate_name,
      certificate_status:finalStatus,
      certificate_subject,
      created_at,
      created_by_id,
      created_by_name,
      date_of_expiry,
      date_of_issued,
      file_name,
      file_url,
      industry_id,
      industry_name,
      issuer,
      org_id,
      org_name,
      sector_id,
      sector_name,
      updated_at,
    };
  };

  const fetchData = () => {
    let userid = userdetails?.[0]?.user_id;
    CertificateApiService.certificateListing(userid)
      .then((response) => {
        // On success, you can add any additional logic here
        setSnackData({
          show: true,
          message:
            response?.message || API_SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY,
          type: "success",
        });

        const newData = response?.data?.details.map((certificate, index) => {
          return createData(
            certificate.certificate_id,
            certificate.certificate_name,
            certificate.certificate_status,
            certificate.certificate_subject,
            certificate.created_at,
            certificate.created_by_id,
            certificate.created_by_name,
            certificate.date_of_expiry ? formatDate(certificate.date_of_expiry) : "",
            certificate.date_of_issued ? formatDate(certificate.date_of_issued) : "",
            certificate.file_name,
            certificate.file_url,
            certificate.industry_id,
            certificate.industry_name,
            certificate.issuer,
            certificate.org_id,
            certificate.org_name,
            certificate.sector_id,
            certificate.sector_name,
            certificate.updated_at
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
      const matchesSearchText =
        item.certificate_name.toLowerCase().includes(debouncedSearchText) ||
        item.certificate_subject.toString().includes(debouncedSearchText) ||
        item.issuer.toString().includes(debouncedSearchText);

      return matchesSearchText;
    });
  };

  // Effect for updating filtered data based on filters
  useEffect(() => {
    setFilteredData(filterData());
  }, [debouncedSearchText]);

  // Handle project navigation
  const handleNavigateToProject = (projectNo) => {
    // navigate(`/projectView/${projectNo}`, { state: { projectNo } });
    console.log("redirect here");
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

  const downloadFile=(url,fileName)=>{

    const regex = /\/([^/]+)$/;  // Match the part after the last "/"

const match = url.match(regex);
const d=[]
const filepayload = {
  imageKeys:[match[1]],
}
const extension = match?.[1].split('.').pop();

FileUploadApiService.fileget(filepayload).then((response) => {

  const base64FileData = response?.data[0]?.response; // The Base64 string from the response
  if (!base64FileData) {
    // Handle error if the response doesn't contain Base64 data
    setSnackData({
      show: true,
      message: "File data is missing.",
      type: "error",
    });
    return;
  }

  // If the Base64 string contains a data URI prefix, strip it
  // const base64Data = base64FileData.split(',')[1]; // Remove the 'data:<mime-type>;base64,' prefix, if it exists

  // Decode the Base64 data into binary
  const binaryData = atob(base64FileData); // Decode Base64 to binary string
  const byteArray = new Uint8Array(binaryData.length);

  // Populate the Uint8Array with the binary data
  for (let i = 0; i < binaryData.length; i++) {
    byteArray[i] = binaryData.charCodeAt(i);
  }

  // Create a Blob object from the byteArray (you need to specify the correct MIME type for your file)
  const mimeType = 'application/octet-stream'; // Change this based on the actual file type
  const blob = new Blob([byteArray], { type: mimeType });


  // Create a temporary download link
  const url = window.URL.createObjectURL(blob);

  // Create a link element and set the download attributes
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}`; // You can dynamically set this to the desired filename

  // Append the link to the document body and simulate a click to trigger the download
  document.body.appendChild(link);
  link.click();

  // Clean up the URL object and remove the link
  window.URL.revokeObjectURL(url);
  link.remove();
  // On success, you can add any additional logic here
  setSnackData({
    show: true,
    message:
      response?.message || API_SUCCESS_MESSAGE.DOWNLOADED_SUCCESSFULLY,
    type: "success",
  });
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

  // Table columns
  const columns = [
    {
      title: LISTING_PAGE.CERTIFICATE_NAME,
      dataIndex: "certificate_name",
      key: "certificate_name",
      render: (text, record) => {
        return(
          <>
          <img src={certificateIcon} width="24px" style={{verticalAlign:"middle",marginRight:"10px"}} />
        <a
          onClick={() => handleNavigateToProject(record.index)}
          style={{ color: "#2ba9bc", cursor: "pointer" }}
        >
          {text}
        </a>
        </>
      )},
      filterSearch: true,
      onFilter: (value, record) =>
        record.certificate_name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: LISTING_PAGE.CERTIFICATE_SUBJECT,
      dataIndex: "certificate_subject",
      key: "certificate_subject",
      filterSearch: true,
      onFilter: (value, record) => record.certificate_subject.includes(value),
    },
    {
      title: LISTING_PAGE.ISSUER,
      dataIndex: "issuer",
      key: "issuer",
      filterSearch: true,
      onFilter: (value, record) => record.issuer.includes(value),
    },
    {
      title: LISTING_PAGE.DATE_OF_ISSUE,
      dataIndex: "date_of_issued",
      key: "date_of_issued",
    },
    {
      title: LISTING_PAGE.DATE_OF_EXPIRE,
      dataIndex: "date_of_expiry",
      key: "date_of_expiry",
    },
    {
      title: LISTING_PAGE.FILE_UPLOADED,
      dataIndex: "file_name",
      key: "file_name",
      render: (value,record) => {
        // Return the mapped JSX elements
        return (
          <>
          <span style={{display: "inline-block",whiteSpace:"break-spaces",overflow:"hidden",textOverflow:"ellipsis",width:"90%",  marginRight:"10px"}}>{value}</span> <DownloadOutlined onClick={(e)=>downloadFile(record.file_url,value)}/>
          </>
        );
      }
    },
    {
      title: LISTING_PAGE.STATUS,
      key: "certificate_status",
      dataIndex: "certificate_status",
      render: (_, { certificate_status }) => {
        // Check if status is an array, and handle accordingly
        const statusArray = Array.isArray(certificate_status)
          ? certificate_status
          : [certificate_status];

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
      // onFilter: (value, record) => {
      //   // Modify the filter logic if status is an array or single value
      //   const statusArray = Array.isArray(record.status)
      //     ? record.status
      //     : [record.status];
      //   return statusArray.includes(value);
      // },
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
              onClick={() => handleModalOpen()}
              style={{
                background: "#2ba9bc",
                display: "flex",
                alignItems: "center",
                borderRadius: "20px",
              }}
            >
              {/* <FileFilled style={{ marginRight: 4 }} /> */}
              <img src={addCertificateIcon} width="20px" /> 
              {BUTTON_LABEL.UPLOAD_CERTIFICATE}
            </Button>

            {/* Search Input and Popover Filter */}
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
              {/* <Button>
                <DownloadOutlined />
              </Button> */}
            </Space>
          </Space>
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
        </Space>
        <Modal
          title={FORM_LABEL.CERTIFICATE_UPLOAD}
          visible={isModalVisible}
          onCancel={handleModalClose}
          footer={null}
          width={800}
        >
          <CreateCertificate onHandleClose={(e) => handleClose()} />
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

export default Listing;
