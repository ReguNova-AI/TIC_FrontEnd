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

// Third-party imports
import * as Yup from "yup";
import { Formik } from "formik";

// Project imports
import AnimateButton from "components/@extended/AnimateButton";
import { AuthApiService } from "services/api/AuthApiService";
import { LOGIN_PAGE, API_ERROR_MESSAGE, API_SUCCESS_MESSAGE } from "shared/constants";

// ============================|| FORGOT PASSWORD||============================ //

export default function AuthForgotPassword() {
  const navigate = useNavigate();
  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });

  const handleSubmitForm = (values,{ setSubmitting }) => {
    
    let payload = values;
    AuthApiService.forgotPassword(payload)
      .then((response) => {
       
          setSnackData({
            show: true,
            message: response?.message || API_SUCCESS_MESSAGE.OTP_SENT,
            type: "success",
          });
          sessionStorage.setItem("email",values.email);
          sessionStorage.setItem("resetFlow",true);

          navigate("/otp",{state:{showPage:true}});
      })
      .catch((errResponse) => {
        setSnackData({
          show: true,
          message: errResponse?.error?.message || API_ERROR_MESSAGE.INCORRECT_EMAIL,
          type: "error",
        });
        setSubmitting(false); // This will reset isSubmitting in Formik
      });
  };

  return (
    <>
      <Formik
        initialValues={{
          email: "",
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string()
            .email(LOGIN_PAGE.EMAIL_ERROR)
            .max(255)
            .required(LOGIN_PAGE.EMAIL_REQUIRED_MESSAGE),
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
                    {LOGIN_PAGE.SEND_REQUEST}
                  </Button>
                </AnimateButton>
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

AuthForgotPassword.propTypes = {
  isDemo: PropTypes.bool,
};
