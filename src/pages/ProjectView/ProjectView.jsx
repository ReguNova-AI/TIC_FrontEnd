import React, { useEffect, useState, useMemo } from "react";
import {
  Typography,
  Box,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Chip,
} from "@mui/material";
import PropTypes from "prop-types";
import OverviewTab from "./OverviewTab";
import SummaryReportTab from "./SummaryReportTab";
import ChatAITab from "./ChatAITab";
import RiskAssessmentTab from "./RiskAssessmentTab";
import EditProject from "./EditProject";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { Spin, Modal, Result } from "antd";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import {
  TAB_LABEL,
  HEADING,
} from "shared/constants";
import DropZoneFileUpload from "pages/ProjectCreation/DropZoneFileUpload";
import reportIcon from "../../assets/images/icons/report1.png";

// React Query hooks
import {
  useProjectDetails,
  useStandardData,
} from "./useProjectQueries";

// Custom hooks
import { useProjectOperations, createHistoryObject } from "./useProjectOperations";
import { useModalManager, useSnackbarManager } from "./useUIManager";
import { useAIAssessmentOperations } from "../../components/hooks/useAIAssessmentOperations";
import AIAssessmentStatusIndicator, { markAssessmentStart } from "../../components/AIAssessmentStatusIndicator";
import { getStatusChipProps } from "shared/utility";
import { brand } from "themes/theme/brand";

// Helper function to create a history object based on changes
export { createHistoryObject };

  function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        // hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
        style={{ height: '100%', overflow: 'hidden', display: value === index ? 'flex' : 'none', flexDirection: 'column' }}
      >
          <Box
            sx={{
              p: 2,
              height: '100%',
              overflowY: 'auto',
              overflowX: 'hidden',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#c1c1c1',
                borderRadius: '3px',
                '&:hover': {
                  background: '#a8a8a8',
                },
              },
            }}
          >
            {children}
          </Box>
      </div>
    );
  }

  CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  };

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

