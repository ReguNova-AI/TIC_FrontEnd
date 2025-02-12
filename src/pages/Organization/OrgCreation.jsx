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
  AccordionDetails,
  AccordionSummary,
  Accordion,
  Checkbox,
} from "@mui/material";

import AvatarUpload from "../Users/AvatarUpload";
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
import { UpCircleOutlined } from "@ant-design/icons";
import { OrganisationApiService } from "services/api/OrganizationAPIService";

// Steps for the stepper
const steps = [STEPPER_LABEL.ORG_DETAILS, STEPPER_LABEL.ORG_CONTACT];

export default function OrgCreation({ onHandleClose }) {
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set());
  const [industryData, setIndustryData] = useState([]);
  const [sectorData, setSectorData] = useState([]);
  const [filteredIndustries, setFilteredIndustries] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState([]);
  const [uploadedFileData, setUpoadedFileData] = useState("");
  const [error, setError]=useState("");

  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });

  const [errorValue, setErrorValue] = useState({
    emailError: "",
    phoneError: "",
  });

  const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  const phoneRegex = /^[0-9]{10}$/; // For a 10-digit phone number (adjust as needed)
  // Updated formData structure to match the desired format
  const [formData, setFormData] = React.useState({
    sector_id: 1,
    sector_name: "Nil",
    industries: "",
    industry_names:"",
    org_name: "",
    org_email: "test@test.test",
    org_logo: "",
    org_url: "",
    org_address: {
      street: "",
      city: "",
      country: "",
      zip: "",
    },
    contact_json: {
      primary_contact: {
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
      },
      secondary_contact: {
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
      },
    },
  });

  const isStepSkipped = (step) => skipped.has(step);

 
  const handleNext = () => {
    if (activeStep === 0 && !validateStep(0)) {
      return; // Stop if validation fails
    }
    setError("");

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
  useEffect(()=>{
    setFormData({
      ...formData,
      org_logo: uploadedFileData, // URL for avatar upload
    });
  },[uploadedFileData])


  const handleSubmit = () => {

    if (activeStep === 1 && !validateStep(1)) {
      return; // Stop if validation fails
    }

    if((errorValue.emailError !== "" && errorValue.emailError !== null) || (errorValue.phoneError !== "" && errorValue.phoneError !== null)){
      return;
    }

    setError("");

    // let filepayload = { documents: [uploadedFileData], type: "jpg" };
    // FileUploadApiService.fileUpload(filepayload)
    //   .then((response) => {
    //     setSnackData({
    //       show: true,
    //       message: response?.message || API_SUCCESS_MESSAGE.USER_CREATED,
    //       type: "success",
    //     });
    //     setFormData({
    //       ...formData,
    //       org_logo: "", // URL for avatar upload
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
    OrganisationApiService.organisationCreate(payload)
      .then((response) => {
        setSnackData({
          show: true,
          message: response?.message || API_SUCCESS_MESSAGE.USER_CREATED,
          type: "success",
        });
        setFormData({
          ...formData,
          sector_id: 1,
          sector_name: "Nil",
          industries: "",
          industry_names:"",
          org_name: "",
          org_email: "",
          org_logo: "",
          org_url: "",
          org_address: {
            street: "",
            city: "",
            country: "",
            zip: "",
          },
          contact_json: {
            primary_contact: {
              first_name: "",
              last_name: "",
              email: "",
              phone: "",
            },
            secondary_contact: {
              first_name: "",
              last_name: "",
              email: "",
              phone: "",
            },
          },
        });
        setActiveStep(0);
        onHandleClose(true);
      })
      .catch((errResponse) => {
        setSnackData({
          show: true,
          message:
            errResponse?.error?.message || errResponse.response.data.message === "Primary contact email is already in use" ? "Email Id is already in use, please try adding different email id" : API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
          type: "error",
        });
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("org_address")) {
      const field = name.split("_")[2]; // 'street', 'city', 'country', 'zip'
      setFormData({
        ...formData,
        org_address: {
          ...formData.org_address,
          [field]: value,
        },
      });
    } else if (name.startsWith("primary_contact") || name.startsWith("secondary_contact")) {
      // Split the name to get the contact type (primary_contact or secondary_contact) and the field (first_name, last_name, etc.)
      let [contactType, field] = name.split("_").slice(1); // ['primary_contact', 'first_name']
      let formattedField = field;

      if (name.startsWith("primary_contact")) {
        contactType = "primary_contact";
      } else {
        contactType = "secondary_contact";
      }
      // Check for first_name and last_name to correctly format it
      if (field === "first" || field === "last") {
        formattedField = field + "_name"; // 'first_name' or 'last_name'
      }
      // console.log("formattedField",formattedField,value)

      if(formattedField === "email")
      {
        if (!emailRegex.test(value)) {
          setErrorValue({
            ...errorValue,
            emailError: "Please enter a valid email address.",
          });
        } else {
          setErrorValue({
            ...errorValue,
            emailError: "",
          });
  
          checkEmailAvailablity(value);
        }

        setFormData({
          ...formData,
          org_email:value,
        });
      }
      console.log("formattedField",formattedField)

      if(formattedField === "phone")
      {
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

      setFormData({
        ...formData,
        contact_json: {
          ...formData.contact_json,
          [contactType]: {
            ...formData.contact_json[contactType],
            [formattedField]: value,
          },
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleAvatarUpload = (data) => {
    console.log(data);
    setUpoadedFileData(data);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  // Fetch organization and industry data
  useEffect(() => {
    fetchSectorDetails();
    fetchIndustryDetails();
  }, []);

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
        setFilteredIndustries(response?.data?.details || []); //added this logic to skip sector selection in future remove this logic if sector selection is required
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

  const handleSectorChange = (event) => {
    const sectorName = event.target.value;
    const SectorId =
      sectorData.find((sector) => sector.sector_name === sectorName)
        ?.sector_id || "";

    setFormData({
      ...formData,
      sector_name: sectorName,
      sector_id: SectorId,
    });

    // Filter the industries based on selected sector
    const filteredIndustries = industryData.filter(
      (industry) => industry.sector_id === SectorId
    );
    setFilteredIndustries(filteredIndustries);
  };

  const handleIndustryChange = (event) => {
    const { value } = event.target; // 'value' will be an array of selected industry IDs
    setSelectedIndustry(value); // Update state with the selected industries array

    // Update the formData with the selected industries (optional)
    setFormData({
      ...formData,
      industries: value, // Store array of selected industry IDs
      industry_names: filteredIndustries
        .filter((industry) => value.includes(industry.industry_id))
        .map((industry) => industry.industry_name),
        // .join(", "), // Optionally, store a comma-separated list of selected industry names
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

  const validateStep = (step) => {
    // Validate required fields for Step 1
    let requiredFields = []; 
    if(step === 0)
    {requiredFields = [
      "org_name",
      // "org_email",
      // "sector_name",
      "industries",
    ];
    for (const field of requiredFields) {
      if (!formData[field] || formData[field].length === 0) {
        setError("Please fill all the required fields")
        console.log("field",field)
        return false;
      }
    }
  }
  else
  {
    requiredFields = [
      "first_name",
      "last_name",
      "email",
      "phone"
    ];

    for (const field of requiredFields) {
      if (!formData?.contact_json.primary_contact[field] || formData?.contact_json.primary_contact[field].length === 0) {
        setError("Please fill all the required fields")
        return false;
      }
    }
  }

    return true;
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Grid container spacing={2} style={{ padding: "10px 10px 10px 0px" }}>
        <Grid item xs={12} sm={3} style={{ borderRight: "1px solid #dfdfdf" }}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((label, index) => {
              const stepProps = {};
              const labelProps = {};

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

        <Grid item xs={12} sm={9}>
          {activeStep === 0 ? (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12} style={{ padding: "18px" }}>
                <AvatarUpload onUpload={setUpoadedFileData} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={FORM_LABEL.ORG_NAME}
                  variant="outlined"
                  fullWidth
                  name="org_name"
                  value={formData.org_name}
                  onChange={handleInputChange}
                  required
                  inputProps={{
                    maxLength: 30, // Restrict input to 40 characters
                  }}
                />
              </Grid>
              {/* <Grid item xs={12} sm={6}>
                <TextField
                  label={FORM_LABEL.ORG_EMAIL}
                  variant="outlined"
                  fullWidth
                  name="org_email"
                  value={formData.org_email}
                  onChange={handleInputChange}
                  required
                  inputProps={{
                    maxLength: 30, // Restrict input to 40 characters
                  }}
                />
              </Grid> */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label={FORM_LABEL.ORG_WEBSITE}
                  variant="outlined"
                  fullWidth
                  name="org_url"
                  value={formData.org_url}
                  onChange={handleInputChange}
                  inputProps={{
                    maxLength: 30, // Restrict input to 40 characters
                  }}
                />
              </Grid>
              {/* <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{FORM_LABEL.SECTOR}</InputLabel>
                  <Select
                    value={formData.sector_name}
                    onChange={handleSectorChange} 
                    name="sector_name"
                    disabled={sectorData.length === 0}
                  >
                    {sectorData.map((sector) => (
                      <MenuItem
                        key={sector.sector_id}
                        value={sector.sector_name}
                      >
                        {sector.sector_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid> */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{FORM_LABEL.INDUSTRY}*</InputLabel>
                  <Select
                    value={selectedIndustry}
                    onChange={handleIndustryChange}
                    multiple
                    required
                    renderValue={(selected) => {
                      const selectedIndustries = filteredIndustries.filter(
                        (industry) => selected.includes(industry.industry_id)
                      );
                      return selectedIndustries
                        .map((industry) => industry.industry_name)
                        .join(", ");
                    }}
                    disabled={filteredIndustries.length === 0}
                  >
                    {filteredIndustries.map((industry) => (
                      <MenuItem
                        key={industry.industry_id}
                        value={industry.industry_id}
                      >
                        <Checkbox
                          checked={selectedIndustry.includes(
                            industry.industry_id
                          )}
                        />
                        {industry.industry_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={FORM_LABEL.STREET}
                  variant="outlined"
                  fullWidth
                  name="org_address_street"
                  value={formData.org_address.street}
                  onChange={handleInputChange}
                  inputProps={{
                    maxLength: 30, // Restrict input to 40 characters
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={FORM_LABEL.CITY}
                  variant="outlined"
                  fullWidth
                  name="org_address_city"
                  value={formData.org_address.city}
                  onChange={handleInputChange}
                  inputProps={{
                    maxLength: 30, // Restrict input to 40 characters
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={FORM_LABEL.COUNTRY}
                  variant="outlined"
                  fullWidth
                  name="org_address_country"
                  value={formData.org_address.country}
                  onChange={handleInputChange}
                  inputProps={{
                    maxLength: 30, // Restrict input to 40 characters
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={FORM_LABEL.ZIP}
                  variant="outlined"
                  fullWidth
                  name="org_address_zip"
                  value={formData.org_address.zip}
                  onChange={handleInputChange}
                  inputProps={{
                    maxLength: 10, // Restrict input to 40 characters
                  }}
                />
              </Grid>
             
            </Grid>
          ) : activeStep === 1 ? (
            <>
              {/* Primary Contact */}
              <Accordion defaultExpanded>
                <AccordionSummary
                  expandIcon={<UpCircleOutlined />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                >
                  <Typography component="span">
                    {FORM_LABEL.PRIMARY_CONTACT}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label={FORM_LABEL.FIRST_NAME}
                        variant="outlined"
                        fullWidth
                        name="primary_contact_first_name"
                        value={formData.contact_json.primary_contact.first_name}
                        onChange={handleInputChange}
                        required
                        inputProps={{
                          maxLength: 30, // Restrict input to 40 characters
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label={FORM_LABEL.LAST_NAME}
                        variant="outlined"
                        fullWidth
                        name="primary_contact_last_name"
                        value={formData.contact_json.primary_contact.last_name}
                        onChange={handleInputChange}
                        required
                        inputProps={{
                          maxLength: 30, // Restrict input to 40 characters
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label={FORM_LABEL.EMAIL}
                        variant="outlined"
                        fullWidth
                        name="primary_contact_email"
                        value={formData.contact_json.primary_contact.email}
                        error={!!errorValue.emailError}
                        helperText={errorValue.emailError}
                        onChange={handleInputChange}
                        required
                        inputProps={{
                          maxLength: 30, // Restrict input to 40 characters
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label={FORM_LABEL.PHONE}
                        variant="outlined"
                        fullWidth
                        name="primary_contact_phone"
                        value={formData.contact_json.primary_contact.phone}
                        onChange={handleInputChange}
                        error={!!errorValue.phoneError}
                        helperText={errorValue.phoneError}
                        required
                        inputProps={{
                          maxLength: 10, // Restrict input to 40 characters
                        }}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Secondary Contact */}
              <Accordion>
                <AccordionSummary
                  expandIcon={<UpCircleOutlined />}
                  aria-controls="panel2-content"
                  id="panel2-header"
                >
                  <Typography component="span">
                    {FORM_LABEL.SECONDARY_CONTACT}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label={FORM_LABEL.FIRST_NAME}
                        variant="outlined"
                        fullWidth
                        name="secondary_contact_first_name"
                        value={
                          formData.contact_json.secondary_contact.first_name
                        }
                        onChange={handleInputChange}
                        inputProps={{
                          maxLength: 30, // Restrict input to 40 characters
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label={FORM_LABEL.LAST_NAME}
                        variant="outlined"
                        fullWidth
                        name="secondary_contact_last_name"
                        value={
                          formData.contact_json.secondary_contact.last_name
                        }
                        onChange={handleInputChange}
                        inputProps={{
                          maxLength: 30, // Restrict input to 40 characters
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label={FORM_LABEL.EMAIL}
                        variant="outlined"
                        fullWidth
                        name="secondary_contact_email"
                        value={formData.contact_json.secondary_contact.email}
                        onChange={handleInputChange}
                        inputProps={{
                          maxLength: 30, // Restrict input to 40 characters
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label={FORM_LABEL.PHONE}
                        variant="outlined"
                        fullWidth
                        name="secondary_contact_phone"
                        value={formData.contact_json.secondary_contact.phone}
                        onChange={handleInputChange}
                        inputProps={{
                          maxLength: 10, // Restrict input to 40 characters
                        }}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </>
          ) : null}

          {activeStep <= 2 && (
            <>
            <span style={{color:"red"}}>{error}</span>
            <Box sx={{ display: "flex", flexDirection: "row", pt: 2, mt: 5 }}>
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
            </>
          )}
        </Grid>
      </Grid>
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
    </Box>
  );
}
