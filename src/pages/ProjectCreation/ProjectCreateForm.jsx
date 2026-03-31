import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";

import UserProfileCard from "./UserProfileCard";
import BreadcrumbsView from "components/Breadcrumbs";
import { ProjectApiService } from "services/api/ProjectAPIService";
import { useNavigate } from "react-router-dom";

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { extractApiError, formatDateToCustomFormat } from "shared/utility";
import {
  API_ERROR_MESSAGE,
  API_SUCCESS_MESSAGE,
  BUTTON_LABEL,
  FORM_LABEL,
  HEADING,
} from "shared/constants";
import { UserApiService } from "services/api/UserAPIService";
import { AdminConfigAPIService } from "services/api/AdminConfigAPIService";
import { FileUploadApiService } from "services/api/FileUploadAPIService";
import { Spin } from "antd";
import DocumentSection from "./AddDocuments";
import { PaymentApiService } from "services/api/Payment";
import { useQueryClient } from "@tanstack/react-query";

const CreateProjectForm = () => {
  const [submissionStatus, setSubmissionStatus] = useState("");
  const navigate = useNavigate();
  const [userData, setUserData] = useState([]); // Initially, set userData as an empty array
  const [standardData, setStandardData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [industryData, setIndustryData] = useState([]);
  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });
  const [documents, setDocuments] = useState([]);
  const [submitLoding, setSubmitLoading] = useState(false);
