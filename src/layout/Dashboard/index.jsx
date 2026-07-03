import { lazy, Suspense, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

// material-ui
import useMediaQuery from "@mui/material/useMediaQuery";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";

// project import
import Drawer from "./Drawer";
import Header from "./Header";
import navigation from "menu-items";
import Loader from "components/Loader";
import Breadcrumbs from "components/@extended/Breadcrumbs";
import { handlerDrawerOpen, useGetMenuMaster } from "api/menu";
import menuIcon from "../../assets/images/icons/menuIcon.svg";
const Payment = lazy(() => import("pages/Payment"));

// ==============================|| MAIN LAYOUT ||============================== //

export default function DashboardLayout() {
  const { menuMasterLoading, menuMaster } = useGetMenuMaster();
  const downXL = useMediaQuery((theme) => theme.breakpoints.down("lg"));
  const drawerOpen = menuMaster?.isDashboardDrawerOpened;
  const navigate = useNavigate();

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    handlerDrawerOpen(!downXL);

    // Payment restriction logic
    const userDetailsRaw = sessionStorage.getItem("userDetails");
    if (userDetailsRaw) {
      try {
        const userDetails = JSON.parse(userDetailsRaw);
        // Assuming userDetails is an array based on AuthLogin.jsx usage
        const user = Array.isArray(userDetails) ? userDetails[0] : userDetails;

        if (
          user &&
          (!user.is_allowed) 
          // &&
          // user.role_name?.toLowerCase() === "editor"
        ) {
          setPaymentModalOpen(true);
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

      <Box
        component="main"
        sx={{ width: "calc(100% - 260px)", flexGrow: 1, p: { xs: 2, sm: 3 } }}
      >
        <Toolbar />
        <Breadcrumbs navigation={navigation} title />
        <Outlet />
      </Box>

      {paymentModalOpen && (
        <Dialog
          open={paymentModalOpen}
          fullWidth
          maxWidth="xl"
          disableEscapeKeyDown
        >
          <Suspense fallback={null}>
            <Payment isFromRestriction={true} />
          </Suspense>
        </Dialog>
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
