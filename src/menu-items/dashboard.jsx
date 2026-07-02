// assets
import PieChartOutlineIcon from "@mui/icons-material/PieChartOutline";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

// icons
const icons = {
  DashboardOutlined: PieChartOutlineIcon,
  ProjectOutlined: WorkOutlineIcon,
  UserOutlined: PeopleOutlinedIcon,
  ExternalUserOutlined: PersonSearchOutlinedIcon,
  PartitionOutlined: AccountTreeOutlinedIcon,
  SettingOutlined: SettingsOutlinedIcon,
  PaymentHistoryOutlined: ReceiptLongOutlinedIcon,
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
      url: "/dashboard",
      icon: icons.DashboardOutlined,
      breadcrumbs: false,
      access: ["all"],
      superAdminAccess: true,
    },
    {
      id: "myProject",
      title: "My Projects",
      type: "item",
      url: "/projects",
      icon: icons.ProjectOutlined,
      breadcrumbs: false,
      access: ["all"],
      superAdminAccess: true,
    },
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
      icon: icons.ExternalUserOutlined,
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
    {
      id: "paymentHistory",
      title: "Payment History",
      type: "item",
      url: "/payment-history",
      icon: icons.PaymentHistoryOutlined,
      breadcrumbs: false,
      access: ["all"],
      superAdminAccess: false,
    },
  ],
};

export default dashboard;
