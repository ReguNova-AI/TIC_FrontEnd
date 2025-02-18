import * as React from 'react';
import PropTypes from 'prop-types';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

function LinearProgressWithLabel(props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {`${Math.round(props.value)}%`}
        </Typography>
      </Box>
    </Box>
  );
}

LinearProgressWithLabel.propTypes = {
  /**
   * The value of the progress indicator for the determinate and buffer variants.
   * Value between 0 and 100.
   */
  value: PropTypes.number.isRequired,
};

export default function ProgressBarView() {
  const [progress, setProgress] = React.useState(10);
  const [messageIndex, setMessageIndex] = React.useState(0);
  const messages = [
    "We have initialized the process...",
    "Please wait while we process the data...",
    "Data analysis is in progress...",
    "Finalizing the data process...",
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => (prevProgress >= 100 ? 10 : prevProgress == 70 ? prevProgress : prevProgress+ 10));
        setMessageIndex((prevIndex) => {
          // Loop back to the first message when it reaches the end
          return (prevIndex + 1) % messages.length;
        });
       // Cleanup interval when the component unmounts
    
    }, 5000);
    return () => {
      clearInterval(timer);
      return () => clearInterval(messageInterval);
    };
  }, []);

  return (
    <Box sx={{ width: '100%',marginTop:"10px"}} style={{justifyItems:"center"}}>
      <Typography>{messages[messageIndex]}</Typography>

      {/* <LinearProgressWithLabel value={progress} /> */}
    </Box>
  );
}
