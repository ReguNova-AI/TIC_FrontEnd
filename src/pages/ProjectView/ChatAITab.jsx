import React from "react";
import { Box } from "@mui/material";
import { Result } from "antd";
import PropTypes from "prop-types";
import ChatAIView from "./ChatAIView";
import chatLoadingicon2 from "../../assets/images/icons/chatLoadingIcon2.svg";

const ChatAITab = ({
  chatLoading,
  handleChatUpdate,
  projectData,
  chatResponse,
}) => {
  return (
    <Box
      sx={{
        boxShadow: "0px 0px 41px #e4e4e4",
        padding: "20px",
        borderRadius: "10px",
        border: "1px solid #e4e4e4",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {chatLoading ? (
        <Result
          icon={<img src={chatLoadingicon2} width={"20%"} alt="Loading" />}
          subTitle="Please upload the project documents to enable chat functionality."
        />
      ) : (
        <Box sx={{ flex: 1, overflow: "hidden" }}>
          <ChatAIView
            onSubmit={(e) => handleChatUpdate(e)}
            data={projectData?.chatResponse?.data}
            projectId={projectData?.project_id}
            responseValue={chatResponse}
          />
        </Box>
      )}
    </Box>
  );
};

ChatAITab.propTypes = {
  chatLoading: PropTypes.bool.isRequired,
  handleChatUpdate: PropTypes.func.isRequired,
  projectData: PropTypes.object.isRequired,
  chatResponse: PropTypes.string,
};

export default ChatAITab;