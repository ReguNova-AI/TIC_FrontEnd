import React, { useState, useEffect } from 'react';
import { CheckOutlined, DownloadOutlined, FolderFilled } from '@ant-design/icons';
import { Tree } from 'antd';
import { Tooltip } from '@mui/material';

const FileStructureView = ({ data }) => {
  const [showLine, setShowLine] = useState(true);
  const [showIcon, setShowIcon] = useState(true);
  const [showLeafIcon, setShowLeafIcon] = useState(true);
  const [gData, setGData] = useState([]); // Store the tree data

  // Function to transform the data into the required tree format
  const transformDataToTree = (documents) => {
    const treeStructure = {};

    documents.forEach((document) => {
      const { documenttype, name, path } = document;

      // If the tree structure doesn't have the folder (documenttype), create it
      if (!treeStructure[documenttype]) {
        treeStructure[documenttype] = {
          title: documenttype,
          key: documenttype.replace(/\s+/g, '-'), // Key to be unique (no spaces)
          icon: <FolderFilled style={{ color: "blue" }} />,
          children: [],
        };
      }

      // Add the document under the correct folder
      treeStructure[documenttype].children.push({
        title: <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{width: "48%", overflow: "hidden", display: "inline-block", whiteSpace: "nowrap", textOverflow: "ellipsis"}}>{name}</span> 
        {/* Tooltip for the download icon */}
        <Tooltip title="Download">
          <DownloadOutlined style={{ marginLeft:8,marginRight: 8, fontSize: 16, color: 'green' }} />
        </Tooltip>
        {/* Document Name */}
       
      </div>,
        key: path, // Use document path as a unique key
        isLeaf: true, // Mark the document as a leaf node
      });
    });

    // Convert the treeStructure object to an array of trees
    return Object.values(treeStructure);
  };

  // Set the tree data when the component mounts or when `data` changes
  useEffect(() => {
    if (data && Array.isArray(data.documents)) {
      const transformedData = transformDataToTree(data.documents);
      setGData(transformedData); // Set the tree data
    }
  }, [data]);

  const onSelect = (selectedKeys, info) => {
    console.log('selected', selectedKeys, info);
  };

  const handleLeafIconChange = (value) => {
    if (value === 'custom') {
      return setShowLeafIcon(<CheckOutlined />);
    }
    if (value === 'true') {
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
        defaultExpandedKeys={['0-0', '0-1']} // Expands both parent nodes by default
        onSelect={onSelect}
        treeData={gData} // Set the dynamic tree data
        blockNode
      />
    </div>
  );
};

export default FileStructureView;
