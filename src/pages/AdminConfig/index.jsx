import React, { useState } from 'react';
import { Card, Modal, Row, Col, Button, Space, Typography } from 'antd';
import {
  AppstoreAddOutlined,
  DatabaseOutlined,
  UsergroupAddOutlined,
  LockOutlined,
} from '@ant-design/icons';
import SectorListing from './SectorListing';
import IndustriesListing from './IndustryListing';
import RoleListing from './RoleListing';
import SectorCreation from './SectorCreation';
import IndustryCreation from './IndustryCreation';

const { Text } = Typography;

const AdminConfig = () => {
  const [visible, setVisible] = useState(false);
  const [modalContent, setModalContent] = useState({});

  const tabs = [
    {
      title: 'Sectors',
      icon: <AppstoreAddOutlined />,
      description: 'Manage different business sectors.',
    },
    {
      title: 'Industries',
      icon: <DatabaseOutlined />,
      description: 'Handle industry-specific configurations.',
    },
    {
      title: 'Roles',
      icon: <UsergroupAddOutlined />,
      description: 'Manage user roles and access permissions.',
    },
    {
      title: 'Permissions',
      icon: <LockOutlined />,
      description: 'Configure permissions for different roles.',
    },
  ];

  const handleButtonClick = (action, tab) => {

    setModalContent({action:action,tab:tab});
    setVisible(true);
  };

  const handleModalClose = () => {
    setVisible(false);
    setModalContent('');
  };

  return (
    <>
      <Row gutter={16}>
        {tabs.map((tab) => (
          <Col span={6} key={tab.title}>
            <Card
              hoverable
              style={{ cursor: 'pointer' }}
            >
              {/* Heading with Icon */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{fontSize:"1.8em"}}>{tab.icon}</span>
                <Typography.Title level={4} style={{ marginLeft: '8px' }}>
                  {tab.title}
                </Typography.Title>
              </div>

              {/* Description Above Buttons */}
              <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
                {tab.description}
              </Text>

              {/* Buttons Side by Side */}
              <Space style={{ width: '100%' }} size="middle">
                <Button
                 type="default"
                  onClick={() => handleButtonClick('List', tab)}
                  
                >
                  List View
                </Button>
                <Button
                type="primary"
                  
                  onClick={() => handleButtonClick('Create', tab)}
                  
                >
                  Create
                </Button>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={modalContent?.tab?.title}
        visible={visible}
        onCancel={handleModalClose}
        footer={null}
        width={modalContent.action === "Create" && modalContent?.tab?.title === "Sectors" ||  modalContent.action === "Create" && modalContent?.tab?.title === "Roles"  ? 400 :600}
      >
       
          
          {modalContent.action === "List" && modalContent?.tab?.title === "Sectors" ? <SectorListing/>
          : modalContent.action === "List" && modalContent?.tab?.title === "Industries" ? <IndustriesListing/>
          : modalContent.action === "List" && modalContent?.tab?.title === "Roles" ? <RoleListing/>
          : modalContent.action === "Create" && modalContent?.tab?.title === "Sectors" ? <SectorCreation/>
          : modalContent.action === "Create" && modalContent?.tab?.title === "Industries" ? <IndustryCreation/>
          : modalContent.action === "Create" && modalContent?.tab?.title === "Roles" ? <SectorCreation/>
          : null}
       
      </Modal>
    </>
  );
};

export default AdminConfig;
