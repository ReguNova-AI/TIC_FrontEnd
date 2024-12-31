import React, { useState } from 'react';
import { CarryOutOutlined, CheckOutlined, FormOutlined, FolderFilled } from '@ant-design/icons';
import { Select, Switch, Tree } from 'antd';

const treeData = [
  {
    title: 'Documents',
    key: '0-0',
    icon: <FolderFilled style={{ color: "blue" }} />,
    children: [
      {
        title: 'Document 1',
        key: '0-0-0-0',
      },
      {
        title: "Document 2",
        key: '0-0-0-1',
      },
      {
        title: 'Document 3',
        key: '0-0-0-2',
      }
    ],
  },
  {
    title: 'Custom Standard Documents',
    key: '0-1',
    icon: <FolderFilled style={{ color: "blue" }} />,
    children: [
      {
        title: 'Document 1',
        key: '0-0-0-0',
      },
      {
        title: "Document 2",
        key: '0-0-0-1',
      },
      {
        title: 'Document 3',
        key: '0-0-0-2',
      },
    ],
  },
];

const FileStructureView = () => {
  const [showLine, setShowLine] = useState(true);
  const [showIcon, setShowIcon] = useState(true);
  const [showLeafIcon, setShowLeafIcon] = useState(true);
  const [gData, setGData] = useState(treeData);

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
      <div
        style={{
          marginBottom: 16,
        }}
      >
        {/* Your additional controls can go here */}
      </div>
      <Tree
        className="draggable-tree"
        showLine={
          showLine
            ? {
                showLeafIcon,
              }
            : false
        }
        showIcon={showIcon}
        // Set defaultExpandedKeys to open the parent nodes
        defaultExpandedKeys={['0-0', '0-1']} // Expands both parent nodes by default
        onSelect={onSelect}
        treeData={gData}
        blockNode
      />
    </div>
  );
};

export default FileStructureView;
