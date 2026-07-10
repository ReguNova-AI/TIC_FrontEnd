import React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { brand } from "themes/theme/brand";
import { useProjectCreation } from "./ProjectCreationContext";

const MAX_NAME_LENGTH = 50;
const MAX_DESC_LENGTH = 250;

const ProjectDetailsStep = () => {
  const { projectName, setProjectName, projectDesc, setProjectDesc, setSnackData } =
    useProjectCreation();

  return (
    <Box>
      {/* Project Name */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="subtitle2"
          sx={{ mb: 1, fontWeight: 600, color: brand.primary }}
        >
          Project Name <span style={{ color: "#ff4d4f" }}>*</span>
        </Typography>
        <TextField
          placeholder="Enter Project Name"
          variant="outlined"
          fullWidth
          value={projectName}
          onChange={(e) => {
            if (e.target.value.length <= MAX_NAME_LENGTH) {
              setProjectName(e.target.value);
            } else {
              setSnackData({
                show: true,
                message: `Project Name cannot exceed ${MAX_NAME_LENGTH} characters.`,
                type: "warning",
              });
            }
          }}
          helperText={`${projectName.length}/${MAX_NAME_LENGTH}`}
          FormHelperTextProps={{
            sx: {
              textAlign: "right",
              width: "100%",
              color:
                projectName.length > MAX_NAME_LENGTH - 10
                  ? "#ff4d4f"
                  : "text.secondary",
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "3px",
              "&:hover fieldset": { borderColor: brand.primary },
              "&.Mui-focused fieldset": { borderColor: brand.primary },
            },
          }}
        />
      </Box>

      {/* Project Details (Description) */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="subtitle2"
          sx={{ mb: 1, fontWeight: 600, color: brand.primary }}
        >
          Project Details <span style={{ color: "#ff4d4f" }}>*</span>
        </Typography>
        <TextField
          placeholder="Enter Project Details"
          variant="outlined"
          fullWidth
          multiline
          rows={6}
          value={projectDesc}
          onChange={(e) => {
            if (e.target.value.length <= MAX_DESC_LENGTH) {
              setProjectDesc(e.target.value);
            } else {
              setSnackData({
                show: true,
                message: `Project Details cannot exceed ${MAX_DESC_LENGTH} characters.`,
                type: "warning",
              });
            }
          }}
          helperText={`${projectDesc.length}/${MAX_DESC_LENGTH}`}
          FormHelperTextProps={{
            sx: {
              textAlign: "right",
              width: "100%",
              color:
                projectDesc.length > MAX_DESC_LENGTH - 20
                  ? "#ff4d4f"
                  : "text.secondary",
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "3px",
              "&:hover fieldset": { borderColor: brand.primary },
              "&.Mui-focused fieldset": { borderColor: brand.primary },
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default ProjectDetailsStep;
