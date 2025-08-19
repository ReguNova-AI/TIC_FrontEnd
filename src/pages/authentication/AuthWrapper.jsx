import PropTypes from "prop-types";

// material-ui
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";

// project import
import Logo from "components/logo";
import AuthCard from "./AuthCard";

// assets
import AuthBackground from "assets/images/auth/AuthBackground";
import { height } from "@mui/system";

// ==============================|| AUTHENTICATION - WRAPPER ||============================== //

export default function AuthWrapper({ children }) {
  return (
    <Box sx={{ minHeight: "100vh" }}>
      <AuthBackground />
      <Logo sx={{ ml: 5, height: 100 }} />
      <Grid container direction="column" sx={{ minHeight: "100vh" }}>
        <Grid item xs={12}>
          <Grid
            item
            xs={12}
            container
            justifyContent="center"
            alignItems="center"
            sx={{
              minHeight: {
                xs: "calc(100vh - 64px)",
                sm: "calc(100vh - 64px)",
                md: "calc(100vh - 64px)",
              },
            }}
          >
            <Grid item>
              <AuthCard>{children}</AuthCard>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}

AuthWrapper.propTypes = { children: PropTypes.node };
