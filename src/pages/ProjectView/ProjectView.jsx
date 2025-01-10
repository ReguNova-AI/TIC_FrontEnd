import React, { useEffect, useState } from "react";
import BreadcrumbsView from "components/Breadcrumbs";
import { Typography, Box, Tabs, Tab, Grid, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import PropTypes from "prop-types";
import TimelineView from "./TimelineView";
import FileStructureView from "./FileStructureView";
import AnalyticEcommerce from "components/cards/statistics/AnalyticEcommerce";
import ProjectDetailsCardView from "./ProjectDetailCardView2";
import RecentHistory from "./RecentHistory";
import ProgressBarView from "./ProgressBarView";
// import chatAI from "../../assets/images/chatAI.png";
import ChatAIView from "./ChatAIView";
import FileCard from "./FileCard";
import EditProject from "./EditProject";
import HistoryDetails from "./HistoryDetails";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { ProjectApiService } from "services/api/ProjectAPIService";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { Spin,Modal, } from "antd";
import { API_ERROR_MESSAGE, API_SUCCESS_MESSAGE, STATUS, BUTTON_LABEL, TAB_LABEL, COUNT_CARD_LABELS, PROJECT_DETAIL_PAGE, HEADING } from "shared/constants";
import DropZoneFileUpload from "pages/ProjectCreation/DropZoneFileUpload";

import checklistfile from "../../assets/IEC-61400-12-2022.pdf";
import axios from "axios";

const ProjectView = () => {
  const navigate = useNavigate();
  const [value, setValue] = React.useState(0);
  const location = useLocation();
  const { projectName } = location.state || {};
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [projectData, SetProjectData] = useState([]);
  const [uploadedDocument,setUploadedDocument] = useState([]);
  const [chatResponse,setChatResponse] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false); // To control modal visibility
  
  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });
  const [modalType,setModalType] = useState("");
  const [openModal, setOpenModal] = useState(false); // State to control modal visibility
  const [fileName, setFileName] = useState(""); // State to store the uploaded file name
  
  useEffect(() => {
    fetchDetails(id);
  }, [id]);

  const fetchDetails = (id) => {
    ProjectApiService.projectDetails(id)
      .then((response) => {
        setSnackData({
          show: true,
          message: response?.message || API_SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY,
          type: "success",
        });
        SetProjectData(response?.data?.details[0]);
        setLoading(false);
      })
      .catch((errResponse) => {
        setSnackData({
          show: true,
          message: errResponse?.error?.message || API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
          type: "error",
        });
        setLoading(false);
      });
  };

const handlechatUpdate = (data)=>{
  
  const updatedResponse = { ...projectData };
  updatedResponse.chatResponse = {data:data};
  updatedResponse.checkListResponse = {}
  setChatResponse(data[data.length-1]?.answer);
  UpdateProjectDetails(updatedResponse);

}

