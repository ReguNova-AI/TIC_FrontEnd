import React, { useEffect, useState } from "react";
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
  Input
} from "@mui/material";

import DropZoneFileUpload from "./DropZoneFileUpload";
import UserProfileCard from "./UserProfileCard";
import BreadcrumbsView from "components/Breadcrumbs";
import { ProjectApiService } from "services/api/ProjectAPIService";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { formatDateToCustomFormat } from "shared/utility";
import { API_ERROR_MESSAGE, API_SUCCESS_MESSAGE, BUTTON_LABEL, FORM_LABEL, HEADING } from "shared/constants";
import { UserApiService } from "services/api/UserAPIService";
import { AdminConfigAPIService } from "services/api/AdminConfigAPIService";
import { FileUploadApiService } from "services/api/FileUploadAPIService";
import { Spin } from "antd";

const MyForm = () => {
  const [submissionStatus, setSubmissionStatus] = useState("");
  const navigate = useNavigate();
  const [userData, setUserData] = useState([]); // Initially, set userData as an empty array
  const [standardData,setStandardData] = useState([]);
  const [loading,setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [industryData, setIndustryData] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState("");
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
    invite_Users:[],
    document: {},
    status: "",
    invited_user_list:[],
    mapping_standards:"",
    checkListResponse:"",
    industry_id:"",
    industry_name:"",
  });

  const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));
  const industryDetails = userdetails?.[0]?.industries;

  // Fetch the user data when the component mounts
  useEffect(() => {
    fetchUserData();
    fetchStandardData();
    if(industryDetails?.length > 1)
    {
      fetchIndustryData();
    }
  }, []);

   const fetchIndustryData = () => {
      UserApiService.industryDetails()
        .then((response) => {
          setSnackData({
            show: true,
            message:
              response?.message || API_SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY,
            type: "success",
          });
          setIndustryData(response?.data?.details?.filter(data => industryDetails?.includes(data.industry_id)) || []); // Use an empty array as fallback
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

  const fetchUserData = () => {
    UserApiService.userListing()
      .then((response) => {
        if (response && response?.data) {
          const userEmailToExclude = userdetails?.[0]?.user_email;
          const filteredUsers = response?.data?.activeUsers?.filter(user => user.user_email !== userEmailToExclude);
  
          setUserData(filteredUsers); //
         
          // setUserData(response?.data?.activeUsers ); // Assuming response.data contains the user list
          setSnackData({
            show: true,
            message: response?.message || API_SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY,
            type: "success",
          });
        }
      })
      .catch((errResponse) => {
        setSnackData({
          show: true,
          message:
            errResponse?.error?.message || API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
          type: "error",
        });
      });
  };

  const fetchStandardData = () => {
    AdminConfigAPIService.standardListing()
      .then((response) => {
        // Check the response structure and map data accordingly
        if (response?.data?.details) {
          setStandardData(response?.data?.details);
        }
        setLoading(false);

        setSnackData({
          show: true,
          message:
            response?.message || API_SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY,
          type: "success",
        });
      })
      .catch((errResponse) => {
        setLoading(false);
        setSnackData({
          show: true,
          message:
            errResponse?.error?.message ||
            API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
          type: "error",
        });
      });
  };

  const renderFileData = async (files) => {
    const filesArray = Array.isArray(files) ? files : Array.from(files);

    setLoading(true);
    const processedFiles = await Promise.all(
      filesArray && filesArray?.map(async (file) => {
        let uploadedLink = null;

        // Create a new FileReader to read the file as Base64
        const reader = new FileReader();

        const fileDataUrl = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject; // Handle any errors while reading the file
          reader.readAsDataURL(file); // Start reading the file
        });

        // Now that the file is read, upload the Base64 data to the API
        try {
          const fileType = file.name.split(".").pop();
          const filepayload = {
            documents: [fileDataUrl],
            type: fileType,
          };

          const response = await FileUploadApiService.fileUpload(filepayload);

          if (response) {
            setSnackData({
              show: true,
              message:
                response?.message || API_SUCCESS_MESSAGE.UPLOADED_SUCCESSFULLY,
              type: "success",
            });
            setLoading(false);
            setFormData({
              ...formData,
              mapping_standards: response.data.details[0], // Set file name in the select field
              regulatory:files?.[0]?.name,
            });
          }
          
        } catch (errResponse) {
          console.log("errResponse", errResponse);
          return null;
        }
      })
    );
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setFormData({
        ...formData,
        regulatory: uploadedFile.name, // Set file name in the select field
      });
      renderFileData(e.target.files);
    }
  };

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

  const handleMultiple = (selectedIds)=>{
    const invitedId=formData.invited_user_list;
    const selectedMembers = selectedIds?.map((userId) => {
      const member = userData.find((user) => user.user_id === userId);
      if(member)
      {
        invitedId.push(member.user_id);
      }
      return member ? { user_id: member.user_id, user_name: `${member.user_first_name} ${member.user_last_name}`, user_email: member.user_email, user_profile: member.user_profile } : null;
    }).filter(Boolean);      
    setFormData({
      ...formData,
      invite_Users: selectedMembers,
      invited_user_list:invitedId,
    });
    return selectedMembers;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));
    const updatedStatus = submissionStatus === 'Draft' ? 'Draft' : 'In Progress';
    const selectedUserData=handleMultiple(formData.teamMembers);


    const historyItem = {
      changedby: userdetails?.[0]?.user_first_name + " " + userdetails?.[0]?.user_last_name,
      date: new Date().toISOString(),
      changes: {
        projectName: formData.projectName || "",
        projectNo: formData.projectNo || "",
        description: formData.projectDesc || "",
        invite: '', 
        documents: formData.document || "", 
        checklistRun: "", 
        assessmentRun: '',
        standardUplaoded: "",
        status: updatedStatus, 
      },
    };

    const payload = {
      project_name: formData.projectName,
      project_no: formData.projectNo,
      project_description: formData.projectDesc,
      regulatory_standard: formData.regulatory,
      invite_members: selectedUserData,
      invited_user_list:formData.invited_user_list,
      documents: formData.document, 
      org_id: userdetails?.[0]?.org_id,
      org_name: userdetails?.[0]?.org_name,
      created_by_id: userdetails?.[0]?.user_id,
      created_by_name:
        userdetails?.[0]?.user_first_name + " " + userdetails?.[0]?.user_last_name,
      sector_id:  userdetails?.[0]?.sector_id,
      sector_name: userdetails?.[0]?.sector_name,
      industry_id: formData.industry_id || userdetails?.[0]?.industry_id|| userdetails?.[0]?.industries?.[0],
      industry_name: formData.industry_name || userdetails?.[0]?.industry_names || userdetails?.[0]?.industries?.[0],
      status: updatedStatus,
      // no_of_runs: updatedStatus === "Draft" ? 0 : 1,
      no_of_runs:0,
      success_count: 0,
      fail_count: 0,
      // last_run: submissionStatus === 'Draft' ? null : formatDateToCustomFormat(new Date()),
      mapping_standards: formData.mapping_standards,
      summary_report: {},
      history:[historyItem],
      checkListResponse:formData?.checkListResponse,
    };
    if (submissionStatus !== 'Draft') {
      payload.last_run = formatDateToCustomFormat(new Date());
    }
    
    ProjectApiService.projectCreate(payload)
      .then((response) => {
        setSnackData({
          show: true,
          message: response.message,
          type: "success",
        });
        console.log("payload",payload);
        const projectId= response?.data?.details?.[0].project_id;
        navigate(`/projectView/${projectId}`, { state: { projectId:projectId,projectName: formData.projectName } });
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

  const checklistfile = document.getElementById("fileInput")?.files;

  const handleAddFileClick = () => {
    document.getElementById("fileInput").click(); // Trigger the file input field
  };


  const checklistResponseCheck = (value)=>{
   const result= standardData?.filter(data=> data.standard_name === value);
   const finalarray = [];

   result?.[0]?.checkListResponse?.checklist?.map(item=>{
    finalarray.push(item?.replace(/\\n/g,"")?.replace(/\n/g,"")?.replace(/\\"/g,"")?.replace(/\"/g,"")?.replace(/'/g,""));
   })

  //  console.log("result",result?.[0]?.checkListResponse)
    return {checklist:finalarray};
  //  setFormData({...formData , checkListResponse:result?.[0]?.checkListResponse})
  }


  const handleIndustryChange = (event) => {
    const industryId = event.target.value;
    setSelectedIndustry(industryId);

    const selectedIndustry = industryData.find(
      (industry) => industry.industry_id === industryId
    );

    setFormData({
      ...formData,
      industry_id: selectedIndustry?.industry_id || "",
      industry_name: selectedIndustry?.industry_name || "",
    });
  };

  return (
    <>
      <BreadcrumbsView currentPage="Create Project"/>
      <Spin tip="Uploading Regulatory Standard" size="large" spinning={loading}>
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
                helperText={`${formData.projectDesc?.length}/200`}
                FormHelperTextProps={{
                  sx: {
                    textAlign: "right",
                    width: "100%",
                    position: "absolute",
                    bottom: "8px",
                    right: "10px",
                    color:
                      formData.projectDesc.length > 180
                        ? "red"
                        : "text.secondary",
                  },
                }}
                sx={{
                  position: "relative",
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
          // onChange={(e) => { setFormData({ ...formData, regulatory: e.target.value,checkListResponse:checklistResponseCheck(e.target.value) })}}
          onChange={(e) => { setFormData({ ...formData, regulatory: e.target.value })}}
          required
        >
         

          {/* Show the file name if a file is selected */}
          {file && (
            <MenuItem key={file.name} value={file.name}>
              {file.name}
            </MenuItem>
          )}

          {/* Other options for standard data */}
          {standardData?.map(sData => (
            <MenuItem key={sData.standard_name} value={sData.standard_name}>
              {sData.standard_name}
            </MenuItem>
          ))}
           <MenuItem >
            <Button
              variant="outlined"
              component="label"
              size="small"
              style={{ textTransform: 'none' }}
              onClick={handleAddFileClick} // Open the popover when clicked
            >
              Add Standard
            </Button>
          </MenuItem>
        </Select>
      </FormControl>
{/* hidden input field to handle custom file upload */}
      <input
        type="file"
        id="fileInput"
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />
            </Grid>
            {industryData?.length > 1 && 
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>
                    {FORM_LABEL.INDUSTRY}
                    <span>*</span>
                  </InputLabel>
                  <Select
                    value={selectedIndustry}
                    onChange={handleIndustryChange}
                  >
                    {/* <MenuItem value="">
                        <em>None</em>
                      </MenuItem> */}
                    {industryData.map((industry) => (
                      <MenuItem
                        key={industry.industry_id}
                        value={industry.industry_id}
                      >
                        {industry.industry_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            }


            <Grid item xs={12} sm={industryData?.length > 1 ? 4 :8}>
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
        {selected?.map((value) => {
          const member = userData.find(
            (member) => member.user_id === value
          );
          return (
            <Chip
              key={value}
              label={member.user_email}
              sx={{ margin: 0.5 }}
            />
          );
        })}
      </Box>
    )}
  >
    {/* Conditionally render "No data found" if userData is empty */}
    {userData?.length === 0 ? (
      <MenuItem disabled>No data found</MenuItem>
    ) : (
      userData?.map((member) => (
        <MenuItem key={member.user_id} value={member.user_id}>
          {member.user_first_name} {member.user_last_name} - {member.user_email}
        </MenuItem>
      ))
    )}
  </Select>
</FormControl>

            </Grid>

            {/* Render Profile Cards for Selected Team Members */}
            <Grid item xs={12} sm={12}>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                {formData.teamMembers?.map((selectedId) => {
                  const member = userData.find(
                    (user) => user.user_id === selectedId
                  );
                  return member ? (
                    <UserProfileCard
                      key={member.user_id}
                      id={member.user_id}
                      name={member.user_first_name}
                      role={member.user_email}
                      profile={member.user_profile}
                      onDelete={handleProfileDelete}
                    />
                  ) : null;
                })}
              </Box>
            </Grid>

            {/* Upload File */}
            <Grid item xs={12} sm={8}>
              <DropZoneFileUpload label={FORM_LABEL.DOCUMENT_UPLOAD} typeSelect={false} handleSubmitDocument={handleFileChange} maxFile={0}/>
            </Grid>

            <Grid item xs={12} sm={12}>
              {/* <Button
                type="submit"
                variant="contained"
                onClick={() => {
                  setSubmissionStatus("In Progress");
                }}
                style={{
                  background: "#003a8c",
                  float: "right",
                  textTransform: "none",
                }}
              >
               {BUTTON_LABEL.RUN_PROJECT}
              </Button> */}
              <Button
                type="submit"
                variant="contained"
                onClick={() => {
                  setSubmissionStatus("Draft");
                }}
                style={{
                  background: "#003a8c",
                  float: "right",
                  textTransform: "none",
                }}
              >
                {BUTTON_LABEL.SAVE_PROJECT}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
      </Spin>
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

export default MyForm;
