import React, { useCallback, useState, useRef, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import { API_ERROR_MESSAGE } from "shared/constants";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useChatHistory, useChatMutation } from "./useProjectQueries";
import { useQueryClient } from "@tanstack/react-query";
import { PROJECT_QUERY_KEYS } from "./useProjectQueries";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

// Spring animation config
const springTransition = { type: "spring", stiffness: 100, damping: 10 };

// AI bubble — left side, gray
const AIBubble = ({ text, isThinking = false }) => (
  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", mb: 3, maxWidth: "85%" }}>
    <Box
      sx={{
        position: "relative",
        bgcolor: "#F5F5F5",
        borderRadius: "8px",
        px: 2.5,
        py: 2,
        fontSize: "14px",
        lineHeight: 1.6,
        color: "#222",
        wordBreak: "break-word",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        // Speech bubble triangular notch (left)
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: "100%",
          left: "12px",
          width: 0,
          height: 0,
          borderStyle: "solid",
          borderWidth: "0 0 10px 10px",
          borderColor: "transparent transparent #F5F5F5 transparent",
          transform: "translateY(1px)"
        },
      }}
    >
      {isThinking ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography sx={{ fontStyle: "italic", color: "#888", fontSize: "14px" }}>Thinking...</Typography>
        </Box>
      ) : (
        text
      )}
    </Box>
    {/* AI label */}
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 1, ml: 0.5 }}>
      <AutoAwesomeIcon sx={{ fontSize: "14px", color: "#5B0429" }} />
      <Typography sx={{ fontSize: "12px", color: "#666", fontWeight: 700 }}>AI</Typography>
    </Box>
  </Box>
);

// User bubble — right side, maroon
const UserBubble = ({ text, timestamp = "Just now" }) => (
  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", mb: 3, ml: "auto", maxWidth: "85%" }}>
    <Box
      sx={{
        position: "relative",
        bgcolor: "#5B0429",
        borderRadius: "8px",
        px: 2.5,
        py: 2,
        fontSize: "14px",
        lineHeight: 1.6,
        color: "#fff",
        wordBreak: "break-word",
        boxShadow: "0 4px 12px rgba(91,4,41,0.15)",
        // Speech bubble triangular notch (right)
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: "100%",
          right: "12px",
          width: 0,
          height: 0,
          borderStyle: "solid",
          borderWidth: "0 10px 10px 0",
          borderColor: "transparent #5B0429 transparent transparent",
          transform: "translateY(1px)"
        },
      }}
    >
      {text}
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mr: 0.5 }}>
      <Typography sx={{ fontSize: "12px", color: "#999", fontWeight: 500 }}>{timestamp}</Typography>
    </Box>
  </Box>
);

