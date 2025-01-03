import * as React from "react";
import {
  TextField,
  Button,
  Grid,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import AvatarUpload from "./AvatarUpload";
import {
  API_ERROR_MESSAGE,
  API_SUCCESS_MESSAGE,
  BUTTON_LABEL,
  FORM_LABEL,
  STEPPER_LABEL,
} from "shared/constants";
import { UserApiService } from "services/api/UserAPIService";
import { useState, useEffect } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { FileUploadApiService } from "services/api/FileUploadAPIService";

// Steps for the stepper
const steps = [
  STEPPER_LABEL.PERSONAl_DETAILS,
  STEPPER_LABEL.ADDRESS_DETAILS,
  STEPPER_LABEL.ORG_DETAILS,
];

export default function UserCreation({ onHandleClose }) {
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set());
  const [orgData, setOrgData] = useState([]);
  const [industryData, setIndustryData] = useState([]);
  const [roleData, setRoleData] = useState([]);
  const [sectorData, setSectorData] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState("");
  const [filteredIndustries, setFilteredIndustries] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [filteredSectors, setFilteredSectors] = useState([]); // Holds sectors filtered by organization
  const [uploadedFileData, setUpoadedFileData] = useState("");
  const [mandatoryError, setMandatoryError] = useState("");

  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });

  const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));
  // Updated formData structure to match the desired format
  const [formData, setFormData] = React.useState({
    role_id: 4,
    user_first_name: "",
    user_last_name: "",
    user_profile: "", // URL for avatar upload
    user_email: "",
    user_phone_no: "",
    user_address: {
      street: "",
      city: "",
      state: "",
      zip: "",
    },
    sector_id: "",
    sector_name: "",
    org_id: "",
    org_name: "",
    industry_id: "",
    industry_name: "",
    created_by: userdetails?.[0]?.user_id,
  });

  const [errorValue, setErrorValue] = React.useState({
    emailError: "",
    phoneError: "",
  });

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  const phoneRegex = /^[0-9]{10}$/; // For a 10-digit phone number (adjust as needed)

  const isStepOptional = (step) => step === 1;
  const isStepSkipped = (step) => skipped.has(step);
  
  const handleNext = () => {
    if (activeStep === 0 && !validateStep()) {
      return; // Stop if validation fails
    }
    if(errorValue.emailError !== "" && errorValue.emailError !== NULL && errorValue.phoneError !== "" && errorValue.phoneError !== NULL){
      return;
    }
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const setValuetoNull = ()=>{
    setFormData({
      ...formData,
      role_id: null,
      user_first_name: "",
      user_last_name: "",
      user_profile: "", // URL for avatar upload
      user_email: "",
      user_phone_no: "",
      user_address: {
        street: "",
        city: "",
        state: "",
        zip: "",
      },
      sector_id: "",
      sector_name: "",
      org_id: "",
      org_name: "",
      industry_id: "",
      industry_name: "",
      created_by: userdetails?.[0]?.user_id,
    });
  }

  const handleSubmit = () => {
    if (!validateStep("final")) {
      return; // Stop if validation fails
    }

    // let filepayload = { documents: [uploadedFileData], type: "jpg" };
    // FileUploadApiService.fileUpload(filepayload)
    //   .then((response) => {
    //     setSnackData({
    //       show: true,
    //       message: response?.message || API_SUCCESS_MESSAGE.USER_CREATED,
    //       type: "success",
    //     });
    //     const url = response?.data?.details?.[0];

    //     setFormData({
    //       ...formData,
    //       user_profile: url, // URL for avatar upload
    //     });
    //   })
    //   .catch((errResponse) => {
    //     setSnackData({
    //       show: true,
    //       message:
    //         errResponse?.error?.message ||
    //         API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
    //       type: "error",
    //     });
    //   });

    let payload = formData;
    UserApiService.userCreate(payload)
      .then((response) => {
        setSnackData({
          show: true,
          message: response?.message || API_SUCCESS_MESSAGE.USER_CREATED,
          type: "success",
        });
        setValuetoNull()
        setActiveStep(0);
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

  const validateStep = (key) => {
    let requiredFields = [];
    if (key === "final") {
      requiredFields = [
        "user_first_name",
        "user_last_name",
        "user_email",
        "user_phone_no",
        "sector_id",
        "org_id",
        "industry_id",
      ];
    } else {
      // Validate required fields for Step 1
      requiredFields = [
        "user_first_name",
        "user_last_name",
        "user_email",
        "user_phone_no",
      ];
    }

    for (const field of requiredFields) {
      if (!formData[field] || formData[field].length === 0) {
        setMandatoryError("Please fill all the required fields");
        return false;
      }
    }
    setMandatoryError("");
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "user_email") {
      if (!emailRegex.test(value)) {
        setErrorValue({
          ...errorValue,
          emailError: "Please enter a valid email address.",
        });
      } else {
        setErrorValue({
          ...formData,
          emailError: "",
        });

        checkEmailAvailablity(value);
        
      }
    }

    // Phone validation
    if (name === "user_phone_no") {
      if (!phoneRegex.test(value)) {
        setErrorValue({
          ...errorValue,
          phoneError: "Phone number should be 10 digits.",
        });
      } else {
        setErrorValue({
          ...errorValue,
          phoneError: "",
        });
      }
    }

    if (name.includes("user_address")) {
      const [field] = name.split("_").slice(2); // Extract field from user_address
      setFormData({
        ...formData,
        user_address: {
          ...formData.user_address,
          [field]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    validateStep();
  };

  const handleAvatarUpload = (data) => {
    console.log(data);
    setUpoadedFileData(data);
  };

  useEffect(()=>{
    setFormData({
      ...formData,
      user_profile: uploadedFileData, // URL for avatar upload
    });
  },[uploadedFileData])

  const handleReset = () => {
    setActiveStep(0);
  };

  // Fetch organization and industry data
  useEffect(() => {
    fetchOrgDetails();
    fetchSectorDetails();
    fetchIndustryDetails();
    fetchRole();
  }, []);

  const fetchOrgDetails = () => {
    UserApiService.orgDetails()
      .then((response) => {
        setSnackData({
          show: true,
          message:
            response?.message || API_SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY,
          type: "success",
        });
        setOrgData(response?.data?.details || []); // Use an empty array as fallback
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

  const fetchIndustryDetails = () => {
    UserApiService.industryDetails()
      .then((response) => {
        setSnackData({
          show: true,
          message:
            response?.message || API_SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY,
          type: "success",
        });
        setIndustryData(response?.data?.details || []); // Use an empty array as fallback
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

  const fetchSectorDetails = () => {
    UserApiService.sectorDetails()
      .then((response) => {
        setSnackData({
          show: true,
          message:
            response?.message || API_SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY,
          type: "success",
        });
        const sectors = response?.data?.details || []; // Use an empty array as fallback
        setSectorData(sectors);
        // setFilteredSectors(
        //   sectors.sort((a, b) => a.sector_name.localeCompare(b.sector_name))
        // ); // Sort sectors alphabetically
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

  const fetchRole= () => {
    UserApiService.roleDetails()
      .then((response) => {
        setSnackData({
          show: true,
          message:
            response?.message || API_SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY,
          type: "success",
        });
        setRoleData(response?.data?.details || []); // Use an empty array as fallback
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

  const checkEmailAvailablity = (value)=>{
    UserApiService.userEmailCheck(value)
    .then((response) => {
      

      if(response?.data?.message === "User exist")
      {
        setErrorValue({
          ...errorValue,
          emailError: "Email Id already exists. Please add another email id",
        });
        return false;
      }
      else
      {
        setErrorValue({
          ...errorValue,
          emailError: "",
        });
        return true;
      }
     
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

    setErrorValue({
      ...errorValue,
      emailError: "",
    });
    return true;
  }

  const handleOrgChange = (event) => {
    const orgId = event.target.value;
    setSelectedOrg(orgId);

    // Find the selected organization
    const selectedOrganization = orgData.find((org) => org.org_id === orgId);
    const industryIds = JSON.parse(selectedOrganization?.industries || "[]");

    const sectors = Array.isArray(selectedOrganization?.sector_id)
      ? selectedOrganization.sector_id
      : [];

    // Filter industries based on the organization's available industries
    const availableIndustries = industryData.filter((industry) =>
      industryIds.includes(industry.industry_id)
    );

    setFilteredIndustries(availableIndustries);
    setSelectedIndustry(""); // Reset selected industry

    // Filter sectors based on the selected organization
    const availableSectors = sectorData.filter(
      (sector) => sector.sector_id === selectedOrganization?.sector_id
    );

    setFilteredSectors(availableSectors);

    setFormData({
      ...formData,
      org_id: selectedOrganization?.org_id || "",
      org_name: selectedOrganization?.org_name || "",
    });
  };

  const handleSectorChange = (event) => {
    const sectorName = event.target.value;
    setFormData({
      ...formData,
      sector_name: sectorName,
      // You could also update sector_id if you have the mapping between sector_name and sector_id
      sector_id:
        filteredSectors.find((sector) => sector.sector_name === sectorName)
          ?.sector_id || "",
    });
  };

  const handleIndustryChange = (event) => {
    const industryId = event.target.value;
    setSelectedIndustry(industryId);

    const selectedIndustry = filteredIndustries.find(
      (industry) => industry.industry_id === industryId
    );

    setFormData({
      ...formData,
      industry_id: selectedIndustry?.industry_id || "",
      industry_name: selectedIndustry?.industry_name || "",
    });
  };

  const handleRoleChange = (event) => {
    const roleId = event.target.value;
    setFormData({
      ...formData,
      role_id: roleId,
    });
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Grid container spacing={2} style={{ padding: "10px 10px 10px 0px" }}>
        <Grid item xs={12} sm={4} style={{ borderRight: "1px solid #dfdfdf" }}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((label, index) => {
              const stepProps = {};
              const labelProps = {};
              if (isStepOptional(index)) {
                labelProps.optional = (
                  <Typography variant="caption">
                    {FORM_LABEL.OPTIONAL}
                  </Typography>
                );
              }
              if (isStepSkipped(index)) {
                stepProps.completed = false;
              }
              return (
                <Step key={label} {...stepProps}>
                  <StepLabel {...labelProps}>{label}</StepLabel>
                </Step>
              );
            })}
          </Stepper>
        </Grid>

        <Grid item xs={12} sm={8}>
          {activeStep === 0 ? (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12} style={{ padding: "18px" }}>
                <AvatarUpload onUpload={setUpoadedFileData} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={FORM_LABEL.FIRST_NAME}
                  variant="outlined"
                  fullWidth
                  name="user_first_name"
                  value={formData.user_first_name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={FORM_LABEL.LAST_NAME}
                  variant="outlined"
                  fullWidth
                  name="user_last_name"
                  value={formData.user_last_name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={FORM_LABEL.EMAIL}
                  variant="outlined"
                  fullWidth
                  name="user_email"
                  value={formData.user_email}
                  onChange={handleInputChange}
                  error={!!errorValue.emailError}
                  helperText={errorValue.emailError}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={FORM_LABEL.PHONE}
                  variant="outlined"
                  fullWidth     
                  name="user_phone_no"
                  value={formData.user_phone_no}
                  onChange={handleInputChange}
                  error={!!errorValue.phoneError}
                  helperText={errorValue.phoneError}
                  required
                />
              </Grid>
            </Grid>
          ) : activeStep === 1 ? (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={FORM_LABEL.STREET}
                  variant="outlined"
                  fullWidth
                  name="user_address_street"
                  value={formData.user_address.street}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={FORM_LABEL.CITY}
                  variant="outlined"
                  fullWidth
                  name="user_address_city"
                  value={formData.user_address.city}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={FORM_LABEL.STATE}
                  variant="outlined"
                  fullWidth
                  name="user_address_state"
                  value={formData.user_address.state}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={FORM_LABEL.ZIP}
                  variant="outlined"
                  fullWidth
                  name="user_address_zip"
                  value={formData.user_address.zip}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>
          ) : activeStep === 2 ? (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>
                    {FORM_LABEL.ORGANIZATION}
                    <span>*</span>
                  </InputLabel>
                  <Select value={selectedOrg} onChange={handleOrgChange}>
                    {/* <MenuItem value="">
                      <em>None</em>
                    </MenuItem> */}
                    {orgData.map((org) => (
                      <MenuItem key={org.org_id} value={org.org_id}>
                        {org.org_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>
                    {FORM_LABEL.SECTOR}
                    <span>*</span>
                  </InputLabel>
                  <Select
                    value={formData.sector_name}
                    onChange={handleSectorChange}
                    name="sector_name"
                    disabled={filteredSectors.length === 0}
                  >
                    {/* <MenuItem value="">
                      <em>None</em>
                    </MenuItem> */}
                    {filteredSectors.map((sector) => (
                      <MenuItem
                        key={sector.sector_id}
                        value={sector.sector_name}
                      >
                        {sector.sector_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>
                    {FORM_LABEL.INDUSTRY}
                    <span>*</span>
                  </InputLabel>
                  <Select
                    value={selectedIndustry}
                    onChange={handleIndustryChange}
                    disabled={filteredIndustries.length === 0}
                  >
                    {/* <MenuItem value="">
                      <em>None</em>
                    </MenuItem> */}
                    {filteredIndustries.map((industry) => (
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
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>
                    {FORM_LABEL.ROLE}
                    <span>*</span>
                  </InputLabel>
                  <Select
                    value={formData.role_id}
                    onChange={handleRoleChange}
                    disabled={roleData.length === 0}
                  >
                    {/* <MenuItem value="">
                      <em>None</em>
                    </MenuItem> */}
                    {roleData.map((role) => (
                      <MenuItem
                        key={role.role_id}
                        value={role.role_id}
                      >
                        {role.role_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          ) : null}

          {activeStep <= 2 && (
            
           
            <Box sx={{pt: 2, mt: 4}}>
               <span style={{ color: "red",marginBottom:"20px", display:"block" }}>{mandatoryError}</span>
            <Box sx={{ display: "flex", flexDirection: "row" }}>
              
              {activeStep !== 0 && (
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                  variant="outlined"
                >
                  {BUTTON_LABEL.BACK}
                </Button>
              )}
              <Box sx={{ flex: "1 1 auto" }} />
              {isStepOptional(activeStep) && (
                <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                  {BUTTON_LABEL.SKIP}
                </Button>
              )}
              <Button
                onClick={
                  activeStep === steps.length - 1 ? handleSubmit : handleNext
                }
                variant="contained"
              >
                {activeStep === steps.length - 1
                  ? BUTTON_LABEL.FINISH
                  : BUTTON_LABEL.NEXT}
              </Button>
            </Box>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
