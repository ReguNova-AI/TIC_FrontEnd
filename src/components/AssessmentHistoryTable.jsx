import React, { useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import DocumentDialog from "./@extended/DocumentDialog";
import {
  extractAnswerAndExplanation,
  parseApiResponse,
} from "pages/ProjectView/FileCard";
import { formatDateTime } from "shared/utility";

const AssessmentHistoryTable = ({ assessmentHistory }) => {
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [complianceData, setComplianceData] = useState([]);
  const [sections, setSections] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [activeTabflag, setActiveTabflag] = useState(false);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderAnswerIcon = (answer) => {
    return answer === "YES" ? (
      <CheckCircleOutlined style={{ color: "green" }} />
    ) : (
      <CloseCircleOutlined style={{ color: "red" }} />
    );
  };

  const prepareComplianceData = async (complianceString, sections) => {
    let array = [];
    sections?.forEach((item) => {
      item.points?.forEach((point) => array.push(point));
    });

    const complianceRes = complianceString?.split("|,|");

    return extractAnswerAndExplanation(array, complianceRes);
  };

  const prepareSections = async (response) => {
    const parsedSections = (await parseApiResponse(response)) || [];
    return parsedSections;
  };

  const noop = () => {};
  return (
    <>
      <Box style={boxStyle}>
        {assessmentHistory &&
        Array.isArray(assessmentHistory) &&
        assessmentHistory.length > 0 ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#f5f5f5" }}>
              <tr>
                <th style={tableHeaderStyle}>Version</th>
                <th style={tableHeaderStyle}>Date</th>
                <th style={tableHeaderStyle}>Changed By</th>
                <th style={tableHeaderStyle}>Updated Report</th>
              </tr>
            </thead>
            <tbody>
              {assessmentHistory.map((item, index) => (
                <tr key={index}>
                  <td style={tableCellStyle}>{item.version}</td>
                  <td style={tableCellStyle}>
                    {formatDateTime(item.updated_at)}
                  </td>

                  <td style={tableCellStyle}>{item.updated_by_name}</td>
                  <td style={tableCellStyle}>
                    {item.updatedStatus === 1
                      ? "Checklist Report"
                      : "Assessment Report"}
                    <IconButton
                      color="primary"
                      aria-label="view"
                      onClick={async () => {
                        const parsedSections = await prepareSections(
                          item?.checkListResponse
                        );
                        const complianceData = await prepareComplianceData(
                          item.complianceAssesment,
                          parsedSections
                        );

                        setSections(parsedSections);
                        setComplianceData(complianceData);
                        setFileName(
                          item.updatedStatus === 1
                            ? "Checklist Report"
                            : "Assessment Report"
                        );
                        setActiveTab(0);
                        setActiveTabflag(false);
                        setOpen(true);
                      }}
                      size="large"
                    >
                      <EyeOutlined />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <Typography>No version history available.</Typography>
        )}
      </Box>

      <DocumentDialog
        open={open}
        onClose={() => setOpen(false)}
        fileName={fileName}
        editMode={false} // 👈 Force read-only mode
        setEditMode={() => {}} // 👈 No-op
        complianceData={complianceData}
        sections={sections}
        activeTab={activeTab}
        activeTabflag={activeTabflag}
        handleTabChange={handleTabChange}
        handleTabTitleChange={noop}
        handleAnswerChange={noop}
        handleExplanationChange={noop}
        renderAnswerIcon={renderAnswerIcon}
        handleAddTab={noop}
        handleAddPoint={noop}
        handlePointChange={noop}
        handleSaveAll={noop}
        isReadOnly={true}
      />
    </>
  );
};

const tableHeaderStyle = {
  padding: "12px",
  textAlign: "left",
  borderBottom: "1px solid #ddd",
};

const tableCellStyle = {
  padding: "12px",
  borderBottom: "1px solid #ddd",
};

const boxStyle = {
  boxShadow: "0px 0px 41px #e4e4e4",
  padding: "20px",
  borderRadius: "10px",
  border: "1px solid #e4e4e4",
};

export default AssessmentHistoryTable;
