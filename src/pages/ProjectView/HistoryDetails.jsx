import React from 'react';
import { Timeline, Card, Col, Row, Space } from 'antd';
import { EditOutlined, FileTextOutlined, FileImageOutlined, FileOutlined } from '@ant-design/icons';
// import './TimelineView.css';

const HistoryDetails = ({data}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(); // You can customize the format as needed
  };

  const renderChange = (change) => {
    const entries = Object.entries(change);
    return entries.map(([key, value]) => {
      if (key === 'documents' && value.length > 0) {
        return (
          <div key={key}>
            <Space direction="vertical">
              <strong>Documents uploaded:</strong>
              {value.map((doc, index) => (
                <a href={doc.path} key={index} target="_blank" rel="noopener noreferrer">
                  <FileOutlined /> {doc.name}
                </a>
              ))}
            </Space>
          </div>
        );
      }
      if (key === 'projectName' && value) {
        return (
          <div key={key}>
            <strong>Project Name:</strong> {value}
          </div>
        );
      }
      if (key === 'projectNo' && value) {
        return (
          <div key={key}>
            <strong>Project No.:</strong> {value}
          </div>
        );
      }
      if (key === 'description' && value) {
        return (
          <div key={key}>
            <strong>Description:</strong> {value}
          </div>
        );
      }
      if (key === 'checklistRun' && value) {
        return (
          <div key={key}>
            <strong>Checklist generated</strong>
          </div>
        );
      }
      if (key === 'assessmentRun' && value) {
        return (
          <div key={key}>
            <strong>Run Compliance Assessment</strong>
          </div>
        );
      }

      

      if (key === 'status' && value) {
        return (
          <div key={key}>
            <strong>Current Status:</strong> {value}
          </div>
        );
      }
      return null; // Filter out null entries (if any)
    });
  };

  return (
    <Timeline mode="alternate" >
      {data?.map((changeEntry, index) => (
        <Timeline.Item key={index} label={formatDate(changeEntry.date)} >
          <Card title={`${changeEntry.changedby}`} >
            {renderChange(changeEntry.changes)}
          </Card>
        </Timeline.Item>
      ))}
    </Timeline>
  );
};

export default HistoryDetails;
