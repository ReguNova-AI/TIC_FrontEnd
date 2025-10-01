import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

const ScrollableContainer = ({ 
  children, 
  maxHeight = '100%', 
  padding = 3,
  showScrollbar = true,
  ...props 
}) => {
  return (
    <Box
      sx={{
        maxHeight,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding,
        ...(showScrollbar && {
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#c1c1c1',
            borderRadius: '4px',
            '&:hover': {
              background: '#a8a8a8',
            },
          },
        }),
        ...props.sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

ScrollableContainer.propTypes = {
  children: PropTypes.node.isRequired,
  maxHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  padding: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  showScrollbar: PropTypes.bool,
  sx: PropTypes.object,
};

export default ScrollableContainer;