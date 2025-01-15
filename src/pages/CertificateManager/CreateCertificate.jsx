import React, { useState } from "react";
import { TextField, Button, Grid, Box, Typography } from "@mui/material";
import { DatePicker } from "antd";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import DropZoneFileUpload from "pages/ProjectCreation/DropZoneFileUpload";
import { CertificateApiService } from "services/api/CertificateAPIService";
import {
  API_ERROR_MESSAGE,
  BUTTON_LABEL,
  FORM_LABEL,
  STATUS,
} from "shared/constants";

const CreateCertificate = ({onHandleClose}) => {
  const navigate = useNavigate();
  const { RangePicker } = DatePicker;
  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });

  const [formData, setFormData] = useState({
    certificate_name: "",
    certificate_subject: "",
    certificate_status: "",
    issuer: "",
    date_of_issued: "",
    date_of_expiry: "",
    file_url: "",
    file_name: "",
    created_by_id: "",
    created_by_name: "",
    org_id: "",
    org_name: "",
    sector_id: "",
    sector_name: "",
    industry_id: "",
    industry_name: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (file) => {
    if(file)
    {
    setFormData({
      ...formData,
      file_url: file[0]?.path,
      file_name: file[0]?.name,
    });
  }
    // console.log("file",file);

  };

  // Handle date selection from RangePicker
  const handleDateChange = (dates) => {
    if (dates) {
      const [startDate, endDate] = dates;
      setFormData({
        ...formData,
        date_of_issued: startDate ? startDate.format("YYYY-MM-DD") : "", // Format to YYYY-MM-DD
        date_of_expiry: endDate ? endDate.format("YYYY-MM-DD") : "", // Format to YYYY-MM-DD
      });
    }
  };

  const handleSubmit = (e) => {

    e.preventDefault();

  // Check if file is selected
  if (!formData.file_url) {
    setSnackData({
      show: true,
      message: "Please upload a certificate file.",
      type: "error",
    });
    return; // Don't proceed with form submission
  }


    const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));
    const today = new Date().toISOString().split("T")[0];
    const updatedStatus =
      formData.date_of_expiry && formData.date_of_expiry > today
        ? STATUS.VALID
        : STATUS.EXPIRED;

        

    const payload = {
      certificate_name: formData.certificate_name,
      certificate_subject: formData.certificate_subject,
      certificate_status: updatedStatus,
      issuer: formData.issuer,
      date_of_issued: formData.date_of_issued,
      date_of_expiry: formData.date_of_expiry,
      file_url: formData.file_url,
      file_name: formData.file_name,
      created_by_id: userdetails?.[0]?.user_id,
      created_by_name:
        userdetails?.[0]?.user_first_name + " " + userdetails?.[0]?.user_last_name,
      org_id: userdetails?.[0]?.org_id,
      org_name: userdetails?.[0]?.org_name,
      sector_id: userdetails?.[0]?.sector_id,
      sector_name: userdetails?.[0]?.sector_name,
      industry_id: userdetails?.[0]?.industry_id,
      industry_name: userdetails?.[0]?.industry_name,
    };

    console.log("payload",payload);

    CertificateApiService.certificateCreate(payload)
      .then((response) => {
        // On success, you can add any additional logic here

        setSnackData({
          show: true,
          message: response.message,
          type: "success",
        });
        onHandleClose(true);
      })
      .catch((errResponse) => {
        setSnackData({
          show: true,
          message:
            errResponse?.error?.message ||
            API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
          type: "error",
        });
      });
  };

  return (
    <>
      <Box
        sx={{
          margin: "auto",
          padding: 3,
          background: "#fff",
          borderRadius: "10px",
          boxShadow: "6px 12px 20px #e4e4e4",
        }}
      >
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* First row - 3 items */}
            <Grid item xs={12} sm={6}>
              <TextField
                label={FORM_LABEL.CERTIFICATE_NAME}
                variant="outlined"
                fullWidth
                name="certificate_name"
                value={formData.certificate_name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} style={{ marginBottom: "10px" }}>
              <TextField
                label={FORM_LABEL.CERTIFICATE_SUBJECT}
                variant="outlined"
                fullWidth
                multiline
                rows={2}
                name="certificate_subject"
                value={formData.certificate_subject}
                onChange={handleInputChange}
                required
                inputProps={{ maxLength: 100 }}
                helperText={`${formData.certificate_subject.length}/100`}
                FormHelperTextProps={{
                  sx: {
                    textAlign: "right", // Float the text to the right
                    width: "100%", // Make sure it spans the full width
                    position: "absolute", // Position it inside the box
                    bottom: "8px", // Adjust bottom margin to place it within the box
                    right: "10px", // Adjust to your preference for the right padding
                    color:
                      formData.certificate_subject.length > 90
                        ? "red"
                        : "text.secondary",
                  },
                }}
                sx={{
                  position: "relative", // Make the parent position relative for absolute positioning of the helper text
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={FORM_LABEL.ISSUER}
                variant="outlined"
                fullWidth
                name="issuer"
                value={formData.issuer}
                onChange={handleInputChange}
                required
              />
            </Grid>

            {/* Date Range Picker */}
            <Grid item xs={12} sm={6} style={{ padding: "3px 0px 3px 16px" }}>
              <Typography style={{ color: "#595959" }}>
                {FORM_LABEL.ISSUE_EXPIRY_DATE} <span>*</span>
              </Typography>
              <RangePicker
                onChange={handleDateChange}
                placeholder={[FORM_LABEL.ISSUE_DATE, FORM_LABEL.EXPIRY_DATE]}
                style={{ width: "100%", borderRadius: "4px" }}
              />
            </Grid>

            {/* Upload File */}
            <Grid item xs={12} sm={10}>
              <DropZoneFileUpload
                label={FORM_LABEL.FILE_UPLOAD}
                typeSelect={false}
                handleSubmitDocument={handleFileChange}
                maxFile={1}
              />
            </Grid>

            <Grid item xs={12} sm={12}>
              <Button
                type="submit"
                variant="contained"
                style={{
                  background: "#003a8c",
                  float: "right",
                  textTransform: "none",
                }}
              >
                {BUTTON_LABEL.SUBMIT}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>

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
};

export default CreateCertificate;
