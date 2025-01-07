import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import * as actions from "../../../store/actions";

// Material-UI imports
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import FormHelperText from "@mui/material/FormHelperText";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

// Third-party imports
import * as Yup from "yup";
import { Formik } from "formik";

// Project imports
import AnimateButton from "components/@extended/AnimateButton";
import EyeOutlined from "@ant-design/icons/EyeOutlined";
import EyeInvisibleOutlined from "@ant-design/icons/EyeInvisibleOutlined";
import { AuthApiService } from "services/api/AuthApiService";
import { LOGIN_PAGE, API_ERROR_MESSAGE } from "shared/constants";

// ============================|| JWT - LOGIN ||============================ //

export default function AuthLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });

  sessionStorage.clear();
  sessionStorage.removeItem("userDetails");
  localStorage.removeItem("userDetails"); // If you're using localStorage
  document.cookie = "session_cookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/"; // Example for clearing cookies
  
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  }; 

  const handleSubmitForm = (values, { setSubmitting }) => {
    let payload = values;
    AuthApiService.login(payload)
      .then((response) => {
        // On success, you can add any additional logic here
        
        if (response.message === API_ERROR_MESSAGE.INVALID_PASSWORD) {
          setSnackData({
            show: true,
            message: response?.message,
            type: "error",
          });
        } else {
          setSnackData({
            show: true,
            message: response.message,
            type: "success",
          });
          dispatch(actions.setAuthentication(response));
 
          navigate("/dashboard/default");
        }
      })
      .catch((errResponse) => {
        // On failure, reset the button to enable again
        setSnackData({
          show: true,
          message: errResponse?.response?.data?.message || API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
          type: "error",
        });

        // Enable the button again after failure
        setSubmitting(false); // This will reset isSubmitting in Formik
      });
  };

  const handleRedirection = (link) => {
    navigate(link);
  };

  return (
    <>
      <Formik
        initialValues={{
          email: "",
          password: "",
          submit: null,
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string()
            .email(LOGIN_PAGE.EMAIL_ERROR)
            .max(255)
            .required(LOGIN_PAGE.EMAIL_REQUIRED_MESSAGE),
          password: Yup.string()
            .max(255)
            .required(LOGIN_PAGE.PASSWORD_REQUIRED_MESSAGE),
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
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="email-login">
                    {LOGIN_PAGE.EMAIL}
                  </InputLabel>
                  <OutlinedInput
                    id="email-login"
                    type="email"
                    value={values.email}
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder={LOGIN_PAGE.EMAIL_INPUT_PLACEHOLDER}
                    fullWidth
                    error={Boolean(touched.email && errors.email)}
                  />
                </Stack>
                {touched.email && errors.email && (
                  <FormHelperText
                    error
                    id="standard-weight-helper-text-email-login"
                  >
                    {errors.email}
                  </FormHelperText>
                )}
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="password-login">
                    {LOGIN_PAGE.PASSWORD}
                  </InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.password && errors.password)}
                    id="password-login" // Fixed the ID issue
                    type={showPassword ? "text" : "password"}
                    value={values.password}
                    name="password"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          color="secondary"
                        >
                          {showPassword ? (
                            <EyeOutlined />
                          ) : (
                            <EyeInvisibleOutlined />
                          )}
                        </IconButton>
                      </InputAdornment>
                    }
                    placeholder={LOGIN_PAGE.PASSWORD_INPUT_PLACEHOLDER}
                  />
                </Stack>
                {touched.password && errors.password && (
                  <FormHelperText
                    error
                    id="standard-weight-helper-text-password-login"
                  >
                    {errors.password}
                  </FormHelperText>
                )}
              </Grid>

              <Grid item xs={12} sx={{ mt: -1 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={2}
                  style={{ float: "right" }}
                >
                  <Link
                    variant="h6"
                    component={RouterLink}
                    color="text.primary"
                    onClick={(e) => handleRedirection("/forgotPassword")}
                  >
                    {LOGIN_PAGE.FORGOT_PASSWORD}
                  </Link>
                </Stack>
              </Grid>

              {errors.submit && (
                <Grid item xs={12}>
                  <FormHelperText error>{errors.submit}</FormHelperText>
                </Grid>
              )}

              <Grid item xs={12}>
                <AnimateButton>
                  <Button
                    disableElevation
                    disabled={isSubmitting} // Button is disabled if form is submitting
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                    color="primary"
                  >
                    {LOGIN_PAGE.LOGIN_BUTTON}
                  </Button>
                </AnimateButton>
              </Grid>

              <Grid item xs={12}>
                <Divider>
                  <Typography variant="caption">OR</Typography>
                </Divider>
              </Grid>

              <Grid item xs={12}>
                <Button
                  disableElevation
                  onClick={(e) => handleRedirection("/register")}
                  fullWidth
                  size="large"
                  type="button" // Change to "button" to avoid form submission
                  variant="outlined"
                  color="primary"
                >
                  {LOGIN_PAGE.REQUEST_BUTTON}
                </Button>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>

      <Snackbar
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

AuthLogin.propTypes = {
  isDemo: PropTypes.bool,
};
