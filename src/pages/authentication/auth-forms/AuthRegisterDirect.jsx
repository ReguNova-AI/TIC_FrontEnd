// AuthRegisterDirect.js

import React, { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Slide from "@mui/material/Slide";

import AnimateButton from "components/@extended/AnimateButton";
import { UserApiService } from "services/api/UserAPIService";

function TransitionSlide(props) {
  return <Slide {...props} direction="down" />;
}

export default function AuthRegisterDirect() {
  const navigate = useNavigate();

  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const handleSubmitForm = async (values, { setSubmitting }) => {
    try {
      const payload = {
        role_id: null, // self-register → no role yet
        role_name: "", // default role (adjust if needed)

        user_first_name: values.firstname,
        user_last_name: values.lastname,
        user_profile: "", // no avatar in self register
        user_email: values.email,
        user_phone_no: "", // not collected here

        user_address: {
          street: "",
          city: "",
          state: "",
          zip: "",
        },

        sector_id: null,
        sector_name: "",

        org_id: null, // org created later or mapped backend
        org_name: values.company || "",

        industry_id: null,
        industry_name: "",

        industries: [],
        industry_names: [],

        created_by: null, // self-register
        send_email: true, // send credentials email
      };

      const response = await UserApiService.userSelfRegister(payload);

      // Check backend "success" flag
      if (response?.success) {
        setSnackData({
          show: true,
          message: "Account created successfully! Check your email.",
          type: "success",
        });

        setTimeout(() => navigate("/login"), 5000);
      } else {
        setSnackData({
          show: true,
          message: response?.message || "Registration failed",
          type: "error",
        });
      }
    } catch (error) {
      setSnackData({
        show: true,
        message:
          error?.response?.data?.message || "Server error. Please try again.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Formik
        initialValues={{
          firstname: "",
          lastname: "",
          email: "",
          company: "",
          address: "",
          submit: null,
        }}
        validationSchema={Yup.object().shape({
          firstname: Yup.string().max(255).required("First Name is required"),
          lastname: Yup.string().max(255).required("Last Name is required"),
          email: Yup.string()
            .email("Must be a valid email")
            .max(255)
            .required("Email is required"),
          company: Yup.string()
            .max(255)
            .required("Organization Name is required"),
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
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="firstname-signup">
                    First Name*
                  </InputLabel>
                  <OutlinedInput
                    id="firstname-signup"
                    value={values.firstname}
                    name="firstname"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="John"
                    fullWidth
                    error={Boolean(touched.firstname && errors.firstname)}
                  />
                </Stack>
                {touched.firstname && errors.firstname && (
                  <FormHelperText error>{errors.firstname}</FormHelperText>
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="lastname-signup">Last Name*</InputLabel>
                  <OutlinedInput
                    id="lastname-signup"
                    value={values.lastname}
                    name="lastname"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Doe"
                    fullWidth
                    error={Boolean(touched.lastname && errors.lastname)}
                  />
                </Stack>
                {touched.lastname && errors.lastname && (
                  <FormHelperText error>{errors.lastname}</FormHelperText>
                )}
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="company-signup">
                    Organization Name*
                  </InputLabel>
                  <OutlinedInput
                    id="company-signup"
                    value={values.company}
                    name="company"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Demo Inc."
                    fullWidth
                    error={Boolean(touched.company && errors.company)}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="email-signup">Email Address*</InputLabel>
                  <OutlinedInput
                    id="email-signup"
                    type="email"
                    value={values.email}
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="demo@company.com"
                    fullWidth
                    error={Boolean(touched.email && errors.email)}
                  />
                </Stack>
                {touched.email && errors.email && (
                  <FormHelperText error>{errors.email}</FormHelperText>
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
                    Register
                  </Button>
                </AnimateButton>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>

      <Snackbar
        style={{ top: "120px" }}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={snackData.show}
        TransitionComponent={TransitionSlide}
        autoHideDuration={5000}
        onClose={() => setSnackData({ ...snackData, show: false })}
      >
        <Alert
          onClose={() => setSnackData({ ...snackData, show: false })}
          severity={snackData.type}
          sx={{ width: "100%", boxShadow: 3 }}
        >
          {snackData.type === "success" ? (
            <AlertTitle>Congratulations!</AlertTitle>
          ) : (
            <AlertTitle>Error</AlertTitle>
          )}
          {snackData.message ||
          "You have taken the first step towards transforming your due diligence process. Please check your email to continue."}
        </Alert>
      </Snackbar>
    </>
  );
}

AuthRegisterDirect.propTypes = {
  isDemo: PropTypes.bool,
};
