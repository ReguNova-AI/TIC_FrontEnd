import React, { useEffect, useState } from "react";
import { TextField, Button, Grid, Box, Typography, Checkbox, FormControlLabel } from "@mui/material";
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
import { Spin } from "antd";

const RoleCreation = ({ onHandleClose,type,selecteddata }) => {
  const navigate = useNavigate();
  const [permissionData, setPermissionData] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading,setLoading]=useState(false);
  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });
  const [formData, setFormData] = useState({
    role_name:"",
    role_desc: "",
    permissions: [5],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    AdminConfigAPIService.permissionListing()
      .then((response) => {
        if (response?.data?.details) {
          // setPermissionData(response?.data?.details);
          setPermissionData(groupPermissionsByCategory(response?.data?.details));
        }
        setSnackData({
          show: true,
          message:
            response?.message || API_SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY,
          type: "success",
        });
        setLoading(false);
      })
      .catch((errResponse) => {
        setSnackData({
          show: true,
          message:
            errResponse?.error?.message ||
            API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
          type: "error",
        });
        setLoading(falses);
      });
  };

  const groupPermissionsByCategory = (permissions) => {
    return permissions.reduce((categories, permission) => {
      const { category, permission_name, permission_id } = permission;
      if (!categories[category]) {
        categories[category] = {};
      }
      if (!categories[category][permission_name]) {
        categories[category][permission_name] = [];
      }
      categories[category][permission_name].push(permission_id);
      return categories;
    }, {});
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCheckboxChange = (permissionId, actionType) => {
    setSelectedPermissions((prevSelected) => {
      const updatedPermissions = [...prevSelected];
      const index = updatedPermissions.findIndex((id) => id === permissionId);

      if (actionType === "add" && index === -1) {
        updatedPermissions.push(permissionId);
      } else if (actionType === "remove" && index !== -1) {
        updatedPermissions.splice(index, 1);
      }

      return updatedPermissions;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if(type !== "edit"){

    const payload = {
      role_name: formData.role_name,
      role_desc: formData.role_desc,
      permissions: selectedPermissions, // Send selected permissions as an array of IDs
    };

    AdminConfigAPIService.roleCreate(payload)
      .then((response) => {
        setSnackData({
          show: true,
          message: response?.data?.message,
          type: "success",
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
    }
    else{
    const payload = {
      role_name: formData.role_name,
      role_desc: formData.role_desc,
      permissions: selectedPermissions, // Send selected permissions as an array of IDs
    };

    const id= selecteddata?.role_id;
    AdminConfigAPIService.roleUpdate(payload,id)
      .then((response) => {
        setSnackData({
          show: true,
          message: response?.data?.message,
          type: "success",
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
    }
  };


    useEffect(() => {
      setFormData({
        ...formData,
        role_name:selecteddata?.role_name,
    role_desc: selecteddata?.role_desc,
    permissions: selecteddata?.permissions,
      });
    }, [selecteddata]);

  return (
    <>
    <Spin tip="Loading" size="large" spinning={loading}>
      <Box sx={{ margin: "auto", padding: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label={FORM_LABEL.ROLE_NAME}
                variant="outlined"
                fullWidth
                name="role_name"
                value={formData.role_name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={FORM_LABEL.ROLE_DESC}
                variant="outlined"
                fullWidth
                name="role_desc"
                value={formData.role_desc}
                onChange={handleInputChange}
                required
              />
            </Grid>

            {/* Render permissions dynamically */}
            {Object.keys(permissionData).map((category) => (
              <Grid item xs={12} sm={12} key={category} style={{borderBottom:"1px solid #f2f2f2"}}>
                
                <Grid container spacing={2}>
                  <Grid item xs={3} style={{alignContent:"center"}}>
                <Typography variant="h6">{category}</Typography>
                </Grid>
                  {["Add", "Delete", "Edit", "Read"].map((action) => (
                    <Grid item xs={2} key={action}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            onChange={(e) =>
                              handleCheckboxChange(
                                permissionData[category][action]?.[0],
                                e.target.checked ? "add" : "remove"
                              )
                            }
                            checked={selectedPermissions.includes(
                              permissionData[category][action]?.[0]
                            )}
                          />
                        }
                        label={action}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            ))}

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
      </Spin>
    </>
  );
};

export default RoleCreation;
