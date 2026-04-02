import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

const MAX_DESC = 256;

const EditProject = ({ data, onHandleClose, editDetails, type }) => {
  const [formData, setFormData] = useState({
    projectName: data?.project_name || "",
    projectDesc: data?.project_description || "",
  });

  const handleInputChange = (field, value) => {
    if (field === "projectDesc" && value.length > MAX_DESC) return;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.projectName.trim()) return;
    editDetails({
      ...data,
      project_name: formData.projectName,
      project_description: formData.projectDesc,
    });
    onHandleClose(true);
  };

  // Invite members mode — keep existing flow
  if (type !== "Edit") {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Invite members functionality is handled externally.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 1 }}>
          <Button onClick={() => onHandleClose(true)} sx={{ textTransform: "none", color: "#666" }}>
            Cancel
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Modal Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2,
          borderBottom: "1px solid #e8e8e8",
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: "17px", color: "#222" }}>
          Project Details
        </Typography>
        <IconButton size="small" onClick={() => onHandleClose(true)} sx={{ color: "#888" }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Form Body */}
      <Box sx={{ px: 3, py: 3, display: "flex", flexDirection: "column", gap: 3 }}>

        {/* Project Name Field */}
        <Box>
          <Typography
            component="label"
            htmlFor="edit-project-name"
            sx={{ display: "block", fontWeight: 600, fontSize: "13px", color: "#444", mb: 0.75 }}
          >
            Project Name <Box component="span" sx={{ color: "#d32f2f" }}>*</Box>
          </Typography>
          <TextField
            id="edit-project-name"
            fullWidth
            size="small"
            placeholder="Enter project name"
            value={formData.projectName}
            onChange={(e) => handleInputChange("projectName", e.target.value)}
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "4px",
                fontSize: "14px",
                "&.Mui-focused fieldset": { borderColor: "#5B0429" },
              },
            }}
          />
        </Box>

        {/* Project Details Field */}
        <Box>
          <Typography
            component="label"
            htmlFor="edit-project-desc"
            sx={{ display: "block", fontWeight: 600, fontSize: "13px", color: "#444", mb: 0.75 }}
          >
            Project Details <Box component="span" sx={{ color: "#d32f2f" }}>*</Box>
          </Typography>
          <Box sx={{ position: "relative" }}>
            <TextField
              id="edit-project-desc"
              fullWidth
              multiline
              rows={5}
              size="small"
              placeholder="Enter project details..."
              value={formData.projectDesc}
              onChange={(e) => handleInputChange("projectDesc", e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "4px",
                  fontSize: "14px",
                  alignItems: "flex-start",
                  "&.Mui-focused fieldset": { borderColor: "#5B0429" },
                },
              }}
            />
            {/* Character counter */}
            <Typography
              variant="caption"
              sx={{
                position: "absolute",
                bottom: 8,
                right: 12,
                fontSize: "11px",
                color: formData.projectDesc.length > MAX_DESC * 0.9 ? "#d32f2f" : "#aaa",
                pointerEvents: "none",
              }}
            >
              {formData.projectDesc.length}/{MAX_DESC}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Divider />
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 1.5,
          px: 3,
          py: 2,
        }}
      >
        <Button
          onClick={() => onHandleClose(true)}
          sx={{
            textTransform: "none",
            color: "#666",
            fontWeight: 500,
            fontSize: "14px",
            borderRadius: "20px",
            px: 2,
            "&:hover": { bgcolor: "#f5f5f5" },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!formData.projectName.trim()}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            fontSize: "14px",
            borderRadius: "20px",
            px: 3,
            bgcolor: "#5B0429",
            boxShadow: "none",
            "&:hover": { bgcolor: "#4a0322", boxShadow: "none" },
            "&.Mui-disabled": { bgcolor: "#e0e0e0", color: "#aaa" },
          }}
        >
          Save
        </Button>
      </Box>
    </Box>
  );
};

export default EditProject;
