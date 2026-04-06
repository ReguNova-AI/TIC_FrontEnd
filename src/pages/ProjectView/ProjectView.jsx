import React, { lazy, Suspense, useEffect, useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import PropTypes from "prop-types";
import OverviewTab from "./OverviewTab";
const SummaryReportTab = lazy(() => import("./SummaryReportTab"));
const ChatAITab = lazy(() => import("./ChatAITab"));
const EditProject = lazy(() => import("./EditProject"));
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { Spin, Modal, Result, message } from "antd";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import {
  TAB_LABEL,
  HEADING,
} from "shared/constants";
const DropZoneFileUpload = lazy(() => import("pages/ProjectCreation/DropZoneFileUpload"));
import reportIcon from "../../assets/images/icons/report1.png";
import cardGrapBg from "../../assets/Card_grap.svg";

// React Query hooks
import {
  useProjectDetails,
  useStandardData,
  PROJECT_QUERY_KEYS,
} from "./useProjectQueries";

// Custom hooks
import { useProjectOperations, createHistoryObject } from "./useProjectOperations";
import { useModalManager, useSnackbarManager } from "./useUIManager";
import { useAIAssessmentOperations } from "../../components/hooks/useAIAssessmentOperations";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AIAssessmentStatusIndicator, { 
  markAssessmentStart, 
  getElapsedSeconds, 
  ESTIMATED_DURATION 
} from "../../components/AIAssessmentStatusIndicator";
import { getStatusChipProps } from "shared/utility";
import { brand } from "themes/theme/brand";

// Helper function to create a history object based on changes
export { createHistoryObject };

// Minimal inline spinner used as Suspense fallback inside tab panels
const TabFallback = () => (
  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 6 }}>
    <CircularProgress size={28} />
  </Box>
);

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
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [chatResponse, setChatResponse] = useState([]);
  const [chatLoading, setChatloading] = useState(false);
  const [runState, setRunState] = useState(true);
  const [standardChatState, setStandardChatState] = useState(true);
  // Add at top of ProjectView state declarations:
  const [isChatQuestionActive, setIsChatQuestionActive] = useState(false);

  // Track which tabs have been visited — used to decide whether to render
  // the lazy tab at all. This prevents Suspense from mounting (and running
  // useEffects inside) tabs the user has never opened.
  const [visitedTabs, setVisitedTabs] = useState(new Set([0]));
  const [tick, setTick] = useState(0); // Real-time pulse for UI numbers
  const prevStatusRef = React.useRef(null); // Track status to prevent duplicate toasts

  // Helper to format timestamps (e.g., "Apr 06, 2026, 08:01 AM")
  const formatDateTime = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(date);
    } catch (e) {
      return dateStr;
    }
  };

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
  const hasDocuments = (projectData?.project_documents?.length > 0);

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
    isMutationSuccess,
  } = useAIAssessmentOperations(projectData);

  // ✅ AI Assessment Status
  const aiStatus = projectData?.AIAssesmentStatus;
  
  // Use localStorage timer to bridge the gap between clicking "Run" and the backend status updating
  const elapsed = getElapsedSeconds(id);
  // Keep true as long as there's a timer; we will cap the mathematical percentage at 99% instead of unmounting it.
  const isLocalProcessing = elapsed > 0;

  const isAIAssessmentLoading =
    aiStatus?.toLowerCase() === 'processing' ||
    isProcessing ||
    isLocalProcessing;
  
  // UI is unlocked completely ONLY when assessment is explicitly 'completed'/'success' by the backend
  // OR when we just received a success response from the API call.
  const isCompleted =
    aiStatus?.toLowerCase() === 'completed' ||
    aiStatus?.toLowerCase() === 'success' ||
    isMutationSuccess;

  const isFailed = aiStatus?.toLowerCase() === 'failed';

  // Helper to get true progress percentage (smooth 0–99% simulation while processing)
  const currentProgress = useMemo(() => {
    // 1. Handle explicit mutation success immediately
    if (isMutationSuccess) return 100;
    
    // 2. Extracted backend percentage (stale if high during new run)
    const backendPct = parseFloat(projectData?.completion_percentage) || 0;
    
    if (isAIAssessmentLoading) {
      // 3. Time-based simulation (moving towards 99%)
      const elapsed = getElapsedSeconds(id);
      const simulatedPct = (elapsed / ESTIMATED_DURATION) * 100;
      
      // 4. Floor: don't start from 100% (stale) or 0% (visual delay)
      // If backend reports 100 while still processing, ignore it.
      const currentStablePct = (backendPct >= 100 || backendPct <= 0) ? 5 : backendPct;
      
      // 5. Interpolate: bar moves according to whichever is ahead (backend or simulation)
      let displayPct = Math.max(currentStablePct, simulatedPct);
      
      // 6. Hard Cap: never exceed 99% until status officially changes from "Processing"
      return Math.min(99, displayPct);
    }
    
    return backendPct;
  }, [projectData?.completion_percentage, isAIAssessmentLoading, isLocalProcessing, tick, id, isMutationSuccess]);

  // Polling & Real-time Ticker
  useEffect(() => {
    if (isAIAssessmentLoading) {
      // 1. Backend polling every 5 seconds
      const pollInterval = setInterval(() => {
        refetchProjectData();
      }, 5000);

      // 2. Real-time UI ticker every 1 second (makes the number count up progressively)
      const tickInterval = setInterval(() => {
        setTick(t => t + 1);
      }, 1000);

      return () => {
        clearInterval(pollInterval);
        clearInterval(tickInterval);
      };
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
    // setSnackData,
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
    // 1. If currently assessing, block Report (1) and Chat AI (2) tabs strictly
    if (isAIAssessmentLoading && newValue > 0) {
      return;
    }
    // 2. If not currently assessing and no historical success, also block
    if (!(projectData?.success_count > 0 || isCompleted) && newValue > 0) {
      return;
    }
    // Mark this tab as visited so it renders for the first time
    setVisitedTabs((prev) => new Set([...prev, newValue]));
    setValue(newValue);
  };

  // Toast notifications for AI status transitions (only on change)
  useEffect(() => {
    const currentStatus = aiStatus?.toLowerCase();
    const prevStatus = prevStatusRef.current;

    if (currentStatus && currentStatus !== prevStatus) {
      // Only show toasts if this is a transition (ignore initial mount where prevStatus is null)
      if (prevStatus !== null) {
        if (currentStatus === "processing") {
          message.info("Assessment in progress. Analyzing documents...");
        } else if (currentStatus === "completed" || currentStatus === "success") {
          message.success("AI Assessment completed successfully!");
          
          // Invalidate and refetch all assessment-related data automatically
          queryClient.invalidateQueries({
            queryKey: PROJECT_QUERY_KEYS.projectDetails(id),
          });
          queryClient.invalidateQueries({
            queryKey: PROJECT_QUERY_KEYS.riskSummaryList(id),
          });
          queryClient.invalidateQueries({
            queryKey: PROJECT_QUERY_KEYS.extractedInfo(id),
          });
        } else if (currentStatus === "failed") {
          message.error("AI Assessment failed. Please check your documents.");
        }
      }
      prevStatusRef.current = currentStatus;
    }
  }, [aiStatus, id, queryClient]);

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
              navigate("/dashboard");
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
            <span style={{ color: brand.primary, fontWeight: 600 }}>
              {projectData?.project_name}
            </span>
          </Link>
        </Breadcrumbs>
      </div>

      <Spin tip="Loading" size="large" spinning={loading}>
        <Box
          sx={{
            background: "#fff",
            borderRadius: "4px",
            border: "1px solid #e4e4e4",
            padding: "20px 28px",
            mb: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Topographic background waves from asset */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              backgroundImage: `url(${cardGrapBg})`,
              backgroundSize: 'auto 100%',
              backgroundPosition: 'right center',
              backgroundRepeat: 'no-repeat',
              zIndex: 0,
              pointerEvents: 'none',
              // Add a slight mask if the asset doesn't fade on its own, but typically these assets do.
              // To match the screenshot perfectly, it naturally sits on the right.
            }}
          />
          <Box sx={{ flex: 1, zIndex: 1, mr: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#5B0429', mb: 1, fontSize: '26px' }}>
              {projectData?.project_name || "Project"}
            </Typography>
            
            {isAIAssessmentLoading ? (
              <Box sx={{ width: '100%', maxWidth: '600px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body1" sx={{ color: '#222', fontSize: '15px', fontWeight: 600 }}>
                    Analyzing documents...
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#5B0429', fontWeight: 700 }}>
                    {Math.round(currentProgress)}% Complete
                  </Typography>
                </Box>
                
                {/* Progress bar driven by currentProgress — stays at 99% until API resolves */}
                <Box sx={{ position: 'relative', height: 6, width: '100%', backgroundColor: '#f0f0f0', borderRadius: 3, overflow: 'hidden', mt: 1 }}>
                  <Box 
                    sx={{ 
                      position: 'absolute',
                      height: '100%',
                      background: 'linear-gradient(90deg, #5B0429 0%, #8b0a41 100%)',
                      borderRadius: 3,
                      width: `${currentProgress}%`,
                      transition: 'width 1s linear',
                    }} 
                  />
                </Box>
              </Box>
            ) : isCompleted ? (
              <Box sx={{ width: '100%', maxWidth: '600px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body1" sx={{ color: '#222', fontSize: '15px' }}>
                    <span style={{ color: '#0FA958', fontWeight: 700 }}>✓ Assessment Complete.</span> Explore your insights in <b>Project Report.</b>
                  </Typography>
                  {isMutationSuccess && (
                    <Typography variant="caption" sx={{ color: '#0FA958', fontWeight: 700 }}>
                      100% Complete
                    </Typography>
                  )}
                </Box>
                {isMutationSuccess && (
                  <LinearProgress 
                    variant="determinate" 
                    value={100} 
                    sx={{
                      height: 4,
                      borderRadius: 1,
                      backgroundColor: "rgba(15, 169, 88, 0.1)",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: "#0FA958",
                        borderRadius: 1,
                      },
                    }}
                  />
                )}
                {!isMutationSuccess && projectData?.updated_at && (
                  <Typography variant="caption" sx={{ color: '#aaa', display: 'block', mt: 0.5 }}>
                    Last assessed {formatDateTime(projectData.updated_at)}
                  </Typography>
                )}
              </Box>
            ) : isFailed ? (
              <Box sx={{ width: '100%', maxWidth: '600px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body1" sx={{ color: '#d32f2f', fontWeight: 600, fontSize: '15px' }}>
                    ⚠ Assessment Failed. Please check your documents or retry.
                  </Typography>
                </Box>
                {projectData?.updated_at && (
                  <Typography variant="caption" sx={{ color: '#999', display: 'block', mt: 0.5 }}>
                    Failed on {formatDateTime(projectData.updated_at)}
                  </Typography>
                )}
              </Box>
            ) : (
              <Box>
                <Typography variant="body1" sx={{ color: '#222', fontSize: '15px' }}>
                  Upload documents and run AI assessment to generate insights
                </Typography>
                <Typography variant="caption" sx={{ color: '#aaa', display: 'block', mt: 0.5 }}>
                  Status: {aiStatus || "Idle"}
                </Typography>
              </Box>
            )}
          </Box>

          <Box sx={{ zIndex: 1 }}>
            <Button
              variant="contained"
              onClick={() => {
                if(!isAIAssessmentLoading) {
                  markAssessmentStart(projectData?.project_id);
                  handleRunAIAssessment();
                }
              }}
              startIcon={isAIAssessmentLoading ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon sx={{ fontSize: '18px' }} />}
              sx={{
                background: isAIAssessmentLoading ? '#5B0429' : 'linear-gradient(90deg, #5B0429 0%, #00609C 100%)',
                '&:hover': { background: isAIAssessmentLoading ? '#40021c' : 'linear-gradient(90deg, #40021c 0%, #004c7c 100%)' },
                borderRadius: '30px',
                padding: '8px 20px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '14px',
                pointerEvents: isAIAssessmentLoading ? 'none' : 'auto',
                boxShadow: 'none',
                cursor: 'pointer'
              }}
            >
              {isAIAssessmentLoading 
                ? "Running assessment" 
                : (isFailed ? "Retry AI Assessment" : (projectData?.success_count > 0 || isCompleted ? "Re-Run AI Assessment" : "Run AI Assessment"))}
            </Button>
          </Box>
        </Box>

        {/* Tab Selection & Content Container */}
        <Box
          sx={{
            background: "#fff",
            borderRadius: "4px",
            border: "1px solid #e4e4e4",
            height: 'calc(100vh - 270px)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ borderBottom: 1, borderColor: "divider", paddingX: 2, pt: 1 }}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="project tabs"
              TabIndicatorProps={{ style: { backgroundColor: '#5B0429', height: '3px' } }}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: '16px',
                  fontWeight: 500,
                  color: '#666',
                  minWidth: 'auto',
                  mr: 3,
                  '&.Mui-selected': { color: '#5B0429', fontWeight: 600 }
                }
              }}
            >
              <Tab label="Project Desk" {...a11yProps(0)} />
              <Tab
                label="Project Report"
                {...a11yProps(1)}
                disabled={isAIAssessmentLoading || !(projectData?.success_count > 0 || isCompleted)}
                sx={{
                  '&.Mui-disabled': { color: '#ccc', opacity: 0.6 }
                }}
              />
              <Tab
                label="Chat AI"
                {...a11yProps(2)}
                disabled={isAIAssessmentLoading || !(projectData?.success_count > 0 || isCompleted)}
                sx={{
                  '&.Mui-disabled': { color: '#ccc', opacity: 0.6 }
                }}
              />
            </Tabs>
          </Box>

          {/* Tab Content Container - Replaced overflow hidden with auto to allow scrolling */}
          <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
            <CustomTabPanel value={value} index={0}>
              <OverviewTab
                projectData={projectData}
                handleModalOpen={handleModalOpen}
                handleRunAIAssessment={() => {
                  markAssessmentStart(projectData?.project_id);
                  handleRunAIAssessment();
                }}
                aiButtonLoading={isAIAssessmentLoading}
                isCompleted={isCompleted}
                onFileUploadSuccess={refetchProjectData}
                updateProjectDetails={updateProjectDetails}
              />
            </CustomTabPanel>

            <CustomTabPanel value={value} index={1}>
              {visitedTabs.has(1) && (
                <Suspense fallback={<TabFallback />}>
                  <SummaryReportTab
                    projectData={projectData}
                    handleRunAIAssessment={() => {
                      markAssessmentStart(projectData?.project_id);
                      handleRunAIAssessment();
                    }}
                    aiButtonLoading={isAIAssessmentLoading}
                    isCompleted={isCompleted}
                    currentProgress={currentProgress}
                  />
                </Suspense>
              )}
            </CustomTabPanel>

            <CustomTabPanel value={value} index={2}>
              {visitedTabs.has(2) && (
                <Suspense fallback={<TabFallback />}>
                  <ChatAITab
                    chatLoading={chatLoading}
                    projectData={projectData}
                    isQuestionActive={isChatQuestionActive}
                    setIsQuestionActive={setIsChatQuestionActive}
                  />
                </Suspense>
              )}
            </CustomTabPanel>
          </Box>
        </Box>

        {/* File Upload Dialog — lazy */}
        <Dialog open={openModal} onClose={handleFileModalClose} style={{ zIndex: "999" }}>
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogContent>
            {openModal && (
              <Suspense fallback={<TabFallback />}>
                <DropZoneFileUpload
                  label="You can only upload project documents"
                  typeSelect={false}
                  handleSubmitDocument={handleFileChange}
                  maxFile={0}
                />
              </Suspense>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleFileModalClose} color="primary">
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={!uploadedDocument?.length}
              onClick={handleFileUpload}
              color="primary"
            >
              Upload
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Project Modal — lazy */}
        <Modal
          title={null}
          visible={isModalVisible}
          onCancel={handleModalClose}
          footer={null}
          width={560}
          bodyStyle={{ padding: 0 }}
          closable={false}
          centered
        >
          {isModalVisible && (
            <Suspense fallback={<TabFallback />}>
              <EditProject
                data={projectData}
                onHandleClose={handleModalClose}
                editDetails={updateProjectDetails}
                type={modalType}
              />
            </Suspense>
          )}
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