console.log(documents,"documents");

  const [formData, setFormData] = useState({
    projectName: "",
    projectNo: "",
    projectDesc: "",
    teamMembers: [], // Array to hold selected team members
    regulatory: "",
    invite_Users: [],
    document: [],
    status: "",
    invited_user_list: [],
    mapping_standards: "",
    checkListResponse: "",
    industry_id: "",
    industry_name: "",
  });

  const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));
  const industryDetails = userdetails?.[0]?.industries;

  // Fetch the user data when the component mounts
  useEffect(() => {
    fetchUserData();
    fetchStandardData();
    if (industryDetails?.length > 1) {
      fetchIndustryData();
    }
  }, []);

  // Get query client for manual cache invalidation
  const queryClient = useQueryClient();

  const fetchIndustryData = () => {
    UserApiService.industryDetails()
      .then((response) => {
        // setSnackData({
        //   show: true,
        //   message:
        //     response?.message || API_SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY,
        //   type: "success",
        // });
        setIndustryData(
          response?.data?.details?.filter((data) =>
            industryDetails?.includes(data.industry_id),
          ) || [],
        ); // Use an empty array as fallback
      })
      .catch((errResponse) => {
        setSnackData({
          show: true,
          message:
            errResponse?.error?.message ||
            API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
          type: "error",
        });
      });
  };

  const fetchUserData = () => {
    UserApiService.userListing()
      .then((response) => {
        if (response && response?.data) {
          const userEmailToExclude = userdetails?.[0]?.user_email;
          const filteredUsers = response?.data?.activeUsers?.filter(
            (user) => user.user_email !== userEmailToExclude,
          );

          setUserData(filteredUsers); //

          // setUserData(response?.data?.activeUsers ); // Assuming response.data contains the user list
          //   setSnackData({
          //     show: true,
          //     message:
          //       response?.message || API_SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY,
          //     type: "success",
          //   });
        }
      })
      .catch((errResponse) => {
        setSnackData({
          show: true,
          message:
            errResponse?.error?.message ||
            API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
          type: "error",
        });
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

        // setSnackData({
        //   show: true,
        //   message:
        //     response?.message || API_SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY,
        //   type: "success",
        // });
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };


  const handleMultiple = (selectedIds) => {
    const invitedId = formData.invited_user_list;
    const selectedMembers = selectedIds
      ?.map((userId) => {
        const member = userData.find((user) => user.user_id === userId);
        if (member) {
          invitedId.push(member.user_id);
        }
        return member
          ? {
            user_id: member.user_id,
            user_name: `${member.user_first_name} ${member.user_last_name}`,
            user_email: member.user_email,
            user_profile: member.user_profile,
          }
          : null;
      })
      .filter(Boolean);
    setFormData({
      ...formData,
      invite_Users: selectedMembers,
      invited_user_list: invitedId,
    });
    return selectedMembers;
  };

  const cleanDocuments = (documents) => {
    // Filter out documents without document_name and then clean them
    return documents
      .map(({ file, progress, ...rest }) => rest);
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent form submission first
    console.log(documents,"documents in handleSubmit");

    // Check for empty folders
    const allFolders = [
      ...new Set(
        documents
          .map((doc) => doc.folder_name)
          .filter((folder) => folder && folder.trim() !== ""),
      ),
    ];

    setSubmitLoading(true);
    const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));
    const updatedStatus =
      submissionStatus === "Draft" ? "Draft" : "In Progress";
    const selectedUserData = handleMultiple(formData.teamMembers);

    const historyItem = {
      changedby:
        userdetails?.[0]?.user_first_name +
        " " +
        userdetails?.[0]?.user_last_name,
      date: new Date().toISOString(),
      changes: {
        projectName: formData.projectName || "",
        projectNo: formData.projectNo || "",
        description: formData.projectDesc || "",
        invite: "",
        documents: formData.document || "",
        checklistRun: "",
        assessmentRun: "",
        standardUplaoded: "",
        status: updatedStatus,
      },
    };
    const cleanedDocuments = cleanDocuments(documents);

    const payload = {
      project_name: formData.projectName,
      project_no: formData.projectNo,
      project_description: formData.projectDesc,
      regulatory_standard: formData.regulatory,
      invite_members: selectedUserData,
      invited_user_list: formData.invited_user_list,
      //   documents: formData.document,
      //   documents: documents,
      documents: cleanedDocuments,
      // folder_name:[documents],
      org_id: userdetails?.[0]?.org_id,
      org_name: userdetails?.[0]?.org_name,
      created_by_id: userdetails?.[0]?.user_id,
      created_by_name:
        userdetails?.[0]?.user_first_name +
        " " +
        userdetails?.[0]?.user_last_name,
      sector_id: userdetails?.[0]?.sector_id,
      sector_name: userdetails?.[0]?.sector_name,
      industry_id:
        formData.industry_id ||
        userdetails?.[0]?.industry_id ||
        userdetails?.[0]?.industries?.[0],
      industry_name:
        formData.industry_name ||
        userdetails?.[0]?.industry_names ||
        userdetails?.[0]?.industries?.[0],
      status: updatedStatus,
      // no_of_runs: updatedStatus === "Draft" ? 0 : 1,
      no_of_runs: 0,
      success_count: 0,
      fail_count: 0,
      // last_run: submissionStatus === 'Draft' ? null : formatDateToCustomFormat(new Date()),
      mapping_standards: formData.mapping_standards,
      summary_report: {},
      history: [historyItem],
      checkListResponse: formData?.checkListResponse,
    };
    if (submissionStatus !== "Draft") {
      payload.last_run = formatDateToCustomFormat(new Date());
    }
    console.log(payload,"payload");
    
    PaymentApiService.isProjectCreationAllowed({
      user_id: userdetails?.[0]?.user_id,
    })
      .then((response) => {
        if (response.data?.details?.restricted) {
          setSnackData({
            show: true,
            message: "You have reached the maximum number of projects allowed.",
            type: "error",
          });

          setTimeout(() => {
            navigate("/payment?source=restriction");
          }, 2000);
        } else {
          ProjectApiService.projectCreate(payload)
            .then((response) => {
              setSubmitLoading(false);
              setSnackData({
                show: true,
                message: response.message,
                type: "success",
              });
              console.log("payload", payload);
              const projectId = response?.data?.details?.[0].project_id;
              navigate(`/projectView/${projectId}`, {
                state: {
                  projectId: projectId,
                  projectName: formData.projectName,
                },
              });
              queryClient.invalidateQueries({ queryKey: ["projects"] });
            })
            .catch((errResponse) => {
              setSubmitLoading(false);
              setSnackData({
                show: true,
                message: extractApiError(errResponse),
                type: "error",
              });
            });
        }
      })
      .catch((errResponse) => {
        console.log("errResponse", errResponse);
      });
  };

  return (
    <>
      <BreadcrumbsView currentPage="Create Project" />
      <Spin tip="Uploading Regulatory Standard" size="large" spinning={loading}>
        <Box
          sx={{
            margin: "auto",
            padding: 3,
            background: "#fff",
            borderRadius: "10px",
            boxShadow: "6px 12px 20px #e4e4e4",
          }}
        >
          <Typography variant="h4" gutterBottom>
            {HEADING.CREATE_NEW_PROJECT}
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* First row - 3 items */}
              <Grid item xs={12} sm={4}>
                <TextField
                  label={FORM_LABEL.PROJECT_NAME}
                  variant="outlined"
                  fullWidth
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleInputChange}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={8}>
                <TextField
                  label={FORM_LABEL.PROJECT_DESC}
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  name="projectDesc"
                  value={formData.projectDesc}
                  onChange={handleInputChange}
                  required
                  inputProps={{ maxLength: 200 }}
                  helperText={`${formData.projectDesc?.length}/200`}
                  FormHelperTextProps={{
                    sx: {
                      textAlign: "right",
                      width: "100%",
                      position: "absolute",
                      bottom: "8px",
                      right: "10px",
                      color:
                        formData.projectDesc.length > 180
                          ? "red"
                          : "text.secondary",
                    },
                  }}
                  sx={{
                    position: "relative",
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={12}>
                <DocumentSection
                  documents={documents}
                  setDocuments={setDocuments}
                />
              </Grid>

              <Grid item xs={12} sm={12}>
                <Button
                  type="submit"
                  variant="contained"
                  onClick={() => {
                    setSubmissionStatus("Draft");
                  }}
                  loading={submitLoding}
                  disabled={submitLoding}
                  style={{
                    // background: "#003a8c",
                    float: "right",
                    textTransform: "none",
                  }}
                >
                  {BUTTON_LABEL.SAVE_PROJECT}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Spin>
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
    </>
  );
};

export default CreateProjectForm;
