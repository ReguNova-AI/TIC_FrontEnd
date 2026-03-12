import { lazy, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

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
import { Button } from "antd";
import menuIcon from "../../assets/images/icons/menuIcon.svg";
import { useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
const CouponModal = lazy(() => import("pages/Payment/CouponModal"));

const DEFAULT_PLAN = {
  id: "additionalcontract",
  title: "Additional Contract",
  price: "99",
  period: "",
  description: "Ideal for exploring additional contract conformity.",
  features: ["1 Contract/Documents"],
  isPopular: true,
  buttonText: "Get Started",
  buttonVariant: "contained",
  buttonLink: "https://buy.stripe.com/14A3cufMRaGSbnPa3Gc7u04",
};

// ==============================|| MAIN LAYOUT ||============================== //

export default function DashboardLayout() {
  const { menuMasterLoading, menuMaster } = useGetMenuMaster();
  const downXL = useMediaQuery((theme) => theme.breakpoints.down("lg"));
  const drawerOpen = menuMaster?.isDashboardDrawerOpened;
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    handlerDrawerOpen(!downXL);

    // Payment redirection logic
    const userDetailsRaw = sessionStorage.getItem("userDetails");
    if (userDetailsRaw) {
      try {
        const userDetails = JSON.parse(userDetailsRaw);
        // Assuming userDetails is an array based on AuthLogin.jsx usage
        const user = Array.isArray(userDetails) ? userDetails[0] : userDetails;

        if (
          user &&
          (user.is_allowed === false || !user.is_allowed) &&
          user.role_name?.toLowerCase() === "editor"
        ) {
          setModalOpen(true);
        }
      } catch (e) {
        console.error("Error parsing userDetails from sessionStorage", e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [downXL, navigate]);

  if (menuMasterLoading) return <Loader />;
  return (
    <Box sx={{ display: "flex", width: "100%" }}>
      <Header />
      <Drawer />
      <Button
        onClick={() => handlerDrawerOpen(!drawerOpen)}
        style={{
          marginTop: "66px",
          position: "fixed",
          marginLeft: drawerOpen ? "240px" : !downXL ? "63px" : "2px",
          zIndex: "999999",
          borderRadius: "50%",
          padding: "6px",
        }}
      >
        <img
          src={menuIcon}
          alt="menu"
          width="20px"
          style={{ transform: !drawerOpen ? "none" : "scaleX(-1)" }}
          className="nav-icon--selected"
        />
      </Button>
      <Box
        component="main"
        sx={{ width: "calc(100% - 260px)", flexGrow: 1, p: { xs: 2, sm: 3 } }}
      >
        <Toolbar />
        <Breadcrumbs navigation={navigation} title />
        <Outlet />
      </Box>

      {/* Conditional render means the lazy chunk only downloads when modalOpen becomes true */}
      {modalOpen && (
        <Suspense fallback={null}>
          <CouponModal
            open={modalOpen}
            setSnackData={setSnackData}
            handleClose={() => setModalOpen(false)}
            plan={DEFAULT_PLAN}
            disableClose={true}
          />
        </Suspense>
      )}

      <Snackbar
        style={{ top: "80px" }}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={snackData.show}
        autoHideDuration={6000}
        onClose={() => setSnackData({ ...snackData, show: false })}
      >
        <Alert
          onClose={() => setSnackData({ ...snackData, show: false })}
          severity={snackData.type}
          sx={{ width: "100%" }}
        >
          {snackData.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
