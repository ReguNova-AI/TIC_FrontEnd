import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, Divider } from '@mui/material';
import { DownOutlined } from '@ant-design/icons';
import TimelineView from './TimelineView';

const timelineData = [
  { date: "2024-12-01", title: "System Update", details: "The control system was updated to the latest version to enhance safety features and improve reliability." },
  { date: "2024-11-15", title: "Safety Review", details: "A comprehensive safety review was conducted, addressing potential vulnerabilities and making adjustments to protocols." },
  { date: "2024-10-10", title: "Annual Maintenance", details: "Annual maintenance was performed on the turbine, ensuring all components are operating within safe parameters." },
  { date: "2024-09-01", title: "Firmware Upgrade", details: "A firmware upgrade was completed to fix bugs and optimize performance." },
  { date: "2024-08-15", title: "Safety Incident Report", details: "A safety incident was reported involving a minor malfunction in the braking system. The issue was resolved promptly." }
];

const HistoryDetails = () => {
  return (
    <Box sx={{ width: '100%', marginTop: 2 }}>
      {/* Iterate over the timeline data */}
      {timelineData.map((item, index) => (
        <div key={index} style={{ marginBottom: "15px", position: 'relative', paddingLeft: '40px' }}>
          {/* Vertical Line to connect the timeline events */}
          {index > 0 && (
            <div
              style={{
                position: 'absolute',
                left: '10px',
                top: '0',
                width: '2px',
                height: '100%',
                backgroundColor: '#ddd',
              }}
            />
          )}

          {/* Accordion Component for each timeline event */}
          <Accordion>
            <AccordionSummary
              expandIcon={<DownOutlined />}
              aria-controls={`panel${index}-content`}
              id={`panel${index}-header`}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Typography variant="h6" sx={{ flex: 1 }}>
                  {`${item.date}`}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
             <TimelineView /> 
            </AccordionDetails>
          </Accordion>
        </div>
      ))}
    </Box>
  );
};

export default HistoryDetails;
