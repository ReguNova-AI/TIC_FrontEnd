import React, { useState } from "react";
import { Card, Modal, Row, Col, Button, Space, Typography } from "antd";
import {
  AppstoreAddOutlined,
  DatabaseOutlined,
  UsergroupAddOutlined,
  LockOutlined,
} from "@ant-design/icons";
import SectorListing from "./SectorListing";
import IndustriesListing from "./IndustryListing";
import RoleListing from "./RoleListing";
import SectorCreation from "./SectorCreation";
import IndustryCreation from "./IndustryCreation";
import { BUTTON_LABEL } from "shared/constants";
import RoleCreation from "./RoleCreation";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import standardsIcon from "../../assets/images/icons/standards2.svg";
import StandardListing from "./StandardListing";
import StandardCreation from "./StandardCreation";
import PermissionListing from "./PermissionListing";

const { Text } = Typography;

const AdminConfig = () => {
  const [visible, setVisible] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [message, setMessage] = useState("");
  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });

  const handleClose = (messagevalue) => {
    setMessage(messagevalue);
    setModalContent(false);
    setSnackData({
      show: true,
      message: messagevalue,
      type: "success",
    });
    handleModalClose();
  };

  const tabs = [
    // {
    //   title: 'Sectors',
    //   icon: <AppstoreAddOutlined />,
    //   description: 'Manage different business sectors.',
    //   listing:'true',
    //   creation:'true',
    // },
    {
      title: "Industries",
      icon: <DatabaseOutlined />,
      description: "Handle industry-specific configurations.",
      listing: "true",
      creation: "true",
    },
    {
      title: "Roles",
      icon: <UsergroupAddOutlined />,
      description: "Manage user roles and access permissions.",
      listing: "true",
      creation: "true",
    },

    {
      title: "Regulatory Standards",
      icon: <img src={standardsIcon} width="30px" />,
      description: "Manage Standards for each industry.",
      listing: "true",
      creation: "true",
    },
    {
      title: "Permissions",
      icon: <LockOutlined />,
      description: "Configure permissions for different roles.",
      listing: "true",
      creation: "false",
    },
  ];

  const handleButtonClick = (action, tab) => {
    setModalContent({ action: action, tab: tab });
    setVisible(true);
  };

  const handleModalClose = () => {
    setVisible(false);
    setModalContent({});
    setMessage("");
  };

  return (
    <>
      <Row gutter={16}>
        {tabs.map((tab) => (
          <Col span={6} key={tab.title} style={{ padding: "10px 8px" }}>
            <Card hoverable style={{ cursor: "pointer", height: "230px" }}>
              {/* Heading with Icon */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <span style={{ fontSize: "1.8em" }}>{tab.icon}</span>
                <Typography.Title
                  level={4}
                  style={{ marginLeft: "8px", marginTop: "10px" }}
                >
                  {tab.title}
                </Typography.Title>
              </div>

              {/* Description Above Buttons */}
              <Text
                type="secondary"
                style={{
                  display: "block",
                  marginBottom: "16px",
                  height: "60px",
                }}
              >
                {tab.description}
              </Text>

              {/* Buttons Side by Side */}
              <Space style={{ width: "100%" }} size="middle">
                {tab.listing === "true" && (
                  <Button
                    type="default"
                    onClick={() => handleButtonClick("List", tab)}
                  >
                    {BUTTON_LABEL.LIST_VIEW}
                  </Button>
                )}
                {tab.creation === "true" && (
                  <Button
                    type="primary"
                    style={{ background: "#2ba9bc", color: "#ffffff" }}
                    onClick={() => handleButtonClick("Create", tab)}
                  >
                    {BUTTON_LABEL.ADD_NEW}
                  </Button>
                )}
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
        width={
          (modalContent.action === "Create" &&
            modalContent?.tab?.title === "Sectors") ||
          (modalContent.action === "Create" &&
            modalContent?.tab?.title === "Industries")
            ? 400
            : modalContent?.tab?.title === "Roles" ||
                modalContent?.tab?.title === "Regulatory Standards"
              ? 900
              : 600
        }
      >
        {modalContent.action === "List" &&
        modalContent?.tab?.title === "Sectors" ? (
          <SectorListing />
        ) : modalContent.action === "List" &&
          modalContent?.tab?.title === "Industries" ? (
          <IndustriesListing />
        ) : modalContent.action === "List" &&
          modalContent?.tab?.title === "Roles" ? (
          <RoleListing />
        ) : modalContent.action === "List" &&
          modalContent?.tab?.title === "Permissions" ? (
          <PermissionListing />
        ) : modalContent.action === "List" &&
          modalContent?.tab?.title === "Regulatory Standards" ? (
          <StandardListing />
        ) : modalContent.action === "Create" &&
          modalContent?.tab?.title === "Sectors" ? (
          <SectorCreation onHandleClose={(e) => handleClose(e)} />
        ) : modalContent.action === "Create" &&
          modalContent?.tab?.title === "Industries" ? (
          <IndustryCreation onHandleClose={(e) => handleClose(e)} />
        ) : modalContent.action === "Create" &&
          modalContent?.tab?.title === "Roles" ? (
          <RoleCreation onHandleClose={(e) => handleClose(e)} />
        ) : modalContent.action === "Create" &&
          modalContent?.tab?.title === "Regulatory Standards" ? (
          <StandardCreation onHandleClose={(e) => handleClose(e)} />
        ) : null}
      </Modal>
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
    </>
  );
};

export default AdminConfig;
