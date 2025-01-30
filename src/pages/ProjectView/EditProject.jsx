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
} from "@mui/material";

import { BUTTON_LABEL, FORM_LABEL } from "shared/constants";
import { UserApiService } from "services/api/UserAPIService";
import UserProfileCard from "../ProjectCreation/UserProfileCard";

const EditProject = ({ data, onHandleClose, editDetails, type }) => {
  const [changeFlag, setChangeFlag] = useState(false);
  const [userData, setUserData] = useState([]);
  const selectedIds = [];

  data?.invite_members?.map((user) => {
    selectedIds.push(user.user_id);
  });
  const [formData, setFormData] = useState({
    projectName: data.project_name || "",
    projectNo: data.project_no || "",
    projectDesc: data.project_description || "",
    teamMembers: selectedIds,
    invite_Users: data.invite_members,
  });
  useEffect(() => {
    if (type !== "Edit") {
      fetchUserData();
    }
  }, []);

  const fetchUserData = () => {
    UserApiService.userListing()
      .then((response) => {
        if (response && response?.data) {
          setUserData(response?.data?.details); // Assuming response.data contains the user list
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
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setChangeFlag(true);
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (e) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      teamMembers: value, // Update selected team members
    });
  };

  const handleMultiple = (selectedIds) => {
    const selectedMembers = selectedIds?.map((userId) => {
        const member = userData.find((user) => user?.user_id === userId);
        return member
          ? {
              user_id: member?.user_id,
              user_name: `${member?.user_first_name} ${member?.user_last_name}`,
              user_email: member?.user_email,
              user_profile: member?.user_profile,
            }
          : null;
      })
      .filter(Boolean);
    setFormData({
      ...formData,
      invite_Users: selectedMembers,
    });
    return selectedMembers;
  };

  const handleProfileDelete = (id) => {
    setFormData({
      ...formData,
      teamMembers: formData.teamMembers.filter((memberId) => memberId !== id),
    });
  };

  const handleSubmit = () => {
    const selectedUserData = handleMultiple(formData.teamMembers);
    if (changeFlag !== false) {
      editDetails(formData);
    }
    onHandleClose(true);
  };

  const handleClose = () => {
    onHandleClose(true);
  };

  return (
    <>
      <Box>
        <Grid container spacing={2} style={{marginTop:"20px"}}>
          {/* First row - 3 items */}

          {type === "Edit" ? (
            <>
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
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

              <Grid item xs={12} sm={6}>
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
            </>
          ) : (
            <>
              <Grid item xs={12} sm={8}>
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
                            (member) => member?.user_id === value
                          );
                          return (
                            <Chip
                              key={value}
                              label={member?.user_email}
                              sx={{ margin: 0.5 }}
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {userData?.map((member) => (
                      <MenuItem key={member.user_id} value={member.user_id}>
                        {member.user_first_name} {member.user_last_name} -{" "}
                        {member.user_email}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={12}>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  {formData?.invite_Users?.map((selectedId) => {
                    const member = userData.find(
                      (user) => user.user_id === selectedId.user_id
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
            </>
          )}
          <Grid item xs={12} sm={12}>
            <Button
              type="submit"
              variant="contained"
              onClick={handleSubmit}
              style={{
                background: "#003a8c",
                float: "right",
                textTransform: "none",
              }}
            >
              {BUTTON_LABEL.UPDATE}
            </Button>
            <Button
              type="submit"
              variant="outlined"
              onClick={handleClose}
              style={{
                float: "right",
                marginRight: "10px",
                textTransform: "none",
              }}
            >
              {BUTTON_LABEL.CLOSE}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default EditProject;
