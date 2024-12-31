// assets
import { DashboardOutlined,FileTextOutlined,LineChartOutlined,SafetyCertificateOutlined,ProductOutlined,ProjectOutlined,UserOutlined,SettingOutlined,PartitionOutlined } from '@ant-design/icons';

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
  PartitionOutlined
};

// ==============================|| MENU ITEMS - DASHBOARD ||============================== //

const dashboard = {
  id: 'group-dashboard',
  title: '',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard/default',
      icon: icons.ProductOutlined,
      breadcrumbs: false,
      
    },
    {
      id: 'myProject',
      title: 'My projects',
      type: 'item',
      url: '/projects',
      icon: icons.ProjectOutlined,
      breadcrumbs: false
    },
    {
      id: 'documents',
      title: 'Documents',
      type: 'item',
      url: '/documents',
      icon: icons.FileTextOutlined,
      breadcrumbs: false
    },
    {
      id: 'certificateManager',
      title: 'Certificate Manager',
      type: 'item',
      url: '/certificateManager',
      icon: icons.SafetyCertificateOutlined,
      breadcrumbs: false
    },
    {
      id: 'downloadReports',
      title: 'Download Reports',
      type: 'collapse',
      url: '',
      icon: icons.LineChartOutlined,
      breadcrumbs: false,
      // children: [
      //   {
      //     id: 2,
      //     title: 'Reports',
      //     url: '/dashboard/sub',
      //     icon: icons.ProductOutlined,
      //   },
      // ],
    },
    {
      id: 'users',
      title: 'Users',
      type: 'item',
      url: '/users',
      icon: icons.UserOutlined,
      breadcrumbs: false
    },
    {
      id: 'organization',
      title: 'Organization',
      type: 'item',
      url: '/organization',
      icon: icons.PartitionOutlined,
      breadcrumbs: false
    },
    {
      id: 'configuration',
      title: 'Configuration',
      type: 'item',
      url: '/admin_config',
      icon: icons.SettingOutlined,
      breadcrumbs: false
    },
    
    

    
  ]
};

export default dashboard;
