// assets
import AppstoreAddOutlined from "@ant-design/icons/AppstoreAddOutlined";
import AntDesignOutlined from "@ant-design/icons/AntDesignOutlined";
import BarcodeOutlined from "@ant-design/icons/BarcodeOutlined";
import BgColorsOutlined from "@ant-design/icons/BgColorsOutlined";
import FontSizeOutlined from "@ant-design/icons/FontSizeOutlined";
import LoadingOutlined from "@ant-design/icons/LoadingOutlined";

// icons
const icons = {
  FontSizeOutlined,
  BgColorsOutlined,
  BarcodeOutlined,
  AntDesignOutlined,
  LoadingOutlined,
  AppstoreAddOutlined
};

// ==============================|| MENU ITEMS - UTILITIES ||============================== //

const utilities = {
  id: 'utilities',
  title: 'Utilities',
  type: 'group',
  children: [
    {
      id: 'util-typography',
      title: 'Typography',
      type: 'item',
      url: '/typography',
      icon: icons.FontSizeOutlined
    },
    {
      id: 'util-color',
      title: 'Color',
      type: 'item',
      url: '/color',
      icon: icons.BgColorsOutlined
    },
    {
      id: 'util-shadow',
      title: 'Shadow',
      type: 'item',
      url: '/shadow',
      icon: icons.BarcodeOutlined
    }
  ]
};

export default utilities;
