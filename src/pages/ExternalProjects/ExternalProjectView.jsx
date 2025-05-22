import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  Box,
  Tab,
  Tabs,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Button, Spin } from "antd";
import BreadcrumbsView from "components/Breadcrumbs";

import {
  API_ERROR_MESSAGE,
  API_SUCCESS_MESSAGE,
  BUTTON_LABEL,
  PROJECT_DETAIL_PAGE,
  TAB_LABEL,
} from "shared/constants";
import PropTypes from "prop-types";
import FileStructureView from "pages/ProjectView/FileStructureView";
import ProgressBarView from "pages/ProjectView/ProgressBarView";
import processIcon from "../../assets/images/process.png";
import { ProjectApiService } from "services/api/ProjectAPIService";
import ProjectDetailsCardView from "pages/ProjectView/ProjectDetailCardView2";
import DropZoneFileUpload from "pages/ProjectCreation/DropZoneFileUpload";
import { createHistoryObject } from "pages/ProjectView/ProjectView";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

const tabIndex = (index) => {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
};

const ExternalProjectView = () => {
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [projectData, setProjectData] = useState([]);
  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });
  const [openModal, setOpenModal] = useState(false); // State to control modal visibility
  const [uploadedDocument, setUploadedDocument] = useState([]);

  const [historyData, setHistoryData] = useState({ history: [] });

  const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));
  const userName =
    userdetails?.[0].user_first_name + " " + userdetails?.[0].user_last_name;

  useEffect(() => {
    fetchProjectData(id);
  }, []);

  const fetchProjectData = async (id) => {
    setLoading(true);
    try {
      const response = await ProjectApiService.projectDetails(id);
      if (response?.status) {
        console.log("response", response?.data?.details[0]);
        setProjectData(response?.data?.details[0]);
      }
    } catch (error) {
      setSnackData({
        show: true,
        message: API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleModalOpen = () => {};

  const handleFileChange = (file) => {
    setUploadedDocument(file);
  };

  const UpdateProjectDetails = (payload, countUpdate = false) => {
    ProjectApiService.projectUpdate(payload)
      .then((response) => {
        setSnackData({
          show: true,
          message:
            response?.message || API_SUCCESS_MESSAGE.UPDATED_SUCCESSFULLY,
          type: "success",
        });
        setProjectData(response?.data?.details[0]);
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
        setLoading(false);
      });
  };

  const handleFileUpload = () => {
    // Handle the file upload logic here
    const updatedResponse = { ...projectData };

    if (uploadedDocument) {
      // Append the new documents to the existing documents array
      updatedResponse.documents = [
        ...updatedResponse.documents,
        ...uploadedDocument,
      ];
      setProjectData(updatedResponse);
      setOpenModal(false); // Close the modal after upload
      setLoading(true);

      const previousData = { ...projectData };
      const newHistory = createHistoryObject(
        uploadedDocument,
        previousData,
        "documentUpload",
        userName
      );
      setHistoryData((prevState) => {
        const updatedHistory = [...prevState.history, newHistory]; // Append the new history item
        // After the state update, include the updated history in the updatedResponse
        const updatedResponseWithHistory = {
          ...updatedResponse,
          history: updatedHistory,
        };

        // You can also call UpdateProjectDetails here, using the updated response with history
        setLoading(true);
        UpdateProjectDetails(updatedResponseWithHistory, false);

        return { history: updatedHistory }; // Update state with the new history array
      });
    }

    // UpdateProjectDetails(updatedResponse, false);
  };
  return (
    <>
      <BreadcrumbsView
        previousLink="/externalProjects"
        previousPage="External Projects"
        currentPage={projectData?.project_name}
      />
      <Spin tip="Loading" size="large" spinning={loading}>
        <Box
          sx={{
            margin: "auto",
            padding: 3,
            background: "#fff",
            borderRadius: "10px",
            boxShadow: "6px 12px 20px #e4e4e4",
            width: "100%",
            height: "100vh",
            // overflowY: "scroll",
            // overflowX: "hidden",
          }}
        >
          <Grid container rowSpacing={4.5} columnSpacing={2.75}>
            <Grid item xs={3} sm={3} md={3} lg={3}>
              <ProjectDetailsCardView
                data={projectData}
                handleClick={(e) => handleModalOpen(e)}
                isExternalProject={true}
              />
            </Grid>

            <Grid item xs={9} sm={9} md={9} lg={9}>
              <Box sx={{ width: "60%" }}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tabs
                    value={0}
                    // onChange={handleChange}
                    aria-label="basic tabs example"
                  >
                    <Tab label={TAB_LABEL.OVERVIEW} {...tabIndex(0)} />
                  </Tabs>
                </Box>
                <CustomTabPanel value={0} index={0}>
                  <Grid container>
                    <Grid item xs={12} sm={12} md={12} lg={12}>
                      <Box
                        style={{
                          boxShadow: "0px 0px 41px #e4e4e4",
                          padding: "20px",
                          borderRadius: "10px",
                          border: "1px solid #e4e4e4",
                          // width: "420px",
                          //   marginTop: "30px",
                        }}
                      >
                        {PROJECT_DETAIL_PAGE.UPLOADED_FILES}
                        <FileStructureView data={projectData} />
                      </Box>
                    </Grid>
                    {projectData?.status === "Processing" && (
                      <Grid
                        item
                        xs={12}
                        sm={12}
                        md={12}
                        lg={12}
                        style={{
                          justifyItems: "center",
                          marginTop: "40px",
                        }}
                      >
                        <img src={processIcon} width="150px" />
                        <ProgressBarView />
                      </Grid>
                    )}

                    <Box sx={{ mt: 1.5 }} border={1} borderColor="blue">
                      <Button
                        variant="contained" // Solid fill style
                        color="primary" // Blue color (default primary)
                        onClick={() => setOpenModal(true)}
                        disabled={projectData?.status === "Processing"}
                        fullWidth // Optional: makes it span the full container width
                      >
                        {BUTTON_LABEL.UPLOAD_ADDITIONAL_DOCUMENTS}
                      </Button>
                    </Box>
                  </Grid>
                </CustomTabPanel>
              </Box>
            </Grid>
          </Grid>
        </Box>
        <Dialog
          open={openModal}
          onClose={() => setOpenModal(false)}
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
            <Button onClick={() => setOpenModal(false)} color="primary">
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
      </Spin>
    </>
  );
};

export default ExternalProjectView;
