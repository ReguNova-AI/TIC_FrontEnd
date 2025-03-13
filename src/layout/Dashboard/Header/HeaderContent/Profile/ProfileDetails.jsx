import React, { useEffect, useState } from "react";
import {
  Card,
  Descriptions,
  Avatar,
  Button,
  Col,
  Row,
  Spin,
  Divider,
  Tag,
} from "antd";
import { API_ERROR_MESSAGE, API_SUCCESS_MESSAGE } from "shared/constants";
import { UserApiService } from "services/api/UserAPIService";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import avatar1 from "assets/images/users/avatar-1.png";
import AvatarUpload from "../../../../../pages/Users/AvatarUpload";

const ProfileDetails = () => {
  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploadedFileData, setUploadedFileData] = useState("");
  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });

  const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));
  const userId = userdetails?.[0]?.user_id;
  const userRole = userdetails?.[0]?.role_name;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (uploadedFileData) {
      let payload = {
        ...profileData,
        user_profile: uploadedFileData, // URL for avatar upload
      };
      updateProfile(payload);
    }
  }, [uploadedFileData]);

  const fetchData = () => {
    UserApiService.userDetails(userId)
      .then((response) => {
        setSnackData({
          show: true,
          message: response?.message || API_SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY,
          type: "success",
        });
        setProfileData(response?.data?.details[0]);
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

  const updateProfile = (payload) => {
    UserApiService.userUpdate(payload)
      .then((response) => {
        setSnackData({
          show: true,
          message: response?.message || API_SUCCESS_MESSAGE.DETAILS_UPDATED,
          type: "success",
        });
        fetchData(); // Refresh data after update
      })
      .catch((errResponse) => {
        setSnackData({
          show: true,
          message: errResponse?.error?.message || API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
          type: "error",
        });
      });
  };

  return (
    <Spin tip="Loading" size="large" spinning={loading}>
      <Row justify="center" style={{ padding: "20px" }}>
        <Col>
          <Card
            title="Profile Details"
            style={{ width: "100%" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <AvatarUpload onUpload={setUploadedFileData} uploadedImage={profileData?.user_profile || ""}/>
       
              {/* {profileData?.user_profile ? (
                <Avatar size={100} src={profileData?.user_profile} />
              ) : (
                <AvatarUpload onUpload={setUploadedFileData} uploadedImage={profileData?.user_profile}/>
              )} */}
            </div>

            {/* Personal Details Section */}
            <Card title="Personal Details" bordered={false}>
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Full Name">
                  {profileData?.user_first_name} {profileData?.user_last_name}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {profileData?.user_email}
                </Descriptions.Item>
                <Descriptions.Item label="Phone Number">
                  {profileData?.user_phone_no}
                </Descriptions.Item>
                {userRole !== "Super Admin" ? (
                  <Descriptions.Item label="Address">
                    {profileData?.user_address?.street},{" "}
                    {profileData?.user_address?.city},{" "}
                    {profileData?.user_address?.state} -{" "}
                    {profileData?.user_address?.zip}
                  </Descriptions.Item>
                ) : (
                  <Descriptions.Item label="Role">
                    {profileData?.role_name}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {userRole !== "Super Admin" && (
              <>
                <Divider />
                {/* Organization Details Section */}
                <Card title="Organization Details" bordered={false}>
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label="Organization">
                      {profileData?.org_name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Industry">
                      {profileData?.industry_name}
                    </Descriptions.Item>
                    {/* <Descriptions.Item label="Sector">
                      {profileData?.sector_name}
                    </Descriptions.Item> */}
                    <Descriptions.Item label="Role">
                      {profileData?.role_name}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </>
            )}
          </Card>
        </Col>
      </Row>

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
  );
};

export default ProfileDetails;
