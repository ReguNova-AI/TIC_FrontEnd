import { useEffect } from "react";
import { Outlet } from "react-router-dom";

// material-ui
import useMediaQuery from "@mui/material/useMediaQuery";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";

// project import
import Drawer from "./Drawer";
import Header from "./Header";
import navigation from "menu-items";
import Loader from "components/Loader";
import Breadcrumbs from "components/@extended/Breadcrumbs";

import { handlerDrawerOpen, useGetMenuMaster } from "api/menu";
import { IconButton } from "@mui/material";
import MenuFoldOutlined from "@ant-design/icons/MenuFoldOutlined";
import MenuUnfoldOutlined from "@ant-design/icons/MenuUnfoldOutlined";
import { Button } from "antd";
import menuIcon from "../../assets/images/icons/menuIcon.svg"

// ==============================|| MAIN LAYOUT ||============================== //

export default function DashboardLayout() {
  const { menuMasterLoading } = useGetMenuMaster();
  const { menuMaster } = useGetMenuMaster();
  const downXL = useMediaQuery((theme) => theme.breakpoints.down("lg"));
  const drawerOpen = menuMaster?.isDashboardDrawerOpened;
  useEffect(() => {
    handlerDrawerOpen(!downXL);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [downXL]);

  if (menuMasterLoading) return <Loader />;
  return (
    <Box sx={{ display: "flex", width: "100%" }}>
      <Header />
      <Drawer />
      <Button
        onClick={() => handlerDrawerOpen(!drawerOpen)}
        style={{
          marginTop: "66px",
          position: "absolute",
          marginLeft: drawerOpen ? "240px" : !downXL ? "63px" : "2px",
          zIndex: "999999",
          borderRadius:"50%",
          padding:"6px"
        }}
      >
         <img src={menuIcon} width="20px" style={{transform: !drawerOpen ? "none" :"scaleX(-1)"}}/>
      </Button>
      <Box
        component="main"
        sx={{ width: "calc(100% - 260px)", flexGrow: 1, p: { xs: 2, sm: 3 } }}
      >
        <Toolbar />
        <Breadcrumbs navigation={navigation} title />
        <Outlet />
      </Box>
    </Box>
  );
}
