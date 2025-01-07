import React, { useCallback, useState } from 'react';
import { Box, TextField, Button, CircularProgress, Typography } from '@mui/material';
import axios from 'axios';
import { useSpring, animated } from 'react-spring'; // For animations
import { API_ERROR_MESSAGE, API_SUCCESS_MESSAGE } from 'shared/constants';
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { ProjectApiService } from 'services/api/ProjectAPIService';

const ChatAIView = ({data,onSubmit,responseValue}) => {
  
  if(responseValue.length === 0)
  {
    responseValue = ""
  }
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(responseValue || '');
  const [history, setHistory] = useState(data || []);  // State to store history of questions and responses
  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });

  // Spring animation for the response text
  const animationProps = useSpring({
    opacity: response ? 1 : 0,
    transform: response ? 'translateY(0)' : 'translateY(10px)',
    config: { tension: 100, friction: 10 }
  });

  const handleSearch = useCallback(async () => {
    if (!query) return;
  
    setLoading(true);
    try {
      const response = await ProjectApiService.projectChat(query);
      const newHistory = { question: query, answer: response.data.details.data.output_text };
      setHistory(prevHistory => [...prevHistory, newHistory]);
      setResponse(response.data.details.data.output_text);
      console.log("data",[...history, newHistory])
      
      onSubmit([...history, newHistory]);
    } catch (errResponse) {
      // Handle error
    } finally {
      setLoading(false);
    }
  }, [query, history, onSubmit]);
  

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box sx={{ width: '100%', marginTop: 2, padding: 2, textAlign: 'center' }}>
      <TextField
        label="Ask something"
        variant="outlined"
        fullWidth
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown} // Add the keydown event here
        sx={{ marginBottom: 2 }}
      />
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleSearch} 
        sx={{ marginBottom: 2 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Search'}
      </Button>

      {/* Animation for the response */}
      <animated.div style={animationProps}>
        {response && <Typography variant="body1" sx={{ marginTop: 2, padding: 2, backgroundColor: '#f0f0f0', borderRadius: 2 }}>
          {response}
        </Typography>}
      </animated.div>

      {/* Render the history of questions and responses */}
      <Box
        sx={{
          marginTop: 3,
          textAlign: 'left',
          paddingRight: '10px',  // Space for scrollbar
        }}
      >
        <Typography variant="h6" sx={{ marginBottom: 1 }}>
  {history.length > 0 && `Previously Asked ${history.length === 1 ? 'Question' : 'Questions'}`}
</Typography>
        <Box
          sx={{
            marginTop: 3,
            textAlign: 'left',
            maxHeight: '600px',
            overflowY: 'auto',
            paddingRight: '10px',  // Space for scrollbar
          }}
        >
          {history.map((entry, index) => (
            <Box key={index} sx={{ marginBottom: 2, padding: 2, backgroundColor: '#f9f9f9', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Q: {entry.question}</Typography>
              <Typography variant="body1">A: {entry.answer}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Snackbar for displaying messages */}
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
    </Box>
  );
};

export default ChatAIView;
