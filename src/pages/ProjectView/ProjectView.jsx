import React, { useEffect, useState } from "react";
import BreadcrumbsView from "components/Breadcrumbs";
import {
  Typography,
  Box,
  Tabs,
  Tab,
  Grid,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
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
import { Spin, Modal, Result ,Empty} from "antd";
import {
  API_ERROR_MESSAGE,
  API_SUCCESS_MESSAGE,
  STATUS,
  BUTTON_LABEL,
  TAB_LABEL,
  COUNT_CARD_LABELS,
  PROJECT_DETAIL_PAGE,
  HEADING,
  FORM_LABEL,
} from "shared/constants";
import DropZoneFileUpload from "pages/ProjectCreation/DropZoneFileUpload";
import chatLoadingicon from "../../assets/images/icons/chatLoadingIcon.svg";
import chatLoadingicon2 from "../../assets/images/icons/chatLoadingIcon2.svg";
import chatLoadingicon3 from "../../assets/images/icons/chatLoadingIcon3.svg";


import checklistfile from "../../assets/IEC-61400-12-2022.pdf";
import axios from "axios";
import Icon, { SmileOutlined } from "@ant-design/icons";
import { formatDate, formatDateToCustomFormat } from "shared/utility";
import { AdminConfigAPIService } from "services/api/AdminConfigAPIService";

const ProjectView = () => {
  const navigate = useNavigate();
  const [value, setValue] = React.useState(0);
  const location = useLocation();
  const { projectName,runAssessmentState } = location.state || {};
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [projectData, SetProjectData] = useState([]);
  const [standardData,setStandardData] = useState([]);
  const [uploadedDocument, setUploadedDocument] = useState([]);
  const [chatResponse, setChatResponse] = useState([]);
  const [chatLoading, setChatloading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false); // To control modal visibility
  const [historyValue,setHistoryValue] = useState([]);
  
  // const chatLoadingIcon = (props) => <Icon component={chatLoadingicon} {...props} />;

  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });
  const [modalType, setModalType] = useState("");
  const [openModal, setOpenModal] = useState(false); // State to control modal visibility
  const [fileName, setFileName] = useState(""); // State to store the uploaded file name
  const [historyData, setHistoryData] = useState({ history: [] });
  const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));
  const userName = userdetails?.[0].user_first_name + " " + userdetails?.[0].user_last_name;
  const [runState,setRunState]=useState(true);
  const [standardChatState,setStandardChatState] = useState(true);

  useEffect(() => {
    fetchDetails(id);
    fetchStandardData();
  }, [id]);

  useEffect(()=>{
   
    if(runAssessmentState === "run" && runState)
        {
          projectData?.checkListResponse ? runComplianceAssessmenet(projectData?.checkListResponse) : runChecklkistCRT();
          setRunState(false);
        }

  },[projectData,standardData])

  useEffect(()=>{

    if(projectData?.standardUploaded === false || projectData?.standardUploaded === 0 || projectData?.standardUploaded === "false" || projectData.standardUploaded === null || projectData.standardUploaded === "null" || projectData?.standardUploaded === undefined)
    { 
      
      if(standardChatState)
      {
        runChecklistAPI();
      }
    }

  },[standardData])

  const fetchDetails = (id) => {
    ProjectApiService.projectDetails(id)
      .then((response) => {
        setSnackData({
          show: true,
          message:
            response?.message || API_SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY,
          type: "success",
        });
        SetProjectData(response?.data?.details[0]);
        setHistoryData({history:response?.data?.details[0].history || [] })
        setHistoryValue(response?.data?.details[0].history);
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

  const fetchStandardData = () => {
    AdminConfigAPIService.standardListing()
      .then((response) => {
        // Check the response structure and map data accordingly
        if (response?.data?.details) {
          setStandardData(response?.data?.details);
        }
        setLoading(false);

        setSnackData({
          show: true,
          message:
            response?.message || API_SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY,
          type: "success",
        });
      })
      .catch((errResponse) => {
        setLoading(false);
        setSnackData({
          show: true,
          message:
            errResponse?.error?.message ||
            API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
          type: "error",
        });
      });
  };


  const handlechatUpdate = (data) => {
    const updatedResponse = { ...projectData };
    updatedResponse.chatResponse = { data: data };
    setChatResponse(data[data.length - 1]?.answer);
    UpdateProjectDetails(updatedResponse, false);
  };

  const parseApiResponse = (response) => {

    // Check if the response contains '---' and '**' (first format)
    if (response.includes('---') || response.includes('**')) {
        // Handle the first format (with '**' and '---')
        const sections = response.split('---').slice(1); // Skip the first "Title" section
        const lastSection = sections[sections.length - 1]?.trim();

        // If the last section starts with "Summary:", explicitly name it
        if (lastSection?.startsWith("Summary:")) {
            sections[sections.length - 1] = `**Summary**\n${lastSection}`;
        }

        let dataArray = [];

        // Now process all sections
        sections.map((section, index) => {
            let lines = section?.trim()?.split('\n'); // Split the section into lines

            // Extract and clean the title of the section
            let title = lines[0].replace('**', '').replace(':', '').trim();
            title= title.replace("**","");
            // Handle scenarios where the title might include "Section X:" or just the section heading
            if(title?.startsWith("Summary"))
      {
        lines.push(title.replace("Summary",`${index}.`))
        lines[0] = title.replace("Summary** ",`${index}.`);
        
        title = "Summary";
      } 
      else{
        title = title.replace(`Section ${index + 1}`, '')?.trim();
      }   

            // Clean remaining lines into 'points'
            const points = lines.slice(1).map(line => line !== "" && line !== null && dataArray.push(line.replace(/^\d+\./, '')?.trim()));
     
            // Return the formatted section data
            return { title, points };
        });

        return dataArray;
    }

    // If the response contains '###' but not '---' (second format)
    else if (response.includes('###')) {
        // Handle the second format (with '###')
        const sections = response.split('###').slice(1); // Skip the first part (Title)

        let dataArray = [];

        sections.forEach((section, index) => {
            let lines = section.trim().split('\n');

            // Extract and clean the title of the section
            let title = lines[0].replace(':', '').trim();

            if(title?.startsWith("Summary"))
            {
              lines.push(title.replace("Summary",`${index}.`))
              lines[0] = title.replace("Summary** ",`${index}.`);
              
              title = "Summary";
            } 
            else{
              title = title.replace(`Section ${index + 1}`, '')?.trim();
            }   
            // Clean the remaining lines as points (handling numbered list items)
            const points = lines.slice(1).map(line => line !== "" && line !== null && dataArray.push(line.replace(/^\d+\./, '')?.trim()));
     
            return { title, points };
            // Return the formatted section data
            // dataArray.push({ title, points });
        });

        return dataArray;
    }

    // Default case (if the response doesn't match either format)
    else {
        console.error("Unknown response format");
        return [];
    }
};



  const runComplianceAssessmenet = async (query) =>{
   
    const regex = /\/([^/]+)$/; // Match the part after the last "/"
    let file=null;
    projectData?.documents?.forEach((document) => {
      let { documenttype, name, path } = document;
      if(documenttype === FORM_LABEL.PROJECT_DOCUMENT)
      {
       file = path;
      }
    });

   
    const match = file?.match(regex);

    const payload = new FormData();
    payload.append("imageKey", match?.[1]);

    // const payload = {
    //   imageKey :match?.[1]
    // };

    const data = parseApiResponse(query);


    if(match !== undefined && match?.length >0)
    {
      setLoading(true);
    ProjectApiService.projectDocumentUpload(payload)
      .then((response) => {
        // setLoading(false);

        let payload1 = {
          "requirements":data,
        }

        ProjectApiService.projectComplianceAssessment(payload1)
      .then((response) => {
        // setSnackData({
        //   show: true,
        //   message:
        //     response?.data?.message || API_SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY,
        //   type: "success",
        // });
        // SetProjectData(response?.data?.details[0]);
        setLoading(false);
        let status = null;

        if(response?.data?.success === false || response?.data?.error ==="An error occurred while fetching data")
        {
          status = "error";
        }

        const array = response?.data?.data;
        const delimiter = "|,|";  // You can use any delimiter you want
        const result = array.join(delimiter);

        const updatedResponse = { ...projectData };
        const previousData = {...projectData};
        updatedResponse.complianceAssesment = `${result}`;
        updatedResponse.no_of_runs = updatedResponse?.no_of_runs + 1;
        if(status === "error")
        {
          updatedResponse.fail_count= updatedResponse?.fail_count + 1;
        }
        else{
          updatedResponse.success_count= updatedResponse?.success_count + 1;
        }
        // updatedResponse.success_count= updatedResponse?.success_count + 1;
        updatedResponse.status = status === "error" ? "Failed" : "Success";
        updatedResponse.last_run = formatDateToCustomFormat(new Date());
        const newHistory = createHistoryObject(projectData, previousData,"assessmentRun");
        setHistoryData((prevState) => {
          const updatedHistory = [...prevState.history, newHistory]; // Append the new history item
          // After the state update, include the updated history in the updatedResponse
          const updatedResponseWithHistory = { ...updatedResponse, history: updatedHistory };

          if(status === "error")
          {
            setSnackData({
              show: true,
              message:API_ERROR_MESSAGE.FAILED_TO_RUN_ASSESSMENT,
              type: "error",
            });
          }
          
          // You can also call UpdateProjectDetails here, using the updated response with history
          // setLoading(true);
          UpdateProjectDetails(updatedResponseWithHistory, false);
      
          return { history: updatedHistory }; // Update state with the new history array
        });


        // UpdateProjectDetails(updatedResponse, true);
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
        const updatedResponse = { ...projectData };
        const previousData = {...projectData};
        updatedResponse.no_of_runs = updatedResponse?.no_of_runs + 1;
        updatedResponse.fail_count= updatedResponse?.fail_count + 1;
        updatedResponse.status = "Failed";
        updatedResponse.last_run = formatDateToCustomFormat(new Date());
        const newHistory = createHistoryObject(projectData, previousData,"assessmentRun");
        setHistoryData((prevState) => {
          const updatedHistory = [...prevState.history, newHistory]; // Append the new history item
          // After the state update, include the updated history in the updatedResponse
          const updatedResponseWithHistory = { ...updatedResponse, history: updatedHistory };
          
          // You can also call UpdateProjectDetails here, using the updated response with history
          // setLoading(true);
          UpdateProjectDetails(updatedResponseWithHistory, false);
      
          return { history: updatedHistory };
        });

      });
        // UpdateProjectDetails(updatedResponse, true);
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
        const updatedResponse = { ...projectData };
        const previousData = {...projectData};
        updatedResponse.no_of_runs = updatedResponse?.no_of_runs + 1;
        updatedResponse.fail_count= updatedResponse?.fail_count + 1;
        updatedResponse.status = "Failed";
        updatedResponse.last_run = formatDateToCustomFormat(new Date());

        const newHistory = createHistoryObject(projectData, previousData,"assessmentRun");
        setHistoryData((prevState) => {
          const updatedHistory = [...prevState.history, newHistory]; // Append the new history item
          // After the state update, include the updated history in the updatedResponse
          const updatedResponseWithHistory = { ...updatedResponse, history: updatedHistory };
          
          // You can also call UpdateProjectDetails here, using the updated response with history
          // setLoading(true);
          UpdateProjectDetails(updatedResponseWithHistory, false);
      
          return { history: updatedHistory };
        });
      });
    }
    else
    {
      setLoading(false);
      setSnackData({
        show: true,
        message:API_ERROR_MESSAGE.DOCUMENT_NOT_FOUND,
        type: "error",
      });
    }

    
  };

  const runChecklkistCRT = async () => {

    let fileName= standardData?.find((data) => data?.standard_name === projectData?.regulatory_standard)?.standard_url;
    let customFileName = projectData?.documents?.filter(f => f.documenttype === FORM_LABEL.CUSTOM_REGULATORY)?.map(f => f.path);

    if((fileName === undefined || fileName === null) && customFileName?.length<=0)
    {
      fileName = projectData?.mapping_standards;
    }
    
    if(fileName !== undefined)
    {
    const regex = /\/([^/]+)$/; // Match the part after the last "/"
    const match = customFileName?.length > 0 ? customFileName?.[0].match(regex) : fileName?.match(regex);

    const payload = new FormData();
    payload.append("imageKey", match?.[1]);
    // const payload = {
    //   imageKey :match[1]
    // };
    setLoading(true);

    ProjectApiService.projectStandardChecklist(payload)
      .then((response) => {
        console.log("response", response);
        setSnackData({
          show: true,
          message:
            response?.data?.message || API_SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY,
          type: "success",
        });
        // SetProjectData(response?.data?.details[0]);
        setLoading(false);
        handleCRTUpdate(response);
       


        // UpdateProjectDetails(updatedResponse, true);
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
    }
  };

  const handleCRTUpdate = (response)=>{
    const updatedResponse = { ...projectData };
    const previousData ={...projectData};
    updatedResponse.checkListResponse = response?.data?.data;
    // updatedResponse.no_of_runs = updatedResponse.no_of_runs + 1;
    updatedResponse.status = "In Progress";
    updatedResponse.last_run = formatDateToCustomFormat(new Date());

    const newHistory = createHistoryObject(projectData, previousData,"checklistRun");
    setHistoryData((prevState) => {
      const updatedHistory = [...prevState.history, newHistory]; // Append the new history item
      // After the state update, include the updated history in the updatedResponse
      const updatedResponseWithHistory = { ...updatedResponse, history: updatedHistory };
      
      // You can also call UpdateProjectDetails here, using the updated response with history
      // setLoading(true);
      UpdateProjectDetails(updatedResponseWithHistory, false);
  
      return { history: updatedHistory }; // Update state with the new history array
    });
  }

  const runChecklistAPI = async () => { 
    let fileName= standardData?.find((data) => data?.standard_name === projectData?.regulatory_standard)?.standard_url;
    if(fileName === undefined || fileName === null)
    {
      fileName = projectData?.mapping_standards;
    }
   
    if(fileName !== undefined)
    {
    const regex = /\/([^/]+)$/; // Match the part after the last "/"

    const match = fileName.match(regex);

    const payload = new FormData();
    payload.append("imageKey", match?.[1]);
    // const payload = {
    //   imageKey :match[1]
    // };
    setChatloading(true);
    setStandardChatState(false);
    ProjectApiService.projectUploadStandardChat(payload)
      .then((response) => {
        // console.log("response",response)
        // setSnackData({
        //   show: true,
        //   message: response?.data?.message || API_SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY,
        //   type: "success",
        // });
        // SetProjectData(response?.data?.details[0]);
        setChatloading(false);
        handlestandardChatUploadUpdate();
        setStandardChatState(false);     

      })
      .catch((errResponse) => {
        // setSnackData({
        //   show: true,
        //   message: errResponse?.error?.message || API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
        //   type: "error",
        // });
        setChatloading(false);
      });
    }
  };

  const handlestandardChatUploadUpdate = () => {
   
    const updatedResponse = { ...projectData };
    updatedResponse.standardUploaded = "true";

    const previousData = { ...projectData };
    const newHistory = createHistoryObject(updatedResponse, previousData,"StandardUpdates");
    
    setHistoryData((prevState) => {
      const updatedHistory = [...prevState.history, newHistory]; // Append the new history item
      // After the state update, include the updated history in the updatedResponse
      const updatedResponseWithHistory = { ...updatedResponse, history: updatedHistory };
      
      // You can also call UpdateProjectDetails here, using the updated response with history
      UpdateProjectDetails(updatedResponseWithHistory, false);
  
      return { history: updatedHistory }; // Update state with the new history array
    });
    // UpdateProjectDetails(updatedResponse, false);

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
        SetProjectData(response?.data?.details[0]);
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

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleFileUpload = () => {
    // Handle the file upload logic here
    const updatedResponse = { ...projectData };

    // Append the new documents to the existing documents array
    updatedResponse.documents = [
      ...updatedResponse.documents,
      ...uploadedDocument,
    ];
    SetProjectData(updatedResponse);
    setOpenModal(false); // Close the modal after upload
    setLoading(true);

    const previousData = { ...projectData };
    const newHistory = createHistoryObject(uploadedDocument, previousData,'documentUpload');
    setHistoryData((prevState) => {
      const updatedHistory = [...prevState.history, newHistory]; // Append the new history item
      // After the state update, include the updated history in the updatedResponse
      const updatedResponseWithHistory = { ...updatedResponse, history: updatedHistory };
      
      // You can also call UpdateProjectDetails here, using the updated response with history
      setLoading(true);
      UpdateProjectDetails(updatedResponseWithHistory, false);
  
      return { history: updatedHistory }; // Update state with the new history array
    });


    // UpdateProjectDetails(updatedResponse, false);
  };

  const handleFileChange = (file) => {
    setUploadedDocument(file);
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
    setModalType(type);
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

  // Helper function to create a history object based on changes
  const createHistoryObject = (data, previousData,heading) => {

    const historyItem = {
      changedby: userName,
      date: new Date().toISOString(),
      changes: {
        projectName: heading === "projectDetails" ? data?.projectName !== previousData.project_name ? data.projectName : '':"",
        projectNo: heading === "projectDetails" ? data?.projectNo !== previousData.project_no ? data.projectNo : '':"",
        description: heading === "projectDetails" ? data?.projectDesc !== previousData.project_description ? data.projectDesc : '':"",
        invite: '', 
        documents: heading === "documentUpload" ? data ? data : '':"", 
        checklistRun: heading === "checklistRun" ? "Checklist generated" :'', 
        assessmentRun: heading === "assessmentRun" ? "Compliance Assessment run" :'',
        standardUplaoded: heading === "StandardUpdates" ? data.standardUploaded !== previousData.standardUploaded ? data.standardUploaded : '':"",
        status: previousData.status, 
      },
    };
    return historyItem;
  };

  const updateDetails = (data) => {
    const updatedResponse = { ...projectData };
    const previousData = { ...projectData };
    updatedResponse.project_name = data.projectName;
    updatedResponse.project_description = data.projectDesc;
    updatedResponse.project_no = data.projectNo;
    updatedResponse.invite_members = data.invite_Users;
    updatedResponse.invited_user_list = data.invited_user_list;
    const newHistory = createHistoryObject(data, previousData,"projectDetails");
    setHistoryData((prevState) => {
      const updatedHistory = [...prevState.history, newHistory]; // Append the new history item
      // After the state update, include the updated history in the updatedResponse
      const updatedResponseWithHistory = { ...updatedResponse, history: updatedHistory };
      
      // You can also call UpdateProjectDetails here, using the updated response with history
      setLoading(true);
      UpdateProjectDetails(updatedResponseWithHistory, false);
  
      return { history: updatedHistory }; // Update state with the new history array
    });

    // setLoading(true);
    // UpdateProjectDetails(updatedResponse, false);
  };

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
      <BreadcrumbsView
        previousLink="/projects"
        previousPage="My Projects"
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
          }}
        >
          <Grid container rowSpacing={4.5} columnSpacing={2.75}>
            <Grid item xs={3} sm={3} md={3} lg={3}>
              <ProjectDetailsCardView
                data={projectData}
                handleClick={(e) => handleModalOpen(e)}
              />
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
                        {/* <Grid item xs={12} sm={12} md={12} lg={12}>
                          <Typography>
                            {PROJECT_DETAIL_PAGE.CURRENT_PROGRESS_STATUS}
                          </Typography>
                          <ProgressBarView />
                        </Grid> */}
                        <Grid item xs={12} sm={12} md={12} lg={12}>
                          <Box
                            style={{
                              boxShadow: "0px 0px 41px #e4e4e4",
                              padding: "20px",
                              borderRadius: "10px",
                              border: "1px solid #e4e4e4",
                              // width: "420px",
                              marginTop: "30px",
                            }}
                          >
                            {PROJECT_DETAIL_PAGE.UPLOADED_FILES}
                            <FileStructureView data={projectData} />
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
                        <Typography variant="h5">
                          {PROJECT_DETAIL_PAGE.LAST_RUN_DETAILS}
                        </Typography>
                        <span style={{ fontSize: "12px", color: "grey" }}>
                          {projectData.last_run !== null &&
                          projectData.last_run !== "null" &&
                          projectData.last_run !== ""
                            ? formatDate(projectData.last_run)
                            : ""}
                        </span>
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
                        {/* <Button variant="contained" sx={{ mt: 2 }} onClick={()=>runChecklistAPI()}>
                         
                          Upload standard chat
                        </Button> */}

                        {/* <input type="file" id="fileInput" /> */}
                        <Button
                          variant="contained"
                          sx={{ mt: 2 }}
                          onClick={() => projectData.checkListResponse ? runComplianceAssessmenet(projectData.checkListResponse) : runChecklkistCRT() }
                        >
                         {projectData.checkListResponse ? BUTTON_LABEL.RUN_PROJECT : BUTTON_LABEL.RUN_CHECKLIST} 
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
                    {projectData?.checkListResponse && (
                      <FileCard
                        fileName={PROJECT_DETAIL_PAGE.CHECKLIST_REPORT}
                        data={projectData?.checkListResponse}   
                        projectData={projectData}
                      />
                    )}
                    {projectData?.complianceAssesment && (
                      <FileCard
                        fileName={PROJECT_DETAIL_PAGE.ASSESSMENT_REPORT}
                        data1={projectData?.complianceAssesment}
                        data={projectData?.checkListResponse}
                        projectData={projectData}
                      />
                    )}    
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
                    
                    {projectData?.history !== undefined && projectData?.history !== null ?
                      <HistoryDetails data={projectData?.history || historyValue}/>
                      :
                      <Empty />
                    }
                    {/* <TimelineView /> */}
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
                    {/* <Spin tip="Just a moment, I'm gathering the information for you..." size="large" spinning={chatLoading} style={{background:"white"}}> */}
                    {chatLoading ? (
                      <Result
                        icon={<img src={chatLoadingicon2} width={"20%"} />}
                        subTitle="Just a moment, I'm gathering the information for you..."
                      />
                    ) : (
                      <ChatAIView
                        onSubmit={(e) => handlechatUpdate(e)}
                        data={projectData?.chatResponse?.data}
                        responseValue={chatResponse}
                      />
                    )}
                    {/* </Spin> */}
                  </Box>
                </CustomTabPanel>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* File Upload Modal */}
        <Dialog open={openModal} onClose={() => setOpenModal(false)} style={{zIndex:"999"}}>
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
            <Button onClick={handleFileUpload} color="primary">
              Upload
            </Button>
          </DialogActions>
        </Dialog>

        <Modal
          title={
            modalType === "Edit" ? HEADING.EDIT_PROJECT : HEADING.INVITE_USERS
          }
          visible={isModalVisible}
          onCancel={handleModalClose}
          footer={null}
          width={800}
        >
          {/* <UserCreation onHandleClose={(e)=>handleClose()}/> */}
          <EditProject
            data={projectData}
            onHandleClose={(e) => handleClose()}
            editDetails={(e) => updateDetails(e)}
            type={modalType}
          />
        </Modal>

        {/* Snackbar */}
        <Snackbar
          style={{ top: "80px" }}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          open={snackData.show}
          autoHideDuration={3000}
          onClose={() => setSnackData({ show: false })}
        >
          <Alert
            onClose={() => setSnackData({ show: false })}
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
