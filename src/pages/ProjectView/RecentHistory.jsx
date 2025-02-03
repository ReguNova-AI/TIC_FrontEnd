import React from 'react';
import { Steps } from 'antd';
import { FORM_LABEL, STEPPER_LABEL } from 'shared/constants';
import { formatDate } from 'shared/utility';
// import "./style.css";
const description = 'This is a description.';
const RecentHistory = ({data}) => {
  let  documentData = false;
  let  standardDocumentData = false;
  let count =0;

  data?.documents?.map(value=>{
    if(value.documenttype ===  FORM_LABEL.PROJECT_DOCUMENT)
    {
      documentData = true;
      count = 1;
    }
    if(value.documenttype === FORM_LABEL.CUSTOM_REGULATORY)
    {
      standardDocumentData = true;
      count = 2;
    }

  });
    if(data.checkListResponse)
    {
      count =3
    }

  return (
  <Steps
    direction="vertical"
    size="small"
    current={count}
    // status="error"
    items={[
      {
        title: <span style={{ fontSize: '12px',fontWeight:"600" }}>{STEPPER_LABEL.PROJECT_CREATION}</span>,
        description:<span style={{ fontSize: '11px' }}>Created on {data.created_at ? formatDate(data.created_at) : ""}</span>,
        status: data?.created_at ? `${STEPPER_LABEL.FINISH_STATUS}` : `${STEPPER_LABEL.PROCESS_STATUS}`, 
      },
      {
        title: <span style={{ fontSize: '12px',fontWeight:"600" }}>{STEPPER_LABEL.PROJECT_DOCUMENT}</span>,
        description: <span style={{ fontSize: '11px' }}>{documentData ? "Uploaded" : "Not Uploaded"}</span>,
        status: documentData ? `${STEPPER_LABEL.FINISH_STATUS}` : `${STEPPER_LABEL.PROCESS_STATUS}`, 
      },
      {
        title: <span style={{ fontSize: '12px',fontWeight:"600" }}>{STEPPER_LABEL.STANDARD_DOCUMENT}</span>,
        description: <span style={{ fontSize: '11px' }}>{data?.regulatory_standard ? "Uploaded" : "Not Uploaded"}</span>,
        status: data?.regulatory_standard ? `${STEPPER_LABEL.FINISH_STATUS}` : `${STEPPER_LABEL.PROCESS_STATUS}`, 
      },
      {
        title: <span style={{ fontSize: '12px',fontWeight:"600" }}>{STEPPER_LABEL.CUSTOM_STANDARD_DOCUMENT}</span>,
        description: <span style={{ fontSize: '11px' }}>{standardDocumentData ? "Uploaded" : "Not Uploaded"}</span>,
        status: standardDocumentData ? `${STEPPER_LABEL.FINISH_STATUS}` : `${STEPPER_LABEL.PROCESS_STATUS}`, 
      },
      {
        title: <span style={{ fontSize: '12px',fontWeight:"600" }}>{STEPPER_LABEL.CHECKLIST_REPORT}</span>,
        description: <span style={{ fontSize: '11px' }}>{data.checkListResponse ? "Generated" : "Not generated"}</span>,
        status: data.checkListResponse ? `${STEPPER_LABEL.FINISH_STATUS}` : `${STEPPER_LABEL.PROCESS_STATUS}`, 
      },
      {
        title: <span style={{ fontSize: '12px',fontWeight:"600" }}>{STEPPER_LABEL.ASSESSMENT_REPORT}</span>,
        description:<span style={{ fontSize: '11px' }}>{data.complianceAssesment ? "Generated" : "Not generated"}</span>,
        status: data.complianceAssesment ? `${STEPPER_LABEL.FINISH_STATUS}` : `${STEPPER_LABEL.PROCESS_STATUS}`, 
      }, 
      // {
      //   title:<span style={{ fontSize: '12px',fontWeight:"600" }}>{STEPPER_LABEL.FINAL_STEP}</span>,
      //   status: `${STEPPER_LABEL.PROCESS_STATUS}`, 
      //   // description,
      // }
    ]}
  />
)};
export default RecentHistory;