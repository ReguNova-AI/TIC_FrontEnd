import React from "react";
import { Typography, Box } from "@mui/material";
import PropTypes from "prop-types";
import { PROJECT_DETAIL_PAGE } from "shared/constants";

const RiskAssessmentTab = ({ projectData }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Risk Summary Section */}
      <Box
        sx={{
        
          padding: "20px",
          borderRadius: "10px",
          border: "1px solid #e4e4e4",
        }}
      >
        <Typography
          style={{ fontSize: "18px", marginBottom: "10px" }}
        >
          {PROJECT_DETAIL_PAGE.RISK_SUMMARY}
        </Typography>
        {projectData?.risk_summary?.risks_summary ? (
          <Typography>
            {projectData?.risk_summary?.risks_summary}
          </Typography>
        ) : (
          <Typography>No Risk Summary available.</Typography>
        )}
      </Box>

      {/* Extracted Information Section */}
      <Box
        sx={{
         
          padding: "20px",
          borderRadius: "10px",
          border: "1px solid #e4e4e4",
        }}
      >
        <Typography
          style={{ fontSize: "18px", marginBottom: "10px" }}
        >
          {PROJECT_DETAIL_PAGE.EXTRACTED_INFO}
        </Typography>
        {projectData?.extracted_information ? (
          <Typography>
            {projectData?.extracted_information}
          </Typography>
        ) : (
          <Typography>
            No Extracted Information available.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

RiskAssessmentTab.propTypes = {
  projectData: PropTypes.object.isRequired,
};

export default RiskAssessmentTab;