import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileImageOutlined, FilePdfOutlined, FileOutlined, FileTextOutlined, CloudUploadOutlined, DeleteFilled, FileExcelOutlined } from '@ant-design/icons';
import { API_ERROR_MESSAGE, FILE_TYPE, FORM_LABEL } from 'shared/constants';

const DropZoneFileUpload = (props) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);  // State to store uploaded files
  const [error, setError] = useState('');  // State for error message

  // Function to get the file type and return the respective icon
  const getFileIcon = (file) => {
    const fileType = file.type.split('/')[0]; // Get the main type like image, application, etc.
    switch (fileType) {
      case FILE_TYPE.IMAGE:
        return <FileImageOutlined style={{ fontSize: '14px', color: '#ad6800' }} />;
      case FILE_TYPE.APPLICATION:
        if (file.type === FILE_TYPE.APPLICATION_PDF) {
          return <FilePdfOutlined style={{ fontSize: '14px', color: '#a8071a' }} />;
        }
        if (file.type === FILE_TYPE.APPLICATION_EXCEL || file.type === FILE_TYPE.APPLICATION_SHEET) {
          return <FileExcelOutlined style={{ fontSize: '14px', color: '#52c41a' }} />;
        }
        if(file.type === FILE_TYPE.APPLICATION_WORD || file.type ===FILE_TYPE.APPLICATION_OFFICE)
        {
          return <FileTextOutlined style={{ fontSize: '14px', color: '#40a9ff' }} />;
        }
        return <FileOutlined style={{ fontSize: '14px', color: '#595959' }} />;
      case FILE_TYPE.TEXT:
        if (file.type === FILE_TYPE.TEXT_CSV) {
          return <FileExcelOutlined style={{ fontSize: '14px', color: '#52c41a' }} />;
        }
        return <FileTextOutlined style={{ fontSize: '14px', color: '#40a9ff' }} />;
      default:
        return <FileOutlined style={{ fontSize: '14px', color: '#595959' }} />;
    }
  };

  // Function to convert file size from bytes to MB or KB
  const formatFileSize = (sizeInBytes) => {
    const sizeInMB = sizeInBytes / (1024 * 1024); // Convert bytes to MB
    if (sizeInMB < 1) {
      const sizeInKB = sizeInBytes / 1024; // Convert bytes to KB if less than 1 MB
      return `${(sizeInKB).toFixed(2)} KB`;
    }
    return `${sizeInMB.toFixed(2)} MB`;
  };

  // Function to calculate total file size
  const getTotalSize = (files) => {
    return files.reduce((total, file) => total + file.size, 0);
  };

  // Function to handle removing a file from the list
  const removeFile = (fileName) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    onDrop: (newFiles) => {
      // Calculate total size of already uploaded files and the new ones
      const allFiles = [...uploadedFiles, ...newFiles];
      const totalSize = getTotalSize(allFiles);

      // Check if total size exceeds 2MB
      if (totalSize > 2 * 1024 * 1024) {
        setError(API_ERROR_MESSAGE.FILE_SIZE_200MB);
      } else {
        setUploadedFiles((prevFiles) => [
          ...prevFiles,
          ...newFiles
        ]);
        setError('');  // Clear error if the size is within the limit
      }
    }
  });

  const files = uploadedFiles.map((file) => (
    <li key={file.name} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
      <span style={{ marginRight: '10px' }}>{getFileIcon(file)}</span>
      <span style={{ flex: 1 }}>
        {file.name}  <span style={{color:"grey",padding:"10px", fontSize:"10px"}}>{formatFileSize(file.size)}</span>
      </span>
      <button
        style={{ background: "transparent", border: "none" }}
        onClick={() => removeFile(file.name)}
      >
        <DeleteFilled style={{ color: '#f5222d' }} />
      </button>
    </li>
  ));

  // Calculate total file size
  const totalFileSize = getTotalSize(uploadedFiles);
  const formattedTotalFileSize = formatFileSize(totalFileSize);

  return (
    <section className="container" style={{ border: '1px dashed #aba8a8', padding: '10px', borderRadius: '10px' }}>
      <h4 style={{fontWeight:500,margin:"4px"}}>{props.label}</h4>
      <div
        {...getRootProps({ className: 'dropzone' })}
        style={{ background: '#f4f4f4', textAlign: 'center', padding: '20px',borderRadius:"8px", border: '1px dashed #aba8a8' }}
      >
        <input {...getInputProps()} />
        <CloudUploadOutlined style={{ fontSize: '36px', color: '#94979a' }} />
        <p>{FORM_LABEL.DRAG_DROP_FILE}</p>
      </div>
      {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
      <aside>
        <h5>{FORM_LABEL.TOTAL_FILE_SIZE} {formattedTotalFileSize}</h5>
        <ul>{files}</ul>
      </aside>
      
    </section>
  );
};

export default DropZoneFileUpload;
