// AuthRegisterDirect.js

import React, { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";
import {
    Button,
    Grid,
    Stack,
    OutlinedInput,
    InputLabel,
    FormHelperText,
    Snackbar,
    Alert,
} from "@mui/material";
import AnimateButton from "components/@extended/AnimateButton";
import { UserApiService } from "services/api/UserAPIService";

export default function AuthRegisterDirect() {
    const navigate = useNavigate();

    const [snackData, setSnackData] = useState({
        show: false,
        message: "",
        type: "error",
    });

    const handleSubmitForm = async (values, { setSubmitting }) => {
        try {
            const payload = {
                role_id: null,                 // self-register → no role yet
                role_name: "",             // default role (adjust if needed)

                user_first_name: values.firstname,
                user_last_name: values.lastname,
                user_profile: "",              // no avatar in self register
                user_email: values.email,
                user_phone_no: "",             // not collected here

                user_address: {
                    street: values.address || "",
                    city: "",
                    state: "",
                    zip: ""
                },

                sector_id: null,
                sector_name: "",

                org_id: null,                  // org created later or mapped backend
                org_name: values.company || "",

                industry_id: null,
                industry_name: "",

                industries: [],
                industry_names: [],

                created_by: null,              // self-register
                send_email: true               // send credentials email
            };

            const response = await UserApiService.userSelfRegister(payload);

            if (response?.statusCode === 200) {
                setSnackData({
                    show: true,
                    message:
                        response?.message ||
                        "Account created successfully! Check your email.",
                    type: "success",
                });

                setTimeout(() => navigate("/login"), 2000);
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
                    error?.response?.data?.message ||
                    "Server error. Please try again.",
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
                    firstname: Yup.string()
                        .max(255)
                        .required("First Name is required"),
                    lastname: Yup.string()
                        .max(255)
                        .required("Last Name is required"),
                    email: Yup.string()
                        .email("Must be a valid email")
                        .max(255)
                        .required("Email is required"),
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
                                        error={Boolean(
                                            touched.firstname && errors.firstname
                                        )}
                                    />
                                </Stack>
                                {touched.firstname && errors.firstname && (
                                    <FormHelperText error>
                                        {errors.firstname}
                                    </FormHelperText>
                                )}
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Stack spacing={1}>
                                    <InputLabel htmlFor="lastname-signup">
                                        Last Name*
                                    </InputLabel>
                                    <OutlinedInput
                                        id="lastname-signup"
                                        value={values.lastname}
                                        name="lastname"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        placeholder="Doe"
                                        fullWidth
                                        error={Boolean(
                                            touched.lastname && errors.lastname
                                        )}
                                    />
                                </Stack>
                                {touched.lastname && errors.lastname && (
                                    <FormHelperText error>
                                        {errors.lastname}
                                    </FormHelperText>
                                )}
                            </Grid>

                            <Grid item xs={12}>
                                <Stack spacing={1}>
                                    <InputLabel htmlFor="company-signup">
                                        Organization Name
                                    </InputLabel>
                                    <OutlinedInput
                                        id="company-signup"
                                        value={values.company}
                                        name="company"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        placeholder="Demo Inc."
                                        fullWidth
                                    />
                                </Stack>
                            </Grid>

                            <Grid item xs={12}>
                                <Stack spacing={1}>
                                    <InputLabel htmlFor="email-signup">
                                        Email Address*
                                    </InputLabel>
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
                                    <FormHelperText error>
                                        {errors.email}
                                    </FormHelperText>
                                )}
                            </Grid>

                            <Grid item xs={12}>
                                <Stack spacing={1}>
                                    <InputLabel htmlFor="address-signup">
                                        Organization Address
                                    </InputLabel>
                                    <OutlinedInput
                                        id="address-signup"
                                        value={values.address}
                                        name="address"
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        placeholder="123 Main St."
                                        fullWidth
                                    />
                                </Stack>
                            </Grid>

                            {errors.submit && (
                                <Grid item xs={12}>
                                    <FormHelperText error>
                                        {errors.submit}
                                    </FormHelperText>
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
                style={{ top: "80px" }}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                open={snackData.show}
                autoHideDuration={3000}
                onClose={() =>
                    setSnackData({ ...snackData, show: false })
                }
            >
                <Alert
                    onClose={() =>
                        setSnackData({ ...snackData, show: false })
                    }
                    severity={snackData.type}
                >
                    {snackData.message}
                </Alert>
            </Snackbar>
        </>
    );
}

AuthRegisterDirect.propTypes = {
    isDemo: PropTypes.bool,
};
