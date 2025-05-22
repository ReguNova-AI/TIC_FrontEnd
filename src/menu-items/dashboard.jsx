// assets
import {
  DashboardOutlined,
  FileTextOutlined,
  LineChartOutlined,
  SafetyCertificateOutlined,
  ProductOutlined,
  ProjectOutlined,
  UserOutlined,
  SettingOutlined,
  PartitionOutlined,
} from "@ant-design/icons";

// icons
const icons = {
  DashboardOutlined,
  FileTextOutlined,
  LineChartOutlined,
  SafetyCertificateOutlined,
  ProjectOutlined,
  ProductOutlined,
  UserOutlined,
  SettingOutlined,
  PartitionOutlined,
};

// ==============================|| MENU ITEMS - DASHBOARD ||============================== //

const dashboard = {
  id: "group-dashboard",
  title: "",
  type: "group",
  children: [
    {
      id: "dashboard",
      title: "Dashboard",
      type: "item",
      url: "/dashboard/default",
      icon: icons.ProductOutlined,
      breadcrumbs: false,
      access: ["all"],
      superAdminAccess: true,
    },
    {
      id: "myProject",
      title: "My projects",
      type: "item",
      url: "/projects",
      icon: icons.ProjectOutlined,
      breadcrumbs: false,
      access: ["all"],
      superAdminAccess: true,
    },
    // {
    //   id: 'documents',
    //   title: 'Documents',
    //   type: 'item',
    //   url: '/documents',
    //   icon: icons.FileTextOutlined,
    //   breadcrumbs: false,
    //   access:["all"],
    // },
    {
      id: "certificateManager",
      title: "Certificate Manager",
      type: "item",
      url: "/certificateManager",
      icon: icons.SafetyCertificateOutlined,
      breadcrumbs: false,
      access: ["all"],
      superAdminAccess: false,
    },
    // {
    //   id: 'downloadReports',
    //   title: 'Download Reports',
    //   type: 'collapse',
    //   url: '/reports',
    //   icon: icons.LineChartOutlined,
    //   breadcrumbs: false,
    //   access:["all"],
    //   superAdminAccess:true
    //   // children: [
    //   //   {
    //   //     id: 2,
    //   //     title: 'Reports',
    //   //     url: '/dashboard/sub',
    //   //     icon: icons.ProductOutlined,
    //   //   },
    //   // ],
    // },
    {
      id: "users",
      title: "Users",
      type: "item",
      url: "/users",
      icon: icons.UserOutlined,
      breadcrumbs: false,
      access: ["Super Admin", "Org Super Admin", "Admin"],
      superAdminAccess: true,
    },
    {
      id: "externalUsers",
      title: "External Users",
      type: "item",
      url: "/externalUsers",
      icon: icons.UserOutlined,
      breadcrumbs: false,
      access: ["Super Admin", "Org Super Admin", "Admin", "External User"],
      superAdminAccess: true,
    },
    {
      id: "externalProjects",
      title: "External Projects",
      type: "item",
      url: "/externalProjects",
      icon: icons.ProjectOutlined,
      breadcrumbs: false,
      access: ["all"],
      superAdminAccess: false,
    },
    {
      id: "organization",
      title: "Organization",
      type: "item",
      url: "/organization",
      icon: icons.PartitionOutlined,
      breadcrumbs: false,
      access: ["Super Admin"],
      superAdminAccess: true,
    },
    {
      id: "configuration",
      title: "Configuration",
      type: "item",
      url: "/admin_config",
      icon: icons.SettingOutlined,
      breadcrumbs: false,
      access: ["Super Admin"],
      superAdminAccess: true,
    },
  ],
};

export default dashboard;
