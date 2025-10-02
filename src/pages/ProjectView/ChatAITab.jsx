import React from "react";
import { Box } from "@mui/material";
import { Result } from "antd";
import PropTypes from "prop-types";
import ChatAIView from "./ChatAIView";
import chatLoadingicon2 from "../../assets/images/icons/chatLoadingIcon2.svg";

const ChatAITab = ({
  chatLoading,

  projectData,

}) => {
  return (
    <Box
      sx={{


        borderRadius: "10px",

        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {chatLoading ? (
        <Result
          icon={<img src={chatLoadingicon2} width={"20%"} alt="Loading" />}
          subTitle="Please upload the project documents to enable chat functionality."
        />
      ) : (
        <Box sx={{ flex: 1, overflow: "auto", minHeight: 0 }}>
          <ChatAIView

            data={projectData?.chatResponse?.data}
            projectId={projectData?.project_id}

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