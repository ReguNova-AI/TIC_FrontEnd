import React, { useEffect, useState } from "react";
import {
  Space,
  Table,
  ConfigProvider,
  Empty,
  Switch,
  Button,
  Spin,
  Tooltip,
  Card,
  Typography,
  Divider,
} from "antd";
import {
  MailOutlined,
  UserOutlined,
  ProjectOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { AdminConfigAPIService } from "services/api/AdminConfigAPIService";
import { API_ERROR_MESSAGE, API_SUCCESS_MESSAGE } from "shared/constants";

const { Title, Text } = Typography;

const EmailPermissionSettings = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });

  // Default email notification scenarios
  const defaultPermissions = [
    {
      key: "user_creation",
      label: "New User Registration",
      description: "Send email when a new user is created",
      enabled: false,
      disabled: false,
      category: "User Management",
      icon: <UserOutlined />,
    },
    {
      key: "user_invitation",
      label: "User Invitation",
      description: "Send email when inviting a user to join",
      enabled: false,
      disabled: false,
      category: "User Management",
      icon: <MailOutlined />,
    },
    {
      key: "project_creation",
      label: "New Project Creation",
      description: "Send email when a new project is created",
      enabled: false,
      disabled: false,
      category: "Project Management",
      icon: <ProjectOutlined />,
    },
    {
      key: "project_assignment",
      label: "Project Assignment",
      description: "Send email when a user is assigned to a project",
      enabled: false,
      disabled: false,
      category: "Project Management",
      icon: <TeamOutlined />,
    },
    {
      key: "project_completion",
      label: "Project Completion",
      description: "Send email when a project is completed",
      enabled: false,
      disabled: false,
      category: "Project Management",
      icon: <ProjectOutlined />,
    },
    {
      key: "password_reset",
      label: "Password Reset",
      description: "Send email for password reset requests",
      enabled: true,
      disabled: true,
      category: "Security",
      icon: <UserOutlined />,
    },
    {
      key: "role_assignment",
      label: "Role Assignment",
      description: "Send email when user roles are changed",
      enabled: false,
      disabled: false,
      category: "User Management",
      icon: <TeamOutlined />,
    },
    {
      key: "organization_creation",
      label: "Organization Creation",
      description: "Send email when a new organization is created",
      enabled: false,
      disabled: false,
      category: "Organization Management",
      icon: <TeamOutlined />,
    },
  ];

  // Fetch permission data on mount
  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const res = await AdminConfigAPIService.emailPermissionsGet();
  
      if (res?.data && res.data.length > 0) {
        const normalized = defaultPermissions.map((def) => {
          const match = res.data.find((p) => p.key === def.key);
          const enabled = match
            ? match.enabled === true ||
              match.enabled === "true" ||
              match.enabled === 1 ||
              match.enabled === "1"
            : false;
          return { ...def, enabled };
        });
        setPermissions(normalized);
      } else if (res?.details && res.details.length > 0) {
        const normalized = defaultPermissions.map((def) => {
          const match = res.details.find((p) => p.key === def.key);
          const enabled = match
            ? match.enabled === true ||
              match.enabled === "true" ||
              match.enabled === 1 ||
              match.enabled === "1"
            : false;
          return { ...def, enabled };
        });
        setPermissions(normalized);
      } else {
        setPermissions(defaultPermissions);
      }
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
      setPermissions(defaultPermissions);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChange = (key, checked) => {
    setPermissions((prev) => {
      const newPermissions = [...prev];
      const index = newPermissions.findIndex((item) => item.key === key);
      if (index !== -1) {
        newPermissions[index] = { ...newPermissions[index], enabled: checked };
      }
      console.log("Updated permissions:", newPermissions); // Debug log
      return newPermissions;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await AdminConfigAPIService.emailPermissionsUpdate({ permissions });
      setSnackData({
        show: true,
        message: API_SUCCESS_MESSAGE.UPDATED_SUCCESSFULLY,
        type: "success",
      });
      // Refresh permissions from database after successful save
      await fetchPermissions();
    } catch (error) {
      setSnackData({
        show: true,
        message:
          error?.response?.data?.message ||
          API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: "Email Scenario",
      dataIndex: "label",
      key: "label",
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ marginRight: "8px", color: "#1890ff" }}>
            {record.icon}
          </span>
          <div>
            <div style={{ fontWeight: "bold", marginBottom: "2px" }}>{text}</div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              {record.description}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 150,
      render: (category) => (
        <span
          style={{
            background: "#f0f0f0",
            padding: "2px 8px",
            borderRadius: "4px",
            fontSize: "12px",
          }}
        >
          {category}
        </span>
      ),
    },
    {
      title: "Send Email",
      dataIndex: "enabled",
      key: "enabled",
      width: 120,
      render: (enabled, record) => (
        <Tooltip
          title={
            record.disabled
              ? "This action always sends email (cannot be disabled)"
              : enabled
              ? "Email notifications are enabled"
              : "Email notifications are disabled"
          }
        >
          <Switch
            checked={enabled}
            onChange={(checked) => handleToggleChange(record.key, checked)}
            disabled={record.disabled}
            checkedChildren="ON"
            unCheckedChildren="OFF"
          />
        </Tooltip>
      ),
    },
  ];

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {});

  return (
    <Spin spinning={loading} tip="Loading Email Settings">
      <ConfigProvider
        renderEmpty={() => <Empty description="No email settings found" />}
      >
        <Space
          direction="vertical"
          style={{
            width: "100%",
            background: "#fff",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "6px 12px 20px #e4e4e4",
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <Title
              level={3}
              style={{ margin: 0, display: "flex", alignItems: "center" }}
            >
              <MailOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
              Email Notification Settings
            </Title>
            <Text type="secondary">
              Open permission settings to configure when emails should be sent.
            </Text>
          </div>

          {Object.keys(groupedPermissions).map((category) => (
            <Card
              key={category}
              title={category}
              size="small"
              style={{ marginBottom: "16px" }}
              styles={{
                header: {
                  background: "#f8f9fa",
                  borderBottom: "1px solid #e8e8e8",
                  fontSize: "14px",
                  fontWeight: "bold",
                },
              }}
            >
              <Table
                dataSource={groupedPermissions[category]}
                columns={columns}
                rowKey="key"
                pagination={false}
                size="small"
                showHeader={false}
                style={{ margin: 0 }}
              />
            </Card>
          ))}

          <Divider />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "16px",
            }}
          >
            <div>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                <strong>Note:</strong> Some notifications (like password reset)
                cannot be disabled for security reasons.
              </Text>
            </div>
            <Button
              type="primary"
              onClick={handleSave}
              size="large"
              loading={saving}
              disabled={saving}
              style={{
                background: "#1890ff",
                borderColor: "#1890ff",
                minWidth: "120px",
              }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </Space>

        <Snackbar
          style={{ top: "80px" }}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          open={snackData.show}
          autoHideDuration={3000}
          onClose={() => setSnackData({ ...snackData, show: false })}
        >
          <Alert
            onClose={() => setSnackData({ ...snackData, show: false })}
            severity={snackData.type}
          >
            {snackData.message}
          </Alert>
        </Snackbar>
      </ConfigProvider>
    </Spin>
  );
};

export default EmailPermissionSettings;