import PropTypes from "prop-types";
import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import * as actions from "../../../store/actions";

// Material-UI imports
import Button from "@mui/material/Button";
import FormHelperText from "@mui/material/FormHelperText";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Stack from "@mui/material/Stack";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import EyeInvisibleOutlined from "@ant-design/icons/EyeInvisibleOutlined";
import EyeOutlined from "@ant-design/icons/EyeOutlined";

// Third-party imports
import * as Yup from "yup";
import { Formik } from "formik";

// Project imports
import AnimateButton from "components/@extended/AnimateButton";
import { AuthApiService } from "services/api/AuthApiService";
import { LOGIN_PAGE, API_ERROR_MESSAGE, API_SUCCESS_MESSAGE } from "shared/constants";

// ============================|| PASSWORD RESET ||============================ //

export default function AuthPasswordReset() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(true);

  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleSubmitForm = (values) => {
    let payload = values

    AuthApiService.resetPassword(payload)
      .then((response) => {
        setSnackData({
          show: true,
          message: response?.message || API_SUCCESS_MESSAGE.PASSWORD_RESET,
          type: "success",
        });
        navigate("/login"); // Redirect to login page after successful reset
      })
      .catch((errResponse) => {
        setSnackData({
          show: true,
          message: errResponse?.error?.message || API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
          type: "error",
        });
        setSubmitting(false); // This will reset isSubmitting in Formik
      });
  };

  return (
    <>
      <Formik
        initialValues={{
          email:sessionStorage.getItem("email"),
          password: "",
          confirmPassword: "",
        }}
        validationSchema={Yup.object().shape({
          password: Yup.string()
            .min(8, "Password must be at least 8 characters")
            .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
            .matches(/[a-z]/, "Password must contain at least one lowercase letter")
            .matches(/\d/, "Password must contain at least one number")
            .matches(/[@$!%*?&]/, "Password must contain at least one special character")
            .required("Password is required"),
          confirmPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], "Passwords must match")
            .required("Confirm Password is required"),
        })}
        onSubmit={handleSubmitForm} // Using Formik's onSubmit directly
      >
        {({
          errors,
          handleBlur,
          handleChange,
          handleSubmit,
          isSubmitting,
          touched,
          values,
        }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Password Field */}
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="password-reset">
                    {LOGIN_PAGE.NEW_PASSWORD}
                  </InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.password && errors.password)}
                    id="password-reset"
                    type={showPassword ? "text" : "password"}
                    value={values.password}
                    name="password"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    // endAdornment={
                    //   <InputAdornment position="end">
                    //     <IconButton
                    //       aria-label="toggle password visibility"
                    //       onClick={handleClickShowPassword}
                    //       onMouseDown={handleMouseDownPassword}
                    //       edge="end"
                    //       color="secondary"
                    //     >
                    //       {showPassword ? (
                    //         <EyeOutlined />
                    //       ) : (
                    //         <EyeInvisibleOutlined />
                    //       )}
                    //     </IconButton>
                    //   </InputAdornment>
                    // }
                    placeholder="Enter your new password"
                  />
                </Stack>
                {touched.password && errors.password && (
                  <FormHelperText
                    error
                    id="standard-weight-helper-text-password-reset"
                  >
                    {errors.password}
                  </FormHelperText>
                )}
              </Grid>

              {/* Confirm Password Field */}
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="confirm-password-reset">
                  {LOGIN_PAGE.CONFIRM_PASSWORD}
                  </InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.confirmPassword && errors.confirmPassword)}
                    id="confirm-password-reset"
                    type={showPassword ? "text" : "password"}
                    value={values.confirmPassword}
                    name="confirmPassword"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    // endAdornment={
                    //   <InputAdornment position="end">
                    //     <IconButton
                    //       aria-label="toggle password visibility"
                    //       onClick={handleClickShowPassword}
                    //       onMouseDown={handleMouseDownPassword}
                    //       edge="end"
                    //       color="secondary"
                    //     >
                    //       {showPassword ? (
                    //         <EyeOutlined />
                    //       ) : (
                    //         <EyeInvisibleOutlined />
                    //       )}
                    //     </IconButton>
                    //   </InputAdornment>
                    // }
                    placeholder="Re-enter your new password"
                  />
                </Stack>
                {touched.confirmPassword && errors.confirmPassword && (
                  <FormHelperText
                    error
                    id="standard-weight-helper-text-confirm-password-reset"
                  >
                    {errors.confirmPassword}
                  </FormHelperText>
                )}
              </Grid>

              {/* Submit Button */}
              {errors.submit && (
                <Grid item xs={12}>
                  <FormHelperText error>{errors.submit}</FormHelperText>
                </Grid>
              )}

              <Grid item xs={12}>
                <AnimateButton>
                  <Button
                    disableElevation
                    disabled={isSubmitting}
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                    color="primary"
                  >
                    Reset Password
                  </Button>
                </AnimateButton>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>

      {/* SnackBar for Success/Failure message */}
      <Snackbar
      style={{top:"80px"}}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={snackData.show}
        autoHideDuration={3000}
        onClose={() => setSnackData({ show: false })}
      >
        <Alert
          onClose={() => setSnackData({ show: false })}
          severity={snackData.type}
        >
          {snackData.message}
        </Alert>
      </Snackbar>
    </>
  );
}

AuthPasswordReset.propTypes = {
  isDemo: PropTypes.bool,
};