const runChecklkistCRT = async()=>{
  
  // const checklistfile = document.getElementById('fileInput').files[0];
  // const payload = new FormData();
  // payload.append("file", checklistfile);
 
    
  //   const headers = {
  //     'Content-Type': 'multipart/form-data',
  //     "Accept":"application/json",
  //   };

  //   try {
  //     const response = await axios.post('http://54.158.101.113:8000/uploadstd_checklist_crt/', payload, {
  //       headers: headers
  //     });
  //    console.log("response",response)
  //   } catch (err) {
  //     console.log(err)
  //    }
  setLoading(true);
  const payload = {}
  ProjectApiService.projectStandardChecklist(payload)
      .then((response) => {
        console.log("response",response)
        setSnackData({
          show: true,
          message: response?.data?.message || API_SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY,
          type: "success",
        });
        // SetProjectData(response?.data?.details[0]);
        setLoading(false);

        const updatedResponse = { ...projectData };
        updatedResponse.checkListResponse = response?.data?.data;
        UpdateProjectDetails(updatedResponse);

      })
      .catch((errResponse) => {
        setSnackData({
          show: true,
          message: errResponse?.error?.message || API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
          type: "error",
        });
        setLoading(false);
      });


}

  const runChecklistAPI =async()=>{
    
    // const checklistfile = document.getElementById('fileInput').files[0];
    // const payload = new FormData();
    // payload.append("file", checklistfile);
    // window.open(checklistfile);

    // if (checklistfile) {
    //   // Convert file to binary (ArrayBuffer)
    //   const reader = new FileReader();
      
    //   reader.onloadend = () => {
    //     const binaryData = reader.result; // This will be an ArrayBuffer
    //     setFileBinary(binaryData); // Store the binary data in state
    //     console.log(binaryData); // Log or send to backend as needed
    //   };
      
    //   // Read the file as an ArrayBuffer (binary)
    //   reader.readAsArrayBuffer(checklistfile);
    // }

    // const headers = {
    //   'Content-Type': 'multipart/form-data',
    //   "Accept":"application/json",
    //   // "Access-Control-Allow-Origin":"*",
    //   // "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
    //   // "Access-Control-Allow-Headers": "Content-Type"
    // };

    // try {
    //   const response = await axios.post('http://54.158.101.113:8000/uploadstd_chat/', payload, {
    //     headers 
    //   });
    //  console.log("response",response)
    // } catch (err) {
    //   console.log(err)
    //  }
    const payload = {};
    
    ProjectApiService.projectUploadStandardChat(payload)
      .then((response) => {
        console.log("response",response)
        setSnackData({
          show: true,
          message: response?.data?.message || API_SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY,
          type: "success",
        });
        // SetProjectData(response?.data?.details[0]);
        // setLoading(false);
      })
      .catch((errResponse) => {
        setSnackData({
          show: true,
          message: errResponse?.error?.message || API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
          type: "error",
        });

      });
  }


  const UpdateProjectDetails = (payload) => { 
    ProjectApiService.projectUpdate(payload)
      .then((response) => {
        setSnackData({
          show: true,
          message: response?.message || API_SUCCESS_MESSAGE.UPDATED_SUCCESSFULLY,
          type: "success",
        });
        SetProjectData(response?.data?.details[0]);
        setLoading(false);
      })
      .catch((errResponse) => {
        setSnackData({
          show: true,
          message: errResponse?.error?.message || API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
          type: "error",
        });
        setLoading(false);
      });

  }

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleFileUpload = () => {
    // Handle the file upload logic here
    const updatedResponse = { ...projectData };

    // Append the new documents to the existing documents array
    updatedResponse.documents = [
      ...updatedResponse.documents,
      ...uploadedDocument
    ];
    SetProjectData(updatedResponse);
    setOpenModal(false); // Close the modal after upload
    setLoading(true);
    UpdateProjectDetails(updatedResponse);
  };


  const handleFileChange = (file) => {
    setUploadedDocument(file)
  };

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

  const handleModalOpen = (type) => {
    setModalType(type)
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    // fetchData();
  };
  const handleClose = () => {
    setIsModalVisible(false);
    // fetchData();
  };

  const updateDetails = (data) =>{
  
    const updatedResponse = { ...projectData };
    updatedResponse.project_name = data.projectName;
    updatedResponse.project_description = data.projectDesc;
    updatedResponse.project_no = data.projectNo;

    setLoading(true);
    UpdateProjectDetails(updatedResponse);
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

  return (
    <>
      <BreadcrumbsView previousLink="/projects" previousPage="My Projects" currentPage={projectData?.project_name}/>
      <Spin tip="Loading" size="large" spinning={loading}>
        <Box
          sx={{
            margin: "auto",
            padding: 3,
            background: "#fff",
            borderRadius: "10px",
            boxShadow: "6px 12px 20px #e4e4e4",
          }}
        >
          <Grid container rowSpacing={4.5} columnSpacing={2.75}>
            <Grid item xs={3} sm={3} md={3} lg={3}>
              <ProjectDetailsCardView data={projectData} handleClick={(e)=>handleModalOpen(e)}/>
            </Grid>

            <Grid item xs={9} sm={9} md={9} lg={9}>
              <Box sx={{ width: "100%" }}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tabs
                    value={value}
                    onChange={handleChange}
                    aria-label="basic tabs example"
                  >
                    <Tab label={TAB_LABEL.OVERVIEW} {...a11yProps(0)} />
                    <Tab label={TAB_LABEL.SUMMARY_REPORT} {...a11yProps(1)} />
                    <Tab label={TAB_LABEL.CHAT_AI} {...a11yProps(2)} />
                  </Tabs>
                </Box>

                {/* 1st Tab */}
                <CustomTabPanel value={value} index={0}>
                  <Grid container rowSpacing={1} columnSpacing={1}>
                    <Grid item xs={12} sm={8} md={8} lg={8}>
                      <Grid container rowSpacing={1} columnSpacing={1}>
                        <Grid item xs={12} sm={6} md={4} lg={4}>
                          <AnalyticEcommerce
                            title={COUNT_CARD_LABELS.NO_OF_RUNS}
                            count={projectData.no_of_runs}
                            graphic={false}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={4}>
                          <AnalyticEcommerce
                            title={COUNT_CARD_LABELS.SUCCESS}
                            count={projectData.success_count}
                            color="success"
                            graphic={false}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6} md={4} lg={4}>
                          <AnalyticEcommerce
                            title={COUNT_CARD_LABELS.FAILED}
                            count={projectData.fail_count}
                            color="error"
                            graphic={false}
                          />
                        </Grid>
                      </Grid>
                      <Grid container style={{ marginTop: "20px" }}>
                        <Grid item xs={12} sm={12} md={12} lg={12}>
                          <Typography>{PROJECT_DETAIL_PAGE.CURRENT_PROGRESS_STATUS}</Typography>
                          <ProgressBarView />
                        </Grid>
                        <Grid item xs={12} sm={12} md={12} lg={12}>
                          <Box
                            style={{
                              boxShadow: "0px 0px 41px #e4e4e4",
                              padding: "20px",
                              borderRadius: "10px",
                              border: "1px solid #e4e4e4",
                              width: "420px",
                              marginTop: "30px",
                            }}
                          >
                            {PROJECT_DETAIL_PAGE.UPLOADED_FILES}
                            <FileStructureView data={projectData}/>
                          </Box>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12} sm={4} md={4} lg={4}>
                      <Box
                        style={{
                          boxShadow: "0px 0px 41px #e4e4e4",
                          padding: "20px",
                          borderRadius: "10px",
                          border: "1px solid #e4e4e4",
                        }}
                      >
                        <Typography variant="h5">{PROJECT_DETAIL_PAGE.LAST_RUN_DETAILS}</Typography>
                        <div style={{ marginTop: "20px" }}>
                          <RecentHistory data={projectData} />
                        </div>
                      </Box>
                      <Box
                        sx={{
                          mt: 2,
                          display: "inline-grid",
                          float: "right",
                          textAlign: "right",
                        }}
                      >
                        <Button
                          variant="outlined"
                          onClick={() => setOpenModal(true)} // Open modal on button click
                        >
                          {BUTTON_LABEL.UPLOAD_DOCUMENTS}
                        </Button>
                        <Button variant="contained" sx={{ mt: 2 }} onClick={()=>runChecklistAPI()}>
                          {/* {BUTTON_LABEL.RUN_CHECKLIST} */}
                          Upload standard chat
                        </Button>

                        {/* <input type="file" id="fileInput" /> */}
                        <Button variant="contained" sx={{ mt: 2 }} onClick={()=>runChecklkistCRT()}>
                        uploadstd checklist crt
                        </Button>
                        
                      </Box>
                    </Grid>
                  </Grid>
                </CustomTabPanel>

                {/* 2nd Tab */}
                <CustomTabPanel value={value} index={1}>
                  <Box
                    style={{
                      display: "flex",
                      boxShadow: "0px 0px 41px #e4e4e4",
                      padding: "20px",
                      borderRadius: "10px",
                      border: "1px solid #e4e4e4",
                    }}
                  >
                    {projectData?.checkListResponse &&
                      <FileCard fileName={PROJECT_DETAIL_PAGE.CHECKLIST_REPORT} data = {projectData?.checkListResponse}/>
                    }
                    <FileCard fileName={PROJECT_DETAIL_PAGE.ASSESSMENT_REPORT} />
                  </Box>

                  <Box
                    style={{
                      boxShadow: "0px 0px 41px #e4e4e4",
                      padding: "20px",
                      borderRadius: "10px",
                      border: "1px solid #e4e4e4",
                      marginTop: "20px",
                    }}
                  >
                    <Typography style={{ fontSize: "18px" }}>
                      {PROJECT_DETAIL_PAGE.HISTORY_DETAILS}
                    </Typography>
                    <HistoryDetails />
                    <TimelineView />
                  </Box>
                </CustomTabPanel>

                {/* 3rd Tab */}
                <CustomTabPanel value={value} index={2}>
                  <Box
                    style={{
                      boxShadow: "0px 0px 41px #e4e4e4",
                      padding: "20px",
                      borderRadius: "10px",
                      border: "1px solid #e4e4e4",
                    }}
                  >
                    {/* <img src={chatAI} width="100%" /> */}
                    <ChatAIView onSubmit={(e)=>handlechatUpdate(e)} data={projectData?.chatResponse?.data} responseValue={chatResponse}/>

                  </Box>
                </CustomTabPanel>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* File Upload Modal */}
        <Dialog open={openModal} onClose={() => setOpenModal(false)}>
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogContent>
          <DropZoneFileUpload label="You can only upload project documents" typeSelect={false} handleSubmitDocument={handleFileChange} maxFile={0}/>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenModal(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleFileUpload} color="primary">
              Upload
            </Button>
          </DialogActions>
        </Dialog>

        <Modal title={HEADING.EDIT_PROJECT} visible={isModalVisible} onCancel={handleModalClose} footer={null} width={800}>
          {/* <UserCreation onHandleClose={(e)=>handleClose()}/> */}
          <EditProject data={projectData} onHandleClose={(e)=>handleClose()} editDetails={(e)=>updateDetails(e)} type={modalType}/>
        </Modal>

        {/* Snackbar */}
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          open={snackData.show}
          autoHideDuration={3000}
          onClose={() => setSnackData({ show: false })}
        >
          <Alert onClose={() => setSnackData({ show: false })} severity={snackData.type}>
            {snackData.message}
          </Alert>
        </Snackbar>
      </Spin>
    </>
  );
};

export default ProjectView;
