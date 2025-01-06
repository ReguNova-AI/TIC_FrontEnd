import React, { useState } from 'react';
import { Box, TextField, Button, CircularProgress, Typography } from '@mui/material';
import axios from 'axios';
import { useSpring, animated } from 'react-spring'; // For animations

const ChatAIView = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  
  // Spring animation for the response text
  const animationProps = useSpring({
    opacity: response ? 1 : 0,
    transform: response ? 'translateY(0)' : 'translateY(10px)',
    config: { tension: 200, friction: 20 }
  });

  const handleSearch = async () => {
    if (!query) return;

    setLoading(true);
    try {
      // Make API call (Replace URL with your actual API endpoint)
      const res = await axios.post('https://your-api-endpoint.com/query', { query });
      setResponse(res.data.answer);
    } catch (error) {
      console.error('Error fetching data:', error);
      setResponse('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
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
    </Box>
  );
};

export default ChatAIView;
