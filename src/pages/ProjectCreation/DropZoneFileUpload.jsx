import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Modal, Select, message } from "antd"; // Import Modal and Select from Ant Design
import {
  FileImageOutlined,
  FilePdfOutlined,
  FileOutlined,
  FileTextOutlined,
  DeleteFilled,
  FileExcelOutlined,
} from "@ant-design/icons";
import UploadIcon from "../../assets/images/icons/upload.svg";
import { API_ERROR_MESSAGE, FILE_TYPE, FORM_LABEL } from "shared/constants";
import { FileUploadApiService } from "services/api/FileUploadAPIService";

const { Option } = Select;

const DropZoneFileUpload = (props) => {
  const [uploadedFiles, setUploadedFiles] = useState([]); // State to store uploaded files
  const [error, setError] = useState(""); // State for error message
  const [selectedType, setSelectedType] = useState(""); // State for the selected document type
  const [tempFiles, setTempFiles] = useState([]); // State to temporarily hold files before type selection
  const [showModal, setShowModal] = useState(false); // State to control the modal visibility

  const MAX_FILES_COUNT = props.maxFile || 0;

  // Function to get the file type and return the respective icon
  const getFileIcon = (file) => {
    const fileType = file.type.split("/")[0]; // Get the main type like image, application, etc.
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
    console.log("uploadedFiles", uploadedFiles);
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
  const removeFile = (fileName) => {
    setUploadedFiles((prevFiles) =>
      prevFiles.filter((file) => file.name !== fileName)
    );
  };

  // Function to handle file type selection in the modal
  const handleTypeChange = (value) => {
    setSelectedType(value);
  };

  const sortFile = (selectedTypeValue, files) => {
    let filesWithType = null;

    if (props.typeSelect === true) {
      filesWithType = tempFiles.map((file) => ({
        path: file.path,
        relativePath: file.relativePath,
        name: file.name,
        size: file.size,
        type: file.type,
        documenttype: selectedTypeValue,
      }));
    } else {
      filesWithType = files.map((file) => ({
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
    sortFile(selectedType);
    setShowModal(false); // Close the modal after selection
  };

  const sendToApi = (value) => {
    const filepayload = {
      documents: [value],
    };

    FileUploadApiService.fileUpload(filepayload)
      .then((response) => {
        return response.data.details[0];
      })
      .catch((errResponse) => {
        console.log("errResponse", errResponse);
      });
  };
  // Handle the file upload
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    onDrop: (newFiles) => {
      const allFiles = [...uploadedFiles, ...newFiles];
      const totalSize = getTotalSize(allFiles);

      if (allFiles.length > MAX_FILES_COUNT && MAX_FILES_COUNT !== 0) {
        setError(
          `You can upload up to ${MAX_FILES_COUNT} ${MAX_FILES_COUNT > 1 ? "files" : "file"} only.`
        );
        return;
      }

      // Check if total size exceeds 2MB
      if (totalSize > 2 * 1024 * 1024) {
        setError(API_ERROR_MESSAGE.FILE_SIZE_200MB);
      } else {
        setTempFiles(newFiles);

        // Only show the modal if the typeSelect prop is true
        if (props.typeSelect === true) {
          setShowModal(true);
        } else {
          // Read files as binary and process them
          const checklistfile = document.getElementById("fileInput").files[0];

          if (!checklistfile) {
            alert("Please select a file first!");
            return;
          }

          // Create a new FileReader to read the file as Base64
          const reader = new FileReader();

          reader.onloadend = function () {
            // The file is read as a Base64 string
            const base64String = reader.result; // Remove the data URI prefix "data:image/png;base64,"

            // You can now send this Base64 string in your API request
           const uploadedLink = sendToApi(base64String);

          //  newFiles[0] = [...newfiles[0],]
            setUploadedFiles((prevFiles) => [
              ...prevFiles,
              ...newFiles
            ]);

          };

          // Read the file as Base64
          reader.readAsDataURL(checklistfile);
        }
        setError('');
      }
    },
  });

  const files = uploadedFiles.map((file) => (
    <li
      key={file.name}
      style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}
    >
      <span style={{ marginRight: "10px" }}>{getFileIcon(file)}</span>
      <span style={{ flex: 1 }}>
        {file.name}{" "}
        <span style={{ color: "grey", padding: "10px", fontSize: "10px" }}>
          {formatFileSize(file.size)}
        </span>{" "}
        <span
          style={{ marginLeft: "10px", fontSize: "12px", color: "#1890ff" }}
        >
          {file.documenttype && `(${file.documenttype})`}
        </span>
      </span>

      <button
        style={{ background: "transparent", border: "none" }}
        onClick={() => removeFile(file.name)}
      >
        <DeleteFilled style={{ color: "#f5222d" }} />
      </button>
    </li>
  ));

  // Calculate total file size
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

      {/* Modal for document type selection */}
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

      {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}

      <aside>
        <h5>
          {FORM_LABEL.TOTAL_FILE_SIZE}: {formattedTotalFileSize}
        </h5>
        <ul>{files}</ul>
      </aside>
    </section>
  );
};

export default DropZoneFileUpload;
