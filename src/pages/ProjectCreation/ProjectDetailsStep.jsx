import React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { brand } from "themes/theme/brand";
import { useProjectCreation } from "./ProjectCreationContext";

const MAX_DESC_LENGTH = 256;

const ProjectDetailsStep = () => {
  const { projectName, setProjectName, projectDesc, setProjectDesc } =
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
          onChange={(e) => setProjectName(e.target.value)}
          inputProps={{ maxLength: 100 }}
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
            }
          }}
          inputProps={{ maxLength: MAX_DESC_LENGTH }}
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
