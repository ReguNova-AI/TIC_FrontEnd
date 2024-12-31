import React, { useState } from "react";
import {
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Grid,
  Box,
  Chip,
  Typography,
} from "@mui/material";

import DropZoneFileUpload from "./DropZoneFileUpload";
import UserProfileCard from "./UserProfileCard";
import BreadcrumbsView from "components/Breadcrumbs";
import { ProjectApiService } from "services/api/ProjectAPIService";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { formatDateToCustomFormat } from "shared/utility";
import { API_ERROR_MESSAGE, BUTTON_LABEL, FORM_LABEL, HEADING } from "shared/constants";


const MyForm = () => {
  const [submissionStatus, setSubmissionStatus] = useState("");
  const navigate = useNavigate();
  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });


  const [formData, setFormData] = useState({
    projectName: "",
    projectNo: "",
    projectDesc: "",
    teamMembers: [], // Array to hold selected team members
    regulatory: "",
    document: {},
    status: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (file) => {
    setFormData({
      ...formData,
      document: file,
    });
  };

  const handleSelectChange = (e) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      teamMembers: value, // Update selected team members
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));
    const updatedStatus = submissionStatus === 'Draft' ? 'Draft' : 'In Progress';

    const payload = {
      project_name: formData.projectName,
      project_no: formData.projectNo,
      project_description: formData.projectDesc,
      regulatory_standard: formData.regulatory,
      invite_members: formData.teamMembers,
      documents: formData.document,
      org_id: userdetails[0]?.org_id,
      org_name: userdetails[0]?.org_name,
      created_by_id: userdetails[0]?.user_id,
      created_by_name:
        userdetails[0]?.user_first_name + " " + userdetails[0]?.user_last_name,
      sector_id: 5,
      sector_name: "Healthcare",
      industry_id: 3,
      industry_name: "Pharmaceuticals",
      status: updatedStatus,
      no_of_runs: 0,
      success_count: 0,
      fail_count: 0,
      last_run: formatDateToCustomFormat(new Date()),
      mapping_standards: "#erfg5674",
      summary_report: {},
    };

    console.log("payload",payload);

    ProjectApiService.projectCreate(payload)
      .then((response) => {
        // On success, you can add any additional logic here
        
          setSnackData({
            show: true,
            message: response.message,
            type: "success",
          });
          navigate("/projectView" , {
            state: {projectName: formData.projectName }, // Pass props here
          });
        
      })
      .catch((errResponse) => {
        
        setSnackData({
          show: true,
          message: errResponse?.error?.message || API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
          type: "error",
        });
      });
    
  };

  const handleProfileDelete = (id) => {
    setFormData({
      ...formData,
      teamMembers: formData.teamMembers.filter((memberId) => memberId !== id),
    });
  };

  // Predefined list of users to be selected
  const teamMembersList = [
    { id: 1, name: "Murtaza Salumber", role: "Software Developer" },
    { id: 2, name: "Ali Khan", role: "Project Manager" },
    { id: 3, name: "Sara Ahmed", role: "UI/UX Designer" },
    { id: 4, name: "John Doe", role: "Backend Developer" },
  ];

  return (
    <>
      <BreadcrumbsView />
      <Box
        sx={{
          margin: "auto",
          padding: 3,
          background: "#fff",
          borderRadius: "10px",
          boxShadow: "6px 12px 20px #e4e4e4",
        }}
      >
        <Typography variant="h4" gutterBottom>
          {HEADING.CREATE_NEW_PROJECT}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* First row - 3 items */}
            <Grid item xs={12} sm={4}>
              <TextField
                label={FORM_LABEL.PROJECT_NAME}
                variant="outlined"
                fullWidth
                name="projectName"
                value={formData.projectName}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label={FORM_LABEL.PROJECT_NO}
                variant="outlined"
                fullWidth
                name="projectNo"
                value={formData.projectNo}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label={FORM_LABEL.PROJECT_DESC}
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                name="projectDesc"
                value={formData.projectDesc}
                onChange={handleInputChange}
                required
                inputProps={{ maxLength: 200 }}
                helperText={`${formData.projectDesc.length}/200`}
                FormHelperTextProps={{
                  sx: {
                    textAlign: "right", // Float the text to the right
                    width: "100%", // Make sure it spans the full width
                    position: "absolute", // Position it inside the box
                    bottom: "8px", // Adjust bottom margin to place it within the box
                    right: "10px", // Adjust to your preference for the right padding
                    color:
                      formData.projectDesc.length > 180
                        ? "red"
                        : "text.secondary",
                  },
                }}
                sx={{
                  position: "relative", // Make the parent position relative for absolute positioning of the helper text
                }}
              />
            </Grid>

            {/* Second row - 2 items */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="regulatory-label">
                  {FORM_LABEL.REGULATORY_STANDARDS}
                </InputLabel>
                <Select
                  labelId="regulatory-label"
                  id="regulatory"
                  value={formData.regulatory}
                  label={FORM_LABEL.REGULATORY}
                  name="regulatory"
                  onChange={handleInputChange}
                  required
                >
                  <MenuItem value="Reg1">Regulatory 1</MenuItem>
                  <MenuItem value="Reg2">Regulatory 2</MenuItem>
                  <MenuItem value="Reg3">Regulatory 3</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="teamMembers-label">
                  {FORM_LABEL.INVITE_MEMBERS}
                </InputLabel>
                <Select
                  labelId="teamMembers-label"
                  id="teamMembers"
                  multiple
                  value={formData.teamMembers}
                  onChange={handleSelectChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                      {selected.map((value) => {
                        const member = teamMembersList.find(
                          (member) => member.id === value
                        );
                        return (
                          <Chip
                            key={value}
                            label={member.name}
                            sx={{ margin: 0.5 }}
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {teamMembersList.map((member) => (
                    <MenuItem key={member.id} value={member.id}>
                      {member.name} - {member.role}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Render Profile Cards for Selected Team Members (after the Invite Dropdown) */}
            <Grid item xs={12} sm={12}>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                {formData.teamMembers.map((selectedId) => {
                  const member = teamMembersList.find(
                    (user) => user.id === selectedId
                  );
                  return member ? (
                    <UserProfileCard
                      key={member.id}
                      id={member.id}
                      name={member.name}
                      role={member.role}
                      onDelete={handleProfileDelete}
                    />
                  ) : null;
                })}
              </Box>
            </Grid>

            {/* Upload File */}
            <Grid item xs={12} sm={8}>
              <DropZoneFileUpload label={FORM_LABEL.DOCUMENT_UPLOAD} typeSelect={true} handleSubmitDocument={handleFileChange} maxFile={0}/>
            </Grid>
            {/* <Grid item xs={12} sm={6}>
            <DropZoneFileUpload label="Custom Regulatory Upload" />
          </Grid> */}

            <Grid item xs={12} sm={12}>
              <Button
                type="submit"
                variant="contained"
                onClick={() => {
                  setSubmissionStatus("In Progress"); // Set status to in progress
                }}
                style={{
                  background: "#003a8c",
                  float: "right",
                  textTransform: "none",
                }}
              >
               {BUTTON_LABEL.RUN_PROJECT}
              </Button>
              <Button
                type="submit"
                variant="outlined"
                onClick={() => {
                  setSubmissionStatus("Draft"); // Set status to in progress
                }}
                style={{
                  float: "right",
                  marginRight: "10px",
                  textTransform: "none",
                }}
              >
                {BUTTON_LABEL.SAVE_DRAFT}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
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
};

export default MyForm;
