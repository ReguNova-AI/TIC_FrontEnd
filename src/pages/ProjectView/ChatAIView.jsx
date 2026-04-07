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

// AI bubble — left side, white box with top-left notch
const AIBubble = ({ text, isThinking = false, timestamp }) => (
  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", mb: 3, maxWidth: "85%", position: "relative" }}>
    <Box
      sx={{
        position: "relative",
        bgcolor: "#FFF",
        borderRadius: "12px",
        border: "1px solid #EAEAEA",
        px: 2.5,
        py: 2,
        fontSize: "14px",
        lineHeight: 1.6,
        color: "#333",
        wordBreak: "break-word",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        // Speech notch (top-left)
        "&::before": {
          content: '""',
          position: "absolute",
          top: "-10px",
          left: "10px",
          width: 0,
          height: 0,
          borderStyle: "solid",
          borderWidth: "0 10px 10px 0",
          borderColor: "transparent #EAEAEA transparent transparent",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          top: "-8px",
          left: "11px",
          width: 0,
          height: 0,
          borderStyle: "solid",
          borderWidth: "0 10px 10px 0",
          borderColor: "transparent #FFF transparent transparent",
        },
      }}
    >
      {isThinking ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.5 }}>
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5, times: [0, 0.5, 1] }}
          >
            <CircularProgress size={16} sx={{ color: "#5B0429" }} />
          </motion.div>
          <Typography sx={{ fontStyle: "italic", color: "#888", fontSize: "14px", fontWeight: 500 }}>
            Thinking...
          </Typography>
        </Box>
      ) : (
        text
      )}
    </Box>
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", mt: 1, px: 0.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
        <AutoAwesomeIcon sx={{ fontSize: "14px", color: "#5B0429" }} />
        <Typography sx={{ fontSize: "12px", color: "#5B0429", fontWeight: 700 }}>AI</Typography>
      </Box>
      <Typography sx={{ fontSize: "12px", color: "#999", fontWeight: 500 }}>
        {isThinking ? "Just now" : (timestamp || "Just now")}
      </Typography>
    </Box>
  </Box>
);

// User bubble — right side, maroon box with top-right notch
const UserBubble = ({ text }) => (
  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", mb: 3, ml: "auto", maxWidth: "85%", position: "relative" }}>
    <Box
      sx={{
        position: "relative",
        bgcolor: "#5B0429",
        borderRadius: "12px",
        px: 2.5,
        py: 2,
        fontSize: "14px",
        lineHeight: 1.6,
        color: "#fff",
        wordBreak: "break-word",
        boxShadow: "0 4px 15px rgba(91,4,41,0.15)",
        // Speech notch (top-right)
        "&::after": {
          content: '""',
          position: "absolute",
          top: "-10px",
          right: "10px",
          width: 0,
          height: 0,
          borderStyle: "solid",
          borderWidth: "0 0 10px 10px",
          borderColor: "transparent transparent #5B0429 transparent",
        },
      }}
    >
      {text}
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

  // Sort history Reverse Chronologically (Newest Top, Older Bottom)
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
        return timeB - timeA; // Newest first
      });
    }

    // Default to newest-first.
    return raw;
  }, [chatHistoryData]);

  // Auto-scroll to top when a new question is asked
  const scrollContainerRef = useRef(null);
  
  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (currentQuestion) {
      scrollToTop();
    }
  }, [currentQuestion, response]);

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
        // Refetch one last time to ensure history is updated
        queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.chatHistory(projectId) });
      }, 800);
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
      <Typography sx={{ fontWeight: 700, fontSize: '20px', color: '#333', mb: 3 }}>
        Project Report
      </Typography>
      {/* ── Input row ── */}
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          pb: 3,
          flexShrink: 0,
          alignItems: "center",
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
              borderRadius: "4px",
              fontSize: "14px",
              bgcolor: "#fff",
              "& fieldset": { borderColor: "#ddd" },
              "&.Mui-focused fieldset": { borderColor: "#5B0429" },
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={isQuestionActive || !query.trim()}
          sx={{
            minWidth: "90px",
            height: "40px",
            borderRadius: "40px", // pill shape
            textTransform: "none",
            fontWeight: 700,
            fontSize: "14px",
            bgcolor: "#5B0429",
            boxShadow: "none",
            flexShrink: 0,
            "&:hover": { bgcolor: "#4a0322", boxShadow: "none" },
            "&.Mui-disabled": { bgcolor: "#f0f0f0", color: "#aaa" },
          }}
        >
          {isQuestionActive ? <CircularProgress size={18} color="inherit" /> : "Ask"}
        </Button>
      </Box>

      {/* ── Chat area container with frame ── */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          border: "1px solid #EAEAEA",
          borderRadius: "4px",
          bgcolor: "#fff",
          minHeight: 0,
          overflow: "hidden"
        }}
      >

      {/* ── Chat area ── */}
      <Box
        ref={scrollContainerRef}
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 2,
          pt: 3, // Increased padding
          pb: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1, // Add vertical gap between elements
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-thumb": { background: "#ddd", borderRadius: "6px" },
        }}
      >
        {/* Scroll anchor at the very top (optional with scrollContainerRef) */}
        <div ref={messagesEndRef} style={{ height: 0 }} />

        {/* Current live question + response — now at the top */}
        <motion.div
          animate={{ opacity: currentQuestion ? 1 : 0, y: currentQuestion ? 0 : 10 }}
          transition={springTransition}
        >
          {currentQuestion && (
            <Box>
              {isQuestionActive && <AIBubble isThinking />}
              <UserBubble text={currentQuestion} />
              {!isQuestionActive && response && <AIBubble text={response} />}
            </Box>
          )}
        </motion.div>

        {/* History — newest first */}
        {isLoadingHistory ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4, gap: 1 }}>
            <CircularProgress size={20} />
            <Typography sx={{ color: "#888", fontSize: "14px" }}>Loading history...</Typography>
          </Box>
        ) : (
          history.map((entry, index) => {
            const dateStr = entry.date || entry.created_at || entry.timestamp;
            const timeLabel = dateStr 
              ? new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
              : "Just now";

            return (
              <Box key={`history-${index}`}>
                <UserBubble text={entry.question} />
                <AIBubble text={entry.answer} timestamp={timeLabel} />
              </Box>
            );
          })
        )}

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
