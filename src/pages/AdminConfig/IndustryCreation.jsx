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

const IndustryCreation = ({onHandleClose}) => {
  const navigate = useNavigate();
  const [sectorData, setSectorData] = useState([]);
  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });

  const [formData, setFormData] = useState({
    industry_name: "",
    industry_description: "d",
    sector_id: 1,
    sector_name: "Nil",
  });

  useEffect(() => {
    // fetchSectorDetails();
  }, []);

  const fetchSectorDetails = () => {
    AdminConfigAPIService.sectorListing()
      .then((response) => {
        // setSnackData({
        //   show: true,
        //   message:
        //     response?.message || API_SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY,
        //   type: "success",
        // });

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
      industry_description: "test description",
      sector_id: formData.sector_id,
      sector_name: formData.sector_name,
    };

    AdminConfigAPIService.industryCreate(payload)
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
          sector_name: "",
          sector_id: null,
        });

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
    setFormData({
      ...formData,
      sector_name: sectorName,
      // You could also update sector_id if you have the mapping between sector_name and sector_id
      sector_id:
        sectorData.find((sector) => sector.sector_name === sectorName)
          ?.sector_id || "",
    });
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
            <Grid item xs={12} sm={12}>
              <TextField
                label={FORM_LABEL.INDUSTRY_NAME}
                variant="outlined"
                fullWidth
                name="industry_name"
                value={formData.industry_name}
                onChange={handleInputChange}
                required
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

export default IndustryCreation;