const ProjectView = () => {
  const [value, setValue] = React.useState(0);
  const location = useLocation();
  const { runAssessmentState } = location.state || {};
  const { id } = useParams();
  const navigate = useNavigate();
  const [chatResponse, setChatResponse] = useState([]);
  const [chatLoading, setChatloading] = useState(false);
  const [runState, setRunState] = useState(true);
  const [standardChatState, setStandardChatState] = useState(true);
  // Add at top of ProjectView state declarations:
  const [isChatQuestionActive, setIsChatQuestionActive] = useState(false);

  // React Query hooks
  const {
    data: projectQueryData,
    isLoading: projectLoading,
    error: projectError,
    refetch: refetchProjectData,
  } = useProjectDetails(id);

  const {
    data: standardData = [],
    isLoading: standardLoading,
    error: standardError,
  } = useStandardData();

  // Extracted data from React Query
  const projectData = useMemo(() => projectQueryData?.project || {}, [projectQueryData?.project]);
  const historyData = projectQueryData?.history || [];

  // Custom hooks
  const {
    isProgressModalVisible,
    handleProgressModalClose,
    updateProjectDetails,
    runComplianceAssessment,
    runChecklistCRT,
    runChecklistAPI,
  } = useProjectOperations(projectData, getUserName());

  // AI Assessment operations with global state
  const {
    currentProjectStatus,
    handleRunAIAssessment,
    isProcessing,
  } = useAIAssessmentOperations(projectData);

  // ✅ AI Assessment Status
  const aiStatus = projectData?.AIAssesmentStatus;
  // const isAIAssessmentLoading = aiStatus?.toLowerCase() === 'processing';
  const isAIAssessmentLoading =
    isProcessing || aiStatus?.toLowerCase() === 'processing';
  
  useEffect(() => {
    if (isAIAssessmentLoading) {
      const interval = setInterval(() => {
        refetchProjectData(); // fetch latest project data from backend
      }, 5000); // every 5 seconds

      return () => clearInterval(interval); // cleanup when status changes or component unmounts
    }
  }, [isAIAssessmentLoading, refetchProjectData]);

  const {
    openModal,
    modalType,
    isModalVisible,
    uploadedDocument,
    handleModalOpen,
    handleModalClose,
    handleFileModalClose,
    handleFileChange,
    setUploadedDocument,
  } = useModalManager();

  const {
    snackData,
    setSnackData,
    hideSnackbar,
  } = useSnackbarManager();

  const statusChip = (status) => {
    const { title, color, borderColor } = getStatusChipProps(status);
    return (
      <Chip
        key={status}
        label={title}
        color={borderColor}
        variant="outlined"
        sx={{
          bgcolor: color,
          borderRadius: "20px",
          fontSize: "11px",
          fontWeight: 600,
          margin: "1px", // Optional to add some spacing between chips
        }}
      />
    );
  };

  // Combined loading state
  const loading = projectLoading || standardLoading;

  function getUserName() {
    const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));
    return userdetails?.[0].user_first_name + " " + userdetails?.[0].user_last_name;
  }

  useEffect(() => {
    if (runAssessmentState === "run" && runState && projectData?.project_id) {
      projectData?.checkListResponse
        ? runComplianceAssessment(
          projectData?.checkListResponse,
          projectData?.project_id,
          "partial",
          standardData
        )
        : runChecklistCRT(standardData);
      setRunState(false);
    }
  }, [projectData, standardData, runAssessmentState, runState, runComplianceAssessment, runChecklistCRT]);

  useEffect(() => {
    if (
      projectData?.standardUploaded === false ||
      projectData?.standardUploaded === 0 ||
      projectData?.standardUploaded === "false" ||
      projectData.standardUploaded === null ||
      projectData.standardUploaded === "null" ||
      projectData?.standardUploaded === undefined
    ) {
      if (standardChatState && standardData.length > 0) {
        runChecklistAPI(standardData);
        setStandardChatState(false);
      }
    }
  }, [standardData, projectData?.standardUploaded, standardChatState, runChecklistAPI]);

  // Set chat loading based on project documents
  useEffect(() => {
    setChatloading(
      projectData?.project_documents?.length > 0 ? false : true
    );
  }, [projectData?.project_documents]);

  // Handle chat response updates
  useEffect(() => {
    if (projectData?.chatResponse?.data) {
      const data = projectData.chatResponse.data;
      setChatResponse(data[data.length - 1]?.answer);
    }
  }, [projectData?.chatResponse]);

  // Reset tab to Overview if completion becomes 0 and user is on other tabs
  useEffect(() => {
    if ((projectData?.completion_percentage || 0) <= 0 && value > 0) {
      setValue(0);
    }
  }, [projectData?.completion_percentage, value]);

  const handleFileUpload = () => {
    if (uploadedDocument?.length > 0) {
      const updatedResponse = { ...projectData };
      updatedResponse.documents = [
        ...updatedResponse.documents,
        ...uploadedDocument,
      ];

      const previousData = { ...projectData };
      const newHistory = createHistoryObject(
        uploadedDocument,
        previousData,
        "documentUpload",
        getUserName()
      );

      const updatedHistory = [...historyData, newHistory];
      const updatedResponseWithHistory = {
        ...updatedResponse,
        history: updatedHistory,
      };

      updateProjectDetails(updatedResponseWithHistory, "documentUpload");
      handleFileModalClose();
      setUploadedDocument([]);
    }
  };

  const handleChange = (event, newValue) => {
    // Prevent navigation to disabled tabs when completion is 0 or less
    if ((isAIAssessmentLoading || (projectData?.completion_percentage || 0) <= 0 || projectData?.AIAssesmentStatus == null) && newValue > 0) {
      return;
    }
    setValue(newValue);
  };

  // Show error if project fails to load
  if (projectError || standardError) {
    return (
      <Result
        status="error"
        title="Failed to load project data"
        subTitle="Please try refreshing the page"
      />
    );
  }

  return (
    <>
      <div role="presentation" style={{ margin: "0px 0px 20px 0px" }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            underline="hover"
            color="inherit"
            onClick={() => {
              navigate("/dashboard/default");
            }}
            style={{ cursor: "pointer" }}
          >
            Dashboard
          </Link>

          <Link
            underline="hover"
            color="inherit"
            onClick={() => window.history.back()}
            style={{ cursor: "pointer" }}
          >
            My Projects
          </Link>

          <Link
            color="inherit"
            aria-current="page"
          >
            <span style={{ color:brand.primary, fontWeight: 600 }}>
              {projectData?.project_name}
            </span>
          </Link>
        </Breadcrumbs>
      </div>

      <Spin tip="Loading" size="large" spinning={loading}>
        <Box
          sx={{
            background: "#fff",
            borderRadius: "10px",
            border: "1px solid #e4e4e4",
            height: 'calc(100vh - 160px)', // Fixed height with proper spacing
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden', // Prevent outer container from scrolling
          }}
        >
          {/* Tab Headers */}
          <Box sx={{ borderBottom: 1, borderColor: "divider", flexShrink: 0, }}>
            {/* Linear Progress Bar - Attached to Tabs */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>

              <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, paddingTop: "8px", paddingLeft: '16px', paddingRight: '16px' }}>
                  <Typography variant="h5" color="text.primary">
                    {projectData?.project_name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', }}>
                    {/* <Typography variant="body2" color="text.secondary">
                      Progress :
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" style={{ marginLeft: '8px', marginRight: '8px' }}>
                      {Math.round(projectData?.completion_percentage || 0)}%
                    </Typography> */}
                    {((projectData?.completion_percentage || 0) === 0) && <Typography variant="body2" color="text.secondary" >
                      ( Upload project files to enable AI features)
                    </Typography>}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* <Box sx={{ marginRight: 3 }}>
                      {!isAIAssessmentLoading&&statusChip(projectData?.AIAssesmentStatus)}
                    </Box> */}
                    <Box>
                      <AIAssessmentStatusIndicator 
                        projectId={projectData?.project_id} 
                        isLoading={isAIAssessmentLoading}
                        backendStatus={projectData?.AIAssesmentStatus}
                        variant="progress" 
                        size="small" 
                       />
                    </Box>
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={parseFloat(projectData?.completion_percentage) || 0}
                  sx={{
                    height: 6,
                    padding: 0,
                    margin: 0,
                    borderRadius: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 0,
                    },
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 16px' }}>
                <Tabs
                  value={value}
                  onChange={handleChange}
                  aria-label="basic tabs example"
                >
                  <Tab label={TAB_LABEL.OVERVIEW} {...a11yProps(0)} />
                  <Tab
                    label={TAB_LABEL.SUMMARY_REPORT}
                    {...a11yProps(1)}
                    disabled={isAIAssessmentLoading || (projectData?.completion_percentage || 0) <= 0 || projectData?.AIAssesmentStatus == null}
                  />
                  <Tab
                    label={TAB_LABEL.CHAT_AI}
                    {...a11yProps(2)}
                    disabled={isAIAssessmentLoading || (projectData?.completion_percentage || 0) <= 0 || projectData?.AIAssesmentStatus == null}
                  />
                  <Tab
                    label={TAB_LABEL.RISK_ASSESSMENT}
                    {...a11yProps(3)}
                    disabled={isAIAssessmentLoading || (projectData?.completion_percentage || 0) <= 0 || projectData?.AIAssesmentStatus == null}
                  />
                </Tabs>
              </Box>
            </Box>


            {/* Linear Progress Bar - Attached to Tabs */}

          </Box>

          {/* Tab Content Container */}
          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            {/* Overview Tab */}
            <CustomTabPanel value={value} index={0}>
              <OverviewTab
                projectData={projectData}
                handleModalOpen={handleModalOpen}
                handleRunAIAssessment={()=>{
                  markAssessmentStart(projectData?.project_id);
                  handleRunAIAssessment()}
                }
                aiButtonLoading={isAIAssessmentLoading}
                onFileUploadSuccess={refetchProjectData}
              />
            </CustomTabPanel>

            {/* Summary Report Tab */}
            <CustomTabPanel value={value} index={1}>
              <SummaryReportTab
                projectData={projectData}
              />
            </CustomTabPanel>

            {/* Chat AI Tab */}
            <CustomTabPanel value={value} index={2}>
              <ChatAITab
                chatLoading={chatLoading}
                projectData={projectData}
                isQuestionActive={isChatQuestionActive}
                setIsQuestionActive={setIsChatQuestionActive}

              />
            </CustomTabPanel>

            {/* Risk Assessment Tab */}
            <CustomTabPanel value={value} index={3}>
              <RiskAssessmentTab projectData={projectData} />
            </CustomTabPanel>
          </Box>
        </Box>

        {/* File Upload Modal */}
        <Dialog
          open={openModal}
          onClose={handleFileModalClose}
          style={{ zIndex: "999" }}
        >
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogContent>
            <DropZoneFileUpload
              label="You can only upload project documents"
              typeSelect={false}
              handleSubmitDocument={handleFileChange}
              maxFile={0}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleFileModalClose} color="primary">
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={uploadedDocument?.length > 0 ? false : true}
              onClick={handleFileUpload}
              color="primary"
            >
              Upload
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Project Modal */}
        <Modal
          title={
            modalType === "Edit" ? HEADING.EDIT_PROJECT : HEADING.INVITE_USERS
          }
          visible={isModalVisible}
          onCancel={handleModalClose}
          footer={null}
          width={800}
        >
          <EditProject
            data={projectData}
            onHandleClose={handleModalClose}
            editDetails={updateProjectDetails}
            type={modalType}
          />
        </Modal>

        {/* Progress Modal */}
        <Modal
          title=""
          visible={isProgressModalVisible}
          onCancel={handleProgressModalClose}
          footer={null}
          width={500}
        >
          <Box style={{ justifyItems: "center" }}>
            <img src={reportIcon} width={"100px"} alt="Report" />
            <Typography style={{ margin: "27px 5px" }}>
              We got your request and will notify you once it is ready.
            </Typography>
            <Button
              variant="contained"
              onClick={handleProgressModalClose}
            >
              Close
            </Button>
          </Box>
        </Modal>

        {/* Snackbar */}
        <Snackbar
          style={{ top: "80px" }}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          open={snackData.show}
          autoHideDuration={3000}
          onClose={hideSnackbar}
        >
          <Alert
            onClose={hideSnackbar}
            severity={snackData.type}
          >
            {snackData.message}
          </Alert>
        </Snackbar>
      </Spin>
    </>
  );
};

export default ProjectView;
