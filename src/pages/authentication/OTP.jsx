import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

// material-ui
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

// project import
import AuthWrapper from "./AuthWrapper";
import AuthOTP from "./auth-forms/AuthOTP";
import { LOGIN_PAGE } from "shared/constants";

// ================================|| OTP ||================================ //

export default function ForgotPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showPage } = location.state || {}; 

  useEffect(() => {
    if (!showPage) {
      navigate("/login");
    }
  }, []);
  return (
    <AuthWrapper>
      <Grid container spacing={5}>
        <Grid item xs={12}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="baseline"
            sx={{ mb: { xs: -0.5, sm: 0.5 } }}
          >
            <Typography variant="h3">OTP Verification</Typography>
          </Stack>
          <Stack>
            <Typography style={{ color: "grey" }}>
              {LOGIN_PAGE.OTP_DESC}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <AuthOTP />
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}
