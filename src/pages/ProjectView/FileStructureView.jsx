import React, { useState, useEffect } from "react";
import {
  CheckOutlined,
  DownloadOutlined,
  FolderFilled,
} from "@ant-design/icons";
import { Tree } from "antd";
import { IconButton, Tooltip } from "@mui/material";
import { FORM_LABEL } from "shared/constants";
import folderIcon from "../../assets/images/icons/folderIcon1.svg";
import { InsertDriveFile } from "@mui/icons-material";
import {
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  FileImageOutlined,
  FileUnknownOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import AttachFileIcon from "@mui/icons-material/AttachFile";

const getFileIcon = (filename) => {
  if (!filename) return <FileUnknownOutlined style={{ color: "#595959" }} />;
  const ext = filename.split(".").pop().toLowerCase();
  switch (ext) {
    case "pdf":
      return <FilePdfOutlined style={{ color: "#cf1322" }} />;
    case "doc":
    case "docx":
      return <FileWordOutlined style={{ color: "#1890ff" }} />;
    case "xls":
    case "xlsx":
      return <FileExcelOutlined style={{ color: "#52c41a" }} />;
    case "jpg":
    case "jpeg":
    case "png":
      return <FileImageOutlined style={{ color: "#fa8c16" }} />;
    case "txt":
      return <FileTextOutlined style={{ color: "#722ed1" }} />;
    default:
      return <FileUnknownOutlined style={{ color: "#595959" }} />;
  }
};

const FileStructureView = ({ data }) => {
  const [showLine, setShowLine] = useState(true);
  const [showIcon, setShowIcon] = useState(true);
  const [showLeafIcon, setShowLeafIcon] = useState(false);
  const [gData, setGData] = useState([]); // Store the tree data
  const [newDoc, setNewDoc] = useState({ file: null });

  // Function to transform the data into the required tree format
  const transformDataToTree = (documents) => {
    const treeStructure = {};

    documents.forEach((document) => {
      let { document_type, document_name, file_path, folder_name, version } =
        document;
      console.log("inside document", document);
      if (document_type === "Custom Regulatory") {
        document_type = FORM_LABEL.CUSTOM_REGULATORY;
      }
      // If the tree structure doesn't have the folder (documenttype), create it
      if (!treeStructure[document_type]) {
        treeStructure[document_type] = {
          // title: document_type,
          title: `${folder_name} (${document_type})`,
          key: document_type?.replace(/\s+/g, "-"), // Key to be unique (no spaces)
          // icon: <FolderFilled style={{ color: "blue" }} />,
          icon: (
            <img
              src={folderIcon}
              width="20px"
              style={{ marginRight: "10px" }}
            />
          ),
          children: [],
        };
      }

      // Add the document under the correct folder
      treeStructure[document_type].children.push({
        title: (
          <div style={{ display: "flex", alignItems: "center" }}>
            <span
              style={{
                width: "100%",
                overflow: "hidden",
                display: "inline-block",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              {document_name}
            </span>

            {/* Tooltip for the download icon */}
            {file_path && (
              <Tooltip title="Download">
                <DownloadOutlined
                  style={{
                    marginLeft: 8,
                    marginRight: 8,
                    fontSize: 16,
                    color: "green",
                  }}
                />
              </Tooltip>
            )}

            {/* File input with icon */}
            {file_path ? (
              <>
                <IconButton
                  component="span"
                  sx={{
                    padding: 0,
                    marginLeft: 1,
                    marginRight: 1,
                    fontSize: 16,
                  }}
                >
                  {getFileIcon(document_type)}
                </IconButton>
              </>
            ) : (
              <>
                <Tooltip title="Upload Document">
                  <input
                    type="file"
                    hidden
                    id="file-input"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setNewDoc((prev) => ({ ...prev, file }));
                      }
                    }}
                  />
                  <label htmlFor="file-input">
                    <IconButton
                      component="span"
                      // color={newDoc.file ? "success" : "default"}
                      sx={{
                        padding: 0,
                        marginLeft: 1,
                        marginRight: 1,
                        fontSize: 16,
                        color: "#3366ff",
                      }}
                    >
                      <AttachFileIcon />
                    </IconButton>
                  </label>
                </Tooltip>
              </>
            )}

            {file_path && version && (
              <Tooltip title={`Version: ${version}`}>
                <span
                  style={{
                    width: "10%",
                    overflow: "hidden",
                    display: "inline-block",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    color: "gray",
                    fontSize: "10px",
                  }}
                >
                  {version}
                </span>
              </Tooltip>
            )}
          </div>
        ),
        key: file_path, // Use document path as a unique key
        isLeaf: true, // Mark the document as a leaf node
      });
    });

    // Convert the treeStructure object to an array of trees
    return Object.values(treeStructure);
  };

  // Set the tree data when the component mounts or when `data` changes
  useEffect(() => {
    if (data && Array.isArray(data?.project_documents)) {
      const transformedData = transformDataToTree(data?.project_documents);

      setGData(transformedData); // Set the tree data
    }
  }, [data]);

  const onSelect = (selectedKeys, info) => {
    console.log("selected", selectedKeys, info);
  };

  const handleLeafIconChange = (value) => {
    if (value === "custom") {
      return setShowLeafIcon(<CheckOutlined />);
    }
    if (value === "true") {
      return setShowLeafIcon(true);
    }
    return setShowLeafIcon(false);
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        {/* Your additional controls can go here */}
      </div>

      <Tree
        className="draggable-tree"
        showLine={showLine ? { showLeafIcon } : false}
        showIcon={showIcon}
        defaultExpandedKeys={["0-0", "0-1"]} // Expands both parent nodes by default
        onSelect={onSelect}
        treeData={gData} // Set the dynamic tree data
        blockNode
      />
    </div>
  );
};

export default FileStructureView;
