import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import PropTypes from "prop-types";
import ProjectDetailsCardView from "./ProjectDetailCardView2";
import FileStructureView from "./FileStructureView";
import ProgressBarView from "./ProgressBarView";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import processIcon from "../../assets/images/process.png";
import { PROJECT_DETAIL_PAGE } from "shared/constants";

const OverviewTab = ({
  projectData,
  handleModalOpen,
  handleRunAIAssessment,
  aiButtonLoading,
  onFileUploadSuccess,
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
      {/* Main Content Row - Two Cards Side by Side */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {/* Left: Project Details */}
        <Box sx={{ flex: '1 1 30%', }}>
          <ProjectDetailsCardView
            data={projectData}
            handleClick={(e) => handleModalOpen(e)}
          />
        </Box>

        {/* Right: File Structure */}
        <Box sx={{ flex: '1 1 60%' }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              boxShadow: "0px 0px 41px #e4e4e4",
              padding: "20px",
              borderRadius: "10px",
              border: "1px solid #e4e4e4",
              height: "100%",
            }}
          >
            <Box sx={{ marginBottom: 2, fontSize: 16, fontWeight: 600 }}>
              {PROJECT_DETAIL_PAGE.UPLOADED_PROJECT_DOCUMENTS}
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <FileStructureView
                data={projectData}
                onFileUploadSuccess={onFileUploadSuccess}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Action Buttons Row */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 2
        }}
      >
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={
            <AutoAwesomeIcon
              style={{ color: "white", fontSize: 24 }}
            />
          }
          onClick={handleRunAIAssessment}
          sx={{
            minWidth: 200,
            fontSize: 14,
            fontWeight: 600,
            borderRadius: 2,
            padding: "12px 24px"
          }}
          disabled={aiButtonLoading}
        >
          {aiButtonLoading ? 'Processing...' : 'Run AI Assessment'}
        </Button>

      </Box>

      {/* Processing Status Row */}
      {projectData?.status === "Processing" && (
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <img src={processIcon} width="150px" alt="Processing" />
          <ProgressBarView />
        </Box>
      )}
    </Box>
  );
};

OverviewTab.propTypes = {
  projectData: PropTypes.object.isRequired,
  handleModalOpen: PropTypes.func.isRequired,
  handleRunAIAssessment: PropTypes.func.isRequired,
  aiButtonLoading: PropTypes.bool.isRequired,
  onFileUploadSuccess: PropTypes.func,
};

export default OverviewTab;