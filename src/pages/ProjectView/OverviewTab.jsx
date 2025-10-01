import React from "react";
import {
  Box,
  Button,
} from "@mui/material";
import PropTypes from "prop-types";
import ProjectDetailsCardView from "./ProjectDetailCardView2";
import FileStructureView from "./FileStructureView";
import ProgressBarView from "./ProgressBarView";
import ProgressRing from "pages/ProjectCreation/CircularDocumentProgress";
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
      {/* Main Content Row */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {/* Left: Project Details */}
        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <ProjectDetailsCardView
            data={projectData}
            handleClick={(e) => handleModalOpen(e)}
          />
        </Box>

        {/* Middle: File Structure */}
        <Box sx={{ flex: '2 1 400px', minWidth: '400px' }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",

              boxShadow: "0px 0px 41px #e4e4e4",
              padding: "20px",
              borderRadius: "10px",
              border: "1px solid #e4e4e4",
              width: "100%",
              height: "100%",
            }}
          >
            <Box>
              {PROJECT_DETAIL_PAGE.UPLOADED_PROJECT_DOCUMENTS}
              <FileStructureView
                data={projectData}
                onFileUploadSuccess={onFileUploadSuccess}
              />
            </Box>
          </Box>
        </Box>

        {/* Right: Progress Ring */}
        <Box sx={{ flex: '0 1 200px', minWidth: '200px' }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "auto",
              boxShadow: "0px 0px 41px #e4e4e4",
              padding: "20px",
              borderRadius: "10px",
              border: "1px solid #e4e4e4",
              gap: 2,
            }}
          >
            <ProgressRing
              label="Completion Progress"
              totalFiles={100}
              currentFiles={projectData?.completion_percentage}
            />
            <Button
              variant="contained"
              color="primary"
              size="medium"
              startIcon={
                <AutoAwesomeIcon
                  style={{ color: "white", fontSize: 20 }}
                />
              }
              onClick={handleRunAIAssessment}
              sx={{
                width: "100%",
                fontSize: 12,
              }}
              disabled={aiButtonLoading}
            >
              {PROJECT_DETAIL_PAGE.RUN_AI_COMPLIANCE_ASSESSMENT}
            </Button>
          </Box>
        </Box>
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