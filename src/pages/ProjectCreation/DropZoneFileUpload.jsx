import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Modal, Select, message, Progress,Popconfirm } from "antd"; // Import Modal, Select, and Progress from Ant Design
import {
  FileImageOutlined,
  FilePdfOutlined,
  FileOutlined,
  FileTextOutlined,
  DeleteFilled,
  FileExcelOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import UploadIcon from "../../assets/images/icons/upload.svg";
import {
  API_ERROR_MESSAGE,
  API_SUCCESS_MESSAGE,
  FILE_TYPE,
  FORM_LABEL,
} from "shared/constants";
import { FileUploadApiService } from "services/api/FileUploadAPIService";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { Tooltip } from "@mui/material";

const { Option } = Select;

const DropZoneFileUpload = (props) => {
  const [uploadedFiles, setUploadedFiles] = useState([]); // State to store uploaded files
  const [error, setError] = useState(""); // State for error message
  const [selectedType, setSelectedType] = useState(""); // State for the selected document type
  const [tempFiles, setTempFiles] = useState([]); // State to temporarily hold files before type selection
  const [showModal, setShowModal] = useState(false); // State to control the modal visibility
  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });

  const MAX_FILES_COUNT = props.maxFile || 0;

  // Function to get the file type and return the respective icon
  const getFileIcon = (file) => {
    const fileType = file?.type?.split("/")[0]; // Get the main type like image, application, etc.
    switch (fileType) {
      case FILE_TYPE.IMAGE:
        return (
          <FileImageOutlined style={{ fontSize: "14px", color: "#ad6800" }} />
        );
      case FILE_TYPE.APPLICATION:
        if (file.type === FILE_TYPE.APPLICATION_PDF) {
          return (
            <FilePdfOutlined style={{ fontSize: "14px", color: "#a8071a" }} />
          );
        }
        if (
          file.type === FILE_TYPE.APPLICATION_EXCEL ||
          file.type === FILE_TYPE.APPLICATION_SHEET
        ) {
          return (
            <FileExcelOutlined style={{ fontSize: "14px", color: "#52c41a" }} />
          );
        }
        if (
          file.type === FILE_TYPE.APPLICATION_WORD ||
          file.type === FILE_TYPE.APPLICATION_OFFICE
        ) {
          return (
            <FileTextOutlined style={{ fontSize: "14px", color: "#40a9ff" }} />
          );
        }
        return <FileOutlined style={{ fontSize: "14px", color: "#595959" }} />;
      case FILE_TYPE.TEXT:
        if (file.type === FILE_TYPE.TEXT_CSV) {
          return (
            <FileExcelOutlined style={{ fontSize: "14px", color: "#52c41a" }} />
          );
        }
        return (
          <FileTextOutlined style={{ fontSize: "14px", color: "#40a9ff" }} />
        );
      default:
        return <FileOutlined style={{ fontSize: "14px", color: "#595959" }} />;
    }
  };

  useEffect(() => {
    props.handleSubmitDocument(uploadedFiles);
  }, [uploadedFiles]);

  // Function to convert file size from bytes to MB or KB
  const formatFileSize = (sizeInBytes) => {
    const sizeInMB = sizeInBytes / (1024 * 1024); // Convert bytes to MB
    if (sizeInMB < 1) {
      const sizeInKB = sizeInBytes / 1024; // Convert bytes to KB if less than 1 MB
      return `${sizeInKB.toFixed(2)} KB`;
    }
    return `${sizeInMB.toFixed(2)} MB`;
  };

  // Function to calculate total file size
  const getTotalSize = (files) => {
    return files.reduce((total, file) => total + file.size, 0);
  };

  // Function to handle removing a file from the list
  const removeFile = (fileDetails) => {
    const regex = /\/([^/]+)$/; // Match the part after the last "/"

    const match = fileDetails.path.match(regex);
    const filepayload = {
      imageKey: match[1],
    };

    FileUploadApiService.fileDelete(filepayload)
      .then((response) => {
        setSnackData({
          show: true,
          message:
            response?.message || API_SUCCESS_MESSAGE.DELETED_SUCCESSFULLY,
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

    setUploadedFiles((prevFiles) =>
      prevFiles.filter((file) => file.name !== fileDetails.name)
    );
  };

  // Function to handle file type selection in the modal
  const handleTypeChange = (value) => {
    setSelectedType(value);
  };

  const sortFile = (selectedTypeValue, files) => {
    let filesWithType = null;
    setShowModal(false);
    if (props.typeSelect === true) {
      filesWithType = tempFiles && tempFiles?.map((file) => ({
        path: file.path,
        relativePath: file.relativePath,
        name: file.name,
        size: file.size,
        type: file.type,
        documenttype: selectedTypeValue,
      }));
    } else {
      filesWithType = files && files?.map((file) => ({
        path: file.path,
        relativePath: file.relativePath,
        name: file.name,
        size: file.size,
        type: file.type,
        documenttype: selectedTypeValue,
      }));
    }

    setUploadedFiles((prevFiles) => [...prevFiles, ...filesWithType]);

    // Clear tempFiles and close the modal
    setTempFiles([]);
  };

  const handlePopupSubmit = () => {
    if (!selectedType) {
      message.error(API_ERROR_MESSAGE.PLEASE_SELECT_DOC_TYPE);
      return;
    }
    setShowModal(false);
    renderFileData(tempFiles);
  };

  const cancel = (e) => {
    console.log(e);
    // message.error('Click on No');
  };

  const renderFileData = async (files) => {

    const checkFileType = uploadedFiles?.map(data=>data.documenttype === FORM_LABEL.CUSTOM_REGULATORY)
    
    if (selectedType === FORM_LABEL.CUSTOM_REGULATORY || (checkFileType?.includes(true) && selectedType !==FORM_LABEL.PROJECT_DOCUMENT)) {
      if (files.length > 1 || checkFileType?.includes(true)) {
        setError(API_ERROR_MESSAGE.CUSTOM_REGULATORY_SINGLE_FILE_ONLY);
        return;
      }
    }

    const processedFiles = await Promise.all(
      files && files?.map(async (file) => {
        let uploadedLink = null;

        // Create a new FileReader to read the file as Base64
        const reader = new FileReader();

        const fileDataUrl = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject; // Handle any errors while reading the file
          reader.readAsDataURL(file); // Start reading the file
        });

        // Now that the file is read, upload the Base64 data to the API
        try {
          const fileType = file.name.split(".").pop();
          const filepayload = {
            documents: [fileDataUrl],
            type: fileType,
          };

          const response = await FileUploadApiService.fileUpload(filepayload, {
            // Track upload progress
            onUploadProgress: (progressEvent) => {
              const percent = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );

              setUploadedFiles((prevFiles) =>
              prevFiles && prevFiles?.map((uploadedFile) =>
                  uploadedFile.name === file.name
                    ? { ...uploadedFile, progress: percent }
                    : uploadedFile
                )
              );
            },
          });

          if (response) {
            setSnackData({
              show: true,
              message:
                response?.message || API_SUCCESS_MESSAGE.UPLOADED_SUCCESSFULLY,
              type: "success",
            });
          }
          setTempFiles([])

          return {
            relativePath: file.relativePath,
            name: file.name,
            size: file.size,
            type: file.type,
            documenttype:
              props.typeSelect === false
                ? props.maxFile === 0
                  ? "Project Document"
                  : ""
                : selectedType,
            path: response.data.details[0],
            uploadedOn: new Date(),
            progress: 100, // After successful upload, set progress to 100%
          };
        } catch (errResponse) {
          console.log("errResponse", errResponse);
          return null;
        }
      })
    );

    const validFiles = processedFiles.filter((file) => file !== null);

    setUploadedFiles((prevFiles) => [...prevFiles, ...validFiles]);
  };

  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    onDrop: (newFiles) => {
      const allFiles = [...uploadedFiles, ...newFiles];
      const totalSize = getTotalSize(allFiles);
       // Read files as binary and process them
       const checklistfile = document.getElementById("fileInput").files;
   
      if (allFiles.length > MAX_FILES_COUNT && MAX_FILES_COUNT !== 0) {
        setError(
          `You can upload up to ${MAX_FILES_COUNT} ${MAX_FILES_COUNT === 1 ? "file" : "files"} only.`
        );
        return;
      }

      if (totalSize > 200 * 1024 * 1024) {
        setError(API_ERROR_MESSAGE.FILE_SIZE_200MB);
      } else {
        setTempFiles(newFiles);

        // Only show the modal if the props.typeSelect prop is true
        if (props.typeSelect === true) {
          setShowModal(true);
        } else {
          if (!newFiles) {
            alert("Please select a file first!");
            return;
          }

          renderFileData(newFiles);
        }
        setError("");
      }
  },
});

  let files = null;
  if(uploadedFiles?.length >0)
  {
    files =uploadedFiles?.length >0 && uploadedFiles?.map((file) => (
          <li
            key={file.name}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <span style={{ marginRight: "10px" }}>{getFileIcon(file)}</span>
            <span style={{ flex: 1, width: "90%" }}>
              <Tooltip title={file.name} arrow>
                <span
                  style={{
                    width: "62%",
                    overflow: "hidden",
                    display: "inline-block",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    marginBottom:"-10px"
                  }}
                >
                  {file.name}{" "}
                </span>
              </Tooltip>
              <span
                style={{
                  color: "grey",
                  padding: "10px",
                  fontSize: "10px",
                }}
              >
                {formatFileSize(file.size)}
              </span>{" "}
              <span
                style={{ marginLeft: "10px", fontSize: "12px", color: "#2ba9bc" }}
              >
                {file.documenttype && `(${file.documenttype})`}
              </span>
              
              {/* Progress Bar */}
              {file?.progress !== undefined && (
                <Progress
                  percent={file?.progress}
                  size="small"
                  style={{ width: "90%", marginTop: "5px" }}
                  // format={(percent) => `${percent}%`}
                />
              )}
            </span>

            <Popconfirm
          title={`Delete file`}
          description="Are you sure you want to delete?"
          onConfirm={(e) => {e.preventDefault();removeFile(file)}}
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
            <button type="button"
              style={{ background: "transparent", border: "none" }}
              // onClick={() => removeFile(file)}
            >
              <DeleteFilled style={{ color: "#f5222d" }} />
            </button>
            </Popconfirm>
          </li>
        ));
  }
  else{

    files = tempFiles?.length >0 && tempFiles?.map((file) => (
          <li
            key={file.name}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <span style={{ marginRight: "10px" }}>{getFileIcon(file)}</span>
            <span style={{ flex: 1, width: "90%" }}>
              <Tooltip title={file.name} arrow>
                <span
                  style={{
                    width: "62%",
                    overflow: "hidden",
                    display: "inline-block",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    marginBottom:"-10px"
                  }}
                >
                  {file.name}{" "}
                </span>
              </Tooltip>
              <span
                style={{
                  color: "grey",
                  padding: "10px",
                  fontSize: "10px",
                }}
              >
                {formatFileSize(file.size)}
              </span>{" "}
              <span
                style={{ marginLeft: "10px", fontSize: "12px", color: "#2ba9bc" }}
              >
                {file.documenttype && `(${file.documenttype})`}
              </span>
              
              {/* Progress Bar */}
              
                <Progress
                  percent={0}
                  size="small"
                  style={{ width: "90%", marginTop: "5px" }}
                  // format={(percent) => `${percent}%`}
                />
              
            </span>

            <Popconfirm
          title={`Delete file`}
          description="Are you sure you want to delete?"
          onConfirm={(e) => {e.preventDefault(); removeFile(file)}}
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
            
            </Popconfirm>
          </li>
        ));
  }
  const totalFileSize = getTotalSize(uploadedFiles);
  const formattedTotalFileSize = formatFileSize(totalFileSize);
  return (
    <section
      className="container"
      style={{
        border: "1px dashed #aba8a8",
        padding: "10px",
        borderRadius: "10px",
      }}
    >
      <h4 style={{ fontWeight: 500, margin: "4px" }}>{props.label}</h4>
      <div
        {...getRootProps({ className: "dropzone" })}
        style={{
          display: "flex",
          textAlign: "center",
          padding: "20px",
          borderRadius: "8px",
          border: "1px dashed #aba8a8",
        }}
      >
        <input type="file" id="fileInput" {...getInputProps()} />
        <img src={UploadIcon} alt="UploadIcon" width={130} />
        <p style={{ alignContent: "center", margin: "auto" }}>
          {FORM_LABEL.DRAG_DROP_FILE}
        </p>
      </div>

      {/* Modal for selecting file type */}
      <Modal
        title={FORM_LABEL.DOCUMENT_TYPE}
        visible={showModal}
        onCancel={() => setShowModal(false)} // Close modal on cancel
        width={400} // Modal width
        onOk={handlePopupSubmit} // Submit handler for "OK"
        okButtonProps={{
          disabled: !selectedType, // Disable the OK button if no type is selected
        }}
        >
        <Select
          value={selectedType}
          onChange={handleTypeChange}
          style={{ width: "100%", marginTop: "20px" }}
          placeholder={FORM_LABEL.SELECT_TYPE}
        >
          <Option value={FORM_LABEL.PROJECT_DOCUMENT}>
            {FORM_LABEL.PROJECT_DOCUMENT}
          </Option>
          <Option value={FORM_LABEL.CUSTOM_REGULATORY}>
            {FORM_LABEL.CUSTOM_REGULATORY}
          </Option>
        </Select>

        {!selectedType && (
          <p style={{ color: "red", fontSize: "12px" }}>
            {API_ERROR_MESSAGE.PLEASE_SELECT_DOC_TYPE}
          </p>
        )}
      </Modal>

      {/* Snackbar for success/error messages */}
      {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}

      <aside>
        <h5>
          {FORM_LABEL.TOTAL_FILE_SIZE}: {formattedTotalFileSize}
        </h5>
        <ul>{files}</ul>
      </aside>
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
     

      {/* File List and Progress Bar */}
      
      </section>
  );
};

export default DropZoneFileUpload;