const ChatAIView = ({ data, projectId, isQuestionActive, setIsQuestionActive }) => {
  const [query, setQuery] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [response, setResponse] = useState();
  const [snackData, setSnackData] = useState({ show: false, message: "", type: "error" });
  
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: chatHistoryData, isLoading: isLoadingHistory } = useChatHistory(projectId);
  const chatMutation = useChatMutation(projectId);

  // Sort history Chronologically (Older Top, Newer Bottom)
  const history = useMemo(() => {
    if (!chatHistoryData) return [];
    // Copy and search for date-like fields
    const raw = [...chatHistoryData];
    
    // Check if we have consistent date fields
    const hasDates = raw.some(item => item.date || item.created_at || item.timestamp);
    
    if (hasDates) {
      return raw.sort((a, b) => {
        const timeA = new Date(a.date || a.created_at || a.timestamp || 0).getTime();
        const timeB = new Date(b.date || b.created_at || b.timestamp || 0).getTime();
        return timeA - timeB;
      });
    }

    // Default to oldest-first. If the API returns newest-first (common), 
    // reversing it will provide the correct Chronological order.
    return raw.reverse();
  }, [chatHistoryData]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history.length, currentQuestion, response]);

  const handleSearch = useCallback(async () => {
    if (!query.trim() || isQuestionActive) return;

    try {
      setIsQuestionActive(true);
      const questionToAsk = query;

      if (currentQuestion || response) {
        setResponse("");
        queryClient.refetchQueries({ queryKey: PROJECT_QUERY_KEYS.chatHistory(projectId), type: "active" });
      }

      setCurrentQuestion(questionToAsk);
      setQuery("");

      const apiResponse = await chatMutation.mutateAsync({ query: questionToAsk });
      // Support both v2 (output_text) and v3 (answer/response) mapping
      const aiAnswer = apiResponse.data?.answer || apiResponse.data?.output_text || apiResponse.data?.response;
      setResponse(aiAnswer);
      
      // Clear current states after a short delay to allow the history refetch to land smoothly
      setTimeout(() => {
        setIsQuestionActive(false);
        setCurrentQuestion("");
        setResponse("");
      }, 300);
    } catch (errResponse) {
      setIsQuestionActive(false);
      setSnackData({
        show: true,
        message: errResponse?.response?.data?.message || errResponse?.message || API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
        type: "error",
      });
    }
  }, [query, chatMutation, queryClient, projectId, isQuestionActive, setIsQuestionActive]);

  const handleKeyDown = (e) => {
    if (isQuestionActive) return;
    if (e.key === "Enter") handleSearch();
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        p: 2
      }}
    >
      <Typography sx={{ fontWeight: 700, fontSize: '18px', color: '#1a1a1a', mb: 2, px: 1 }}>
        Project Report
      </Typography>
      {/* ── Input row ── */}
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          pt: 2,
          pb: 1.5,
          px: 1,
          flexShrink: 0,
          alignItems: "center",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <TextField
          placeholder="Ask something...."
          variant="outlined"
          fullWidth
          size="small"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isQuestionActive}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "24px",
              fontSize: "14px",
              bgcolor: "#fafafa",
              "&.Mui-focused fieldset": { borderColor: "#5B0429" },
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={isQuestionActive || !query.trim()}
          sx={{
            minWidth: "72px",
            height: "38px",
            borderRadius: "24px",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "14px",
            bgcolor: "#5B0429",
            boxShadow: "none",
            flexShrink: 0,
            "&:hover": { bgcolor: "#4a0322", boxShadow: "none" },
            "&.Mui-disabled": { bgcolor: "#e0e0e0", color: "#aaa" },
          }}
        >
          {isQuestionActive ? <CircularProgress size={18} color="inherit" /> : "Ask"}
        </Button>
      </Box>

      {/* ── Chat area ── */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 2,
          pt: 2,
          pb: 2,
          display: "flex",
          flexDirection: "column",
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-thumb": { background: "#ddd", borderRadius: "6px" },
        }}
      >
        {/* History — oldest first */}
        {isLoadingHistory ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4, gap: 1 }}>
            <CircularProgress size={20} />
            <Typography sx={{ color: "#888", fontSize: "14px" }}>Loading history...</Typography>
          </Box>
        ) : (
          history.map((entry, index) => (
            <Box key={`history-${index}`}>
              <UserBubble 
                text={entry.question} 
                timestamp={entry.date || entry.created_at || entry.timestamp ? new Date(entry.date || entry.created_at || entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"} 
              />
              <AIBubble text={entry.answer} />
            </Box>
          ))
        )}

        {/* Current live question + response */}
        <motion.div
          animate={{ opacity: currentQuestion ? 1 : 0, y: currentQuestion ? 0 : 10 }}
          transition={springTransition}
        >
          {currentQuestion && (
            <Box>
              <UserBubble text={currentQuestion} />
              {isQuestionActive ? (
                <AIBubble isThinking />
              ) : (
                response && <AIBubble text={response} />
              )}
            </Box>
          )}
          <div ref={messagesEndRef} />
        </motion.div>

        {/* Empty state */}
        {!isLoadingHistory && history.length === 0 && !currentQuestion && (
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 6, gap: 1 }}>
            <AutoAwesomeIcon sx={{ fontSize: "36px", color: "#e0e0e0" }} />
            <Typography sx={{ color: "#bbb", fontSize: "14px", fontStyle: "italic" }}>
              No questions yet. Ask something above!
            </Typography>
          </Box>
        )}
      </Box>

      <Snackbar
        style={{ top: "80px" }}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={snackData.show}
        autoHideDuration={3000}
        onClose={() => setSnackData({ show: false })}
      >
        <Alert onClose={() => setSnackData({ show: false })} severity={snackData.type}>
          {snackData.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ChatAIView;
