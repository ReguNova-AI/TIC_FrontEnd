import React from 'react';
import { Steps } from 'antd';
import { STEPPER_LABEL } from 'shared/constants';
import { formatDate } from 'shared/utility';
// import "./style.css";
const description = 'This is a description.';
const RecentHistory = ({data}) => (
  <Steps
    direction="vertical"
    size="small"
    current={4}
    // status="error"
    items={[
      {
        title: <span style={{ fontSize: '12px',fontWeight:"600" }}>{STEPPER_LABEL.PROJECT_CREATION}</span>,
        description:<span style={{ fontSize: '11px' }}>Created on {formatDate(data.created_at)}</span>,
        status: `${STEPPER_LABEL.FINISH_STATUS}`, 
      },
      {
        title: <span style={{ fontSize: '12px',fontWeight:"600" }}>{STEPPER_LABEL.IN_PROGRESS}</span>,
        description: <span style={{ fontSize: '11px' }}>last run on {formatDate(data.last_run)}</span>,
        status: `${STEPPER_LABEL.FINISH_STATUS}`, 
      },
      {
        title: <span style={{ fontSize: '12px',fontWeight:"600" }}>{STEPPER_LABEL.CHECKLIST_REPORT}</span>,
        description: <span style={{ fontSize: '11px' }}>created on 9th Dec 2024</span>,
        status: `${STEPPER_LABEL.FINISH_STATUS}`, 
      },
      {
        title: <span style={{ fontSize: '12px',fontWeight:"600" }}>{STEPPER_LABEL.ASSESSMENT_REPORT}</span>,
        description:<span style={{ fontSize: '11px' }}>Created on 9th Dec 2024</span>,
        status: `${STEPPER_LABEL.FINISH_STATUS}`, 
      },
      {
        title:<span style={{ fontSize: '12px',fontWeight:"600" }}>{STEPPER_LABEL.FINAL_STEP}</span>,
        status: `${STEPPER_LABEL.PROCESS_STATUS}`, 
        // description,
      }
    ]}
  />
);
export default RecentHistory;