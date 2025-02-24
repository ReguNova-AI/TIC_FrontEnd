import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Grid,
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import {
  API_ERROR_MESSAGE,
  API_SUCCESS_MESSAGE,
  BUTTON_LABEL,
  FORM_LABEL,
  STATUS,
} from "shared/constants";
import { AdminConfigAPIService } from "services/api/AdminConfigAPIService";
import { UserApiService } from "services/api/UserAPIService";
import DropZoneFileUpload from "pages/ProjectCreation/DropZoneFileUpload";

const StandardCreation = ({ onHandleClose }) => {
  const navigate = useNavigate();
  const [sectorData, setSectorData] = useState([]);
  const [industryData, setIndustryData] = useState([]);

  const [filteredIndustries, setFilteredIndustries] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });

  const [formData, setFormData] = useState({
    industry_name: "",
    industry_description: "d",
    standard_name: "",
    file_name: "",
    file_url: "",
  });

  useEffect(() => {
    fetchSectorDetails();
  }, []);

  const fetchSectorDetails = () => {

    // uncomment this code if sector listing is required

    // AdminConfigAPIService.sectorListing()
    //   .then((response) => {
    //     // setSnackData({
    //     //   show: true,
    //     //   message:
    //     //     response?.message || API_SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY,
    //     //   type: "success",
    //     // });

    //     const sectors = response?.data?.details || []; // Use an empty array as fallback
    //     setSectorData(sectors);
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

    AdminConfigAPIService.industryListing()
      .then((response) => {
        // Check the response structure and map data accordingly
        if (response?.data?.details) {
          setFilteredIndustries(response?.data?.details); //remove this line when sector selection is required
          setIndustryData(response?.data?.details);
          setFilteredData(newData);
        }
        setLoading(false);
      })
      .catch((errResponse) => {
        setLoading(false);
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      industry_name: formData.industry_name,
      industry_id: formData.industry_id,
      standard_name: formData.standard_name,
      standard_url: formData.file_url,
    };

    console.log("formData", payload);

    AdminConfigAPIService.standardCreate(payload)
      .then((response) => {
        // On success, you can add any additional logic here
        setSnackData({
          show: true,
          message: response?.data?.message,
          type: "success",
        });
        setFormData({
          ...formData,
          industry_name: "",
          industry_description: "d",
          standard_name: "",
          file_name: "",
          file_url: "",
        });

        let fileName = response?.data?.details?.[0]?.standard_url;

        if (fileName !== undefined) {
          const regex = /\/([^/]+)$/; // Match the part after the last "/"
          const match = fileName?.match(regex);

          const payload = new FormData();
          payload.append("imageKey", match?.[1]);
          payload.append("standard_id",response?.data?.details?.[0]?.standard_id);
          payload.append("standard_name",response?.data?.details?.[0]?.standard_name);

          AdminConfigAPIService.standardChecklistUpdate(payload)
            .then((response) => {
              console.log("response", response);
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
        }

        onHandleClose(response?.data?.message);
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
    const sectorId =
      sectorData.find((sector) => sector.sector_name === sectorName)
        ?.sector_id || "";
    setFormData({
      ...formData,
      sector_name: sectorName,
      // You could also update sector_id if you have the mapping between sector_name and sector_id
      sector_id: sectorId || "",
    });
    setSelectedIndustry("");

    const filteredIndustries = industryData.filter(
      (industry) => industry.sector_id === sectorId
    );
    setFilteredIndustries(filteredIndustries);
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

  const handleFileChange = (file) => {
    if (file) {
      setFormData({
        ...formData,
        file_url: file[0]?.path,
        file_name: file[0]?.name,
      });
    }
    // console.log("file",file);
  };

  return (
    <>
      <Box
        sx={{
          margin: "auto",
          padding: 3,
        }}
      >
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* First row - 3 items */}
            <Grid item xs={12} sm={6}>
              <TextField
                label={FORM_LABEL.STANDARD_NAME}
                variant="outlined"
                fullWidth
                name="standard_name"
                value={formData.standard_name}
                onChange={handleInputChange}
                required
                inputProps={{
                  maxLength: 30, // Restrict input to 40 characters
                }}
              />
            </Grid>

            {/* <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>
                  {FORM_LABEL.SECTOR}
                  <span>*</span>
                </InputLabel>
                <Select
                  value={formData.sector_name}
                  onChange={handleSectorChange}
                  name="sector_name"
                  // disabled={sectorData.length === 0}
                >
                  {sectorData.map((sector) => (
                    <MenuItem key={sector.sector_id} value={sector.sector_name}>
                      {sector.sector_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid> */}
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
            <Grid item xs={12} sm={12}>
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
                  background: "#2ba9bc",
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
        style={{ top: "80px" }}
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

export default StandardCreation;
