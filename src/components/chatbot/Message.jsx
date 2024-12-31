import React, { useState } from "react";
import { Box, TextField, IconButton, Typography, Avatar, Paper, Container, Stack } from "@mui/material";
import { styled } from "@mui/system";
import { SendOutlined } from "@ant-design/icons";

const ChatContainer = styled(Box)(({ theme }) => ({
  height: "80vh",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "#f5f5f5",
  borderRadius: "12px",
  overflow: "hidden"
}));

const MessagesArea = styled(Box)({
  flex: 1,
  overflowY: "auto",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "16px"
});

const MessageBubble = styled(Paper)(({ isOwn }) => ({
  padding: "12px 16px",
  maxWidth: "70%",
  width: "fit-content",
  borderRadius: "12px",
  backgroundColor: isOwn ? "#1976d2" : "#ffffff",
  color: isOwn ? "#ffffff" : "#000000",
  alignSelf: isOwn ? "flex-end" : "flex-start",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
}));

const InputArea = styled(Box)({
  padding: "20px",
  backgroundColor: "#ffffff",
  borderTop: "1px solid #e0e0e0"
});

const dummyMessages = [
  {
    id: 1,
    sender: "Alice Chen",
    avatar: "images.unsplash.com/photo-1494790108377-be9c29b29330",
    message: "Hey team! I've finished setting up the development environment for our website deployment.",
    timestamp: "10:30 AM",
    isOwn: false
  },
  {
    id: 2,
    sender: "Bob Smith",
    avatar: "images.unsplash.com/photo-1527980965255-d3b416303d12",
    message: "Great work! Did you configure the CI/CD pipeline as discussed?",
    timestamp: "10:32 AM",
    isOwn: true
  },
  {
    id: 3,
    sender: "Carol Johnson",
    avatar: "images.unsplash.com/photo-1438761681033-6461ffad8d80",
    message: "I can help with the deployment scripts if needed.",
    timestamp: "10:35 AM",
    isOwn: false
  },
  {
    id: 4,
    sender: "David Wilson",
    avatar: "images.unsplash.com/photo-1500648767791-00dcc994a43e",
    message: "Let's make sure we have all the environment variables properly set before proceeding.",
    timestamp: "10:38 AM",
    isOwn: false
  }
];

const Message = () => {
  const [messages, setMessages] = useState(dummyMessages);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        sender: "Bob Smith",
        avatar: "images.unsplash.com/photo-1527980965255-d3b416303d12",
        message: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isOwn: true
      };
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  return (
    <Container maxWidth="md">
      <ChatContainer>
        <MessagesArea>
          {messages.map((msg) => (
            <Box key={msg.id} sx={{ display: "flex", flexDirection: "column", alignItems: msg.isOwn ? "flex-end" : "flex-start" }}>
              <Stack
                direction={msg.isOwn ? "row-reverse" : "row"}
                spacing={1}
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Avatar
                  src={`https://${msg.avatar}`}
                  alt={msg.sender}
                  sx={{ width: 32, height: 32 }}
                />
                <Typography variant="subtitle2" color="text.secondary">
                  {msg.sender}
                </Typography>
              </Stack>
              <MessageBubble isOwn={msg.isOwn}>
                <Typography variant="body1">{msg.message}</Typography>
                <Typography variant="caption" color={msg.isOwn ? "rgba(255,255,255,0.7)" : "text.secondary"}>
                  {msg.timestamp}
                </Typography>
              </MessageBubble>
            </Box>
          ))}
        </MessagesArea>
        <InputArea>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              size="small"
            />
            <IconButton
              color="primary"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <SendOutlined />
            </IconButton>
          </Box>
        </InputArea>
      </ChatContainer>
    </Container>
  );
};

export default Message;