import PropTypes from "prop-types";
import React from "react";
import { useNavigate } from "react-router-dom";

// Material-UI imports
import Button from "@mui/material/Button";
import FormHelperText from "@mui/material/FormHelperText";
import Grid from "@mui/material/Grid";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import OtpInput from "react-otp-input";

// Third-party imports
import * as Yup from "yup";
import { Formik } from "formik";

// Project imports
import AnimateButton from "components/@extended/AnimateButton";
import { AuthApiService } from "services/api/AuthApiService";
import { API_ERROR_MESSAGE, API_SUCCESS_MESSAGE } from "shared/constants";

// ============================|| OTP - VALIDATION ||============================ //

export default function AuthOTP() {
  const navigate = useNavigate();
  const [snackData, setSnackData] = React.useState({
    show: false,
    message: "",
    type: "error",
  });

  const handleSubmitForm = (values) => {
    const payload = values;

    // Example: Send OTP to server for verification
    AuthApiService.verifyOtp(payload)
      .then((response) => {
        if (response.statusCode == 200) {
          setSnackData({
            show: true,
            message: API_SUCCESS_MESSAGE.OTP_VERIFY,
            type: "success",
          });

          // Perform further actions, like redirecting to the dashboard or login page
          navigate("/passwordReset",{state:{showPage:true}});
        } else {
          setSnackData({
            show: true,
            message: response.message || API_ERROR_MESSAGE.INVALID_OTP,
            type: "error",
          });
        }
      })
      .catch((errResponse) => {
        setSnackData({
          show: true,
          message:
            errResponse.error.message || API_ERROR_MESSAGE.VERIFY_OTP,
          type: "error",
        });
        setSubmitting(false); // This will reset isSubmitting in Formik
      });
  };

  return (
    <>
      <Formik
        initialValues={{ 
          email: sessionStorage.getItem("email"),
          otp: "", // Managed by Formik
        }}
        validationSchema={Yup.object().shape({
          otp: Yup.string()
            .length(6, "OTP must be exactly 5 digits")
            .required("OTP is required")
            .matches(/^\d+$/, "OTP must only contain digits"),
        })}
        onSubmit={handleSubmitForm}
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
            <Grid container spacing={5}>
              <Grid item xs={12}>
                <OtpInput
                  value={values.otp} // Use Formik's value for OTP
                  onChange={handleChange("otp")} // Use Formik's handleChange
                  numInputs={6}
                  renderSeparator={<span>-</span>}
                  renderInput={(props) => <input {...props} />}
                  inputStyle={{
                    width: "2.5rem",
                    height: "2.5rem",
                    margin: "0 10px",
                    fontSize: "1rem",
                    borderRadius: 4,
                    border: "1px solid rgba(0,0,0,0.3)",
                  }}
                />
                {touched.otp && errors.otp && (
                  <FormHelperText
                    error
                    id="standard-weight-helper-text-otp-login"
                  >
                    {errors.otp}
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
                    Verify OTP
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

AuthOTP.propTypes = {
  isDemo: PropTypes.bool,
};
