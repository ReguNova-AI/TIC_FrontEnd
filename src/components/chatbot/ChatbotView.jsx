import * as React from 'react';
import Box from '@mui/material/Box';
import Popper from '@mui/material/Popper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import { Fab } from '@mui/material';
import { MessageOutlined } from '@ant-design/icons';
import Message from './Message'; 


export default function ChatBotView() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [placement, setPlacement] = React.useState();

  const handleClick = (newPlacement) => (event) => {
    setAnchorEl(event.currentTarget);
    setOpen((prev) => placement !== newPlacement || !prev);
    setPlacement(newPlacement);
  };

  // Close Popper when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside of the Popper and the Fab button
      if (anchorEl && !anchorEl.contains(event.target) && !event.target.closest('.fab-button')) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [anchorEl]);

  return (
    <Box sx={{ width: 500 }}>
      <Popper
        sx={{ zIndex: 1200,width:500,minHeight:300 }}
        open={open}
        anchorEl={anchorEl}
        placement={placement}
        transition
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
           <Paper sx={{ p: 1, minHeight:300,borderRadius:8 }}>
              <Message/>
              
            </Paper>
          </Fade>
        )}
      </Popper>

      <Fab
        className="fab-button"
        color="primary"
        aria-label="chatbot"
        onClick={handleClick('top-end')}
      >
        <MessageOutlined />
      </Fab>
    </Box>
  );
}
