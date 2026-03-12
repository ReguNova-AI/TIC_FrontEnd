import React, { useCallback, useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { useSpring, animated } from "react-spring"; // For animations
import { API_ERROR_MESSAGE } from "shared/constants";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useChatHistory, useChatMutation } from "./useProjectQueries";
import { useQueryClient } from "@tanstack/react-query";
import { PROJECT_QUERY_KEYS } from "./useProjectQueries";

const ChatAIView = ({ data, projectId, isQuestionActive, setIsQuestionActive }) => {

  const [query, setQuery] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [response, setResponse] = useState();
  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });

  // Get query client for manual cache invalidation
  const queryClient = useQueryClient();

  // Use React Query hook to fetch chat history
  const {
    data: chatHistoryData,
    isLoading: isLoadingHistory,
  } = useChatHistory(projectId);

  // Use React Query mutation for chat operations
  const chatMutation = useChatMutation(projectId);

  // Use chatHistoryData directly or fallback to provided data
  const history = chatHistoryData ?? [];

  // Spring animation for the response text
  const animationProps = useSpring({
    opacity: currentQuestion ? 1 : 0,
    transform: currentQuestion ? "translateY(0)" : "translateY(10px)",
    config: { tension: 100, friction: 10 },
  });

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    try {
      // Set question active state
      setIsQuestionActive(true);

      // Store the current question before any operations
      const questionToAsk = query;

      // Clear current response and prepare for new question
      if (currentQuestion || response) {
        setResponse(""); // Clear only response first

        // Silently refetch chat history without showing loading indicator
        queryClient.invalidateQueries({
          queryKey: PROJECT_QUERY_KEYS.chatHistory(projectId),
          refetchType: 'none', // Don't trigger a refetch immediately
        });

        // Manually refetch in background
        queryClient.refetchQueries({
          queryKey: PROJECT_QUERY_KEYS.chatHistory(projectId),
          type: 'active',
        });
      }

      // Set the new question immediately
      setCurrentQuestion(questionToAsk);

      // Clear the query input immediately
      setQuery("");

      // Make the API call
      const apiResponse = await chatMutation.mutateAsync({ query: questionToAsk });

      // Set the current response for immediate display
      setResponse(apiResponse.data?.output_text);

      // Reset question active state
      setIsQuestionActive(false);

      // Note: React Query will automatically invalidate and refetch chat history

    } catch (errResponse) {
      console.error("Error fetching data:", errResponse);

      // Reset question active state on error
      setIsQuestionActive(false);

      const apiMessage =
        errResponse?.response?.data?.message ||
        errResponse?.message ||
        API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR;

      setSnackData({
        show: true,
        message: apiMessage,
        type: "error",
      });
    }
  }, [query, chatMutation, currentQuestion, response, queryClient, projectId]);

  const handleKeyDown = (e) => {
    if(isQuestionActive) return;
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Box sx={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      textAlign: "center"
    }}>
      {/* Input and Search Button in same row */}
      <Box sx={{ display: "flex", paddingTop: 2, gap: 2, marginBottom: 2, alignItems: "center", flexShrink: 0 }}>
        <TextField
          label="Ask something"
          variant="outlined"
          fullWidth
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          disabled={isQuestionActive}
          sx={{ minWidth: "80px", height: "36px" }}
        >
          {isQuestionActive ? <CircularProgress size={24} color="inherit" /> : "Ask"}
        </Button>
      </Box>

      {/* Animation for the current question and response */}
      <Box sx={{ flexShrink: 0 }}>
        <animated.div style={animationProps}>
          {currentQuestion && (
            <Box sx={{ marginTop: 2, textAlign: "left" }}>
              {/* Display the current question */}
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "bold",
                  marginBottom: 1,
                  padding: 2,
                  backgroundColor: "primary.main",
                  color:"primary.contrastText",
                  borderRadius: 2,
                }}
              >
                Q: {currentQuestion}
              </Typography>

              {/* Display the current response or loading state */}
              {isQuestionActive ? (
                <Box sx={{ padding: 2, display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" sx={{ fontStyle: "italic", color: "text.secondary" }}>
                    Thinking...
                  </Typography>
                </Box>
              ) : (
                response && (
                  <Typography
                    variant="body1"
                    sx={{
                      padding: 2,
                      backgroundColor: "#f0f0f0",
                      borderRadius: 2,
                    }}
                  >
                    A: {response}
                  </Typography>
                )
              )}
            </Box>
          )}
        </animated.div>
      </Box>

      {/* Render the history of questions and responses */}
      <Box
        sx={{

          textAlign: "left",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0, // This is crucial for flex children to shrink
        }}
      >
        <Typography variant="h6" sx={{ marginBottom: 2, flexShrink: 0, color:"primary.main" }}>
          Previously Asked Questions
        </Typography>

        {isLoadingHistory ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
            <CircularProgress size={24} />
            <Typography sx={{ ml: 2 }}>Loading chat history...</Typography>
          </Box>
        ) : (
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              paddingRight: "10px", // Space for scrollbar
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              padding: 2,
              backgroundColor: "secondary.100",
              minHeight: 0, // Important for scrolling
              // Ensure smooth scrolling
              scrollBehavior: "smooth",
              // Add custom scrollbar styling
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "#f1f1f1",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#c1c1c1",
                borderRadius: "4px",
                "&:hover": {
                  backgroundColor: "#a8a8a8",
                },
              },
            }}
          >
            {history.length > 0 ? (
              [...history].reverse().map((entry, index) => (
                <Box
                  key={index}
                  sx={{
                    marginBottom: 2,
                    padding: 2,
                    backgroundColor: "#f9f9f9",
                    borderRadius: 2,
                    border: "1px solid #e0e0e0",
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: "bold", color:"primary.main" }}>
                    Q: {entry.question}
                  </Typography>
                  <Typography variant="body1">A: {entry.answer}</Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" sx={{ color: "#666", fontStyle: "italic", textAlign: "center", py: 2 }}>
                No questions asked yet. Start by asking something above!
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Snackbar for displaying messages */}
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
    </Box>
  );
};

export default ChatAIView;
