import React from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell, Typography, Box } from '@mui/material';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const complianceData = [
  { question: "Control system must implement active and passive means to maintain operational parameters within safe limits", answer: "YES", explanation: "Equipment loading is below rated values to reduce failure probability." },
  { question: "Protection functions should prevent structural overloading due to failure modes", answer: "YES", explanation: "Equipment loading is below rated values to reduce failure probability." },
  { question: "Conduct failure mode and effects analysis (FMEA) to identify relevant fault events for wind turbine loading", answer: "YES", explanation: "Failure modes analysis is conducted to identify fault events (Not explicitly mentioned but implied)." },
  { question: "Ensure redundancy in critical control and protection functions to avoid common-cause failures", answer: "YES", explanation: "Redundancy and fault exclusions are mentioned to avoid common-cause failures." },
  { question: "Implement emergency stop functions that comply with recognized standards such as ISO 13850", answer: "YES", explanation: "Compliant. ISO 13850 is mentioned in the provided context." },
  { question: "Provide clear procedures for manual operation, including visibility and accessibility of manual controls", answer: "NO", explanation: "Answer is not available in the context." },
  { question: "Establish protocols for automatic, manual, and remote restart procedures post-failure", answer: "NO", explanation: "The requirement of establishing protocols for restart post-failure is not mentioned in the context." },
  { question: "Verify that braking systems can bring the rotor to a safe standstill from any operational condition", answer: "YES", explanation: "The context describes constant monitoring and emergency braking systems to bring the rotor to a safe standstill." },
  { question: "All control systems must be capable of responding to excessive rotor speed, vibrations, and power production", answer: "YES", explanation: "The context ensures control systems can respond to excessive rotor speed, vibrations, and power." },
  { question: "Control functions must be validated through design load cases excluding fault conditions", answer: "NO", explanation: "Fault consideration is discussed, but validation through design load cases excluding fault conditions is not specifically addressed." },
  { question: "Define turbine behavior following control function failures to ensure safe operation", answer: "NO", explanation: "The context discusses control system design and standards, but does not directly address defining turbine behavior after control failures." },
  { question: "Document all mechanical system components, ensuring they meet applicable IEC or ISO standards", answer: "YES", explanation: "EN ISO 13849-2:2012 is referenced for mechanical components, meeting IEC or ISO standards." },
  { question: "All hydraulic or pneumatic systems must be designed to avoid hazards related to energy discharge", answer: "YES", explanation: "The components are selected for compatibility and to reduce risk by controlling hazards (force, distance, time)." },
  { question: "Electrical systems must comply with IEC 60204-1 for safety and operational standards", answer: "YES", explanation: "The context mentions the guideline IEC 60204-1:2005 for safety standards in electrical equipment." },
  { question: "Implement protective devices to guard against short circuits, overcurrent, and ground faults", answer: "YES", explanation: "Short circuits, overcurrent protection, grounding, and voltage spikes suppression are addressed in the context." },
  { question: "Ensure proper insulation coordination for electrical systems according to IEC standards", answer: "YES", explanation: "IEC standards IEC 60204-1:2005 and IEC 62061:2005 are referenced (page 9) in the context." },
  { question: "Lightning protection systems must be designed in accordance with IEC 61400-24", answer: "NO", explanation: "IEC 61400-24 is not mentioned in the context." },
  { question: "Conduct site-specific assessments for wind conditions, seismic, and soil conditions", answer: "NO", explanation: "Site-specific assessments for wind, seismic, and soil conditions are not mentioned in the context provided." },
  { question: "Maintain documentation for installation, operation, and maintenance procedures to ensure safety compliance", answer: "YES", explanation: "The context mentions following standards and guidelines for safety compliance (Germanischer Lloyd, IEC 60204-1, IEC 62061)." },
  { question: "Perform routine inspections and maintenance of control and safety systems to ensure ongoing compliance and safety", answer: "YES", explanation: "The context mentions the need for safety functions, regular maintenance, and control system monitoring (page 1)." }
];

const AssessmentView = () => {
    const renderAnswerIcon = (answer) => {
        return answer === "YES" ? <CheckCircleOutlined style={{ color: "green" }} /> : <CloseCircleOutlined style={{ color: "red" }} />;
    };

  return (
    <Box sx={{ width: '100%', marginTop: 2 }}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell><strong>Question</strong></TableCell>
            <TableCell align="center"><strong>Answer</strong></TableCell>
            <TableCell><strong>Explanation</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {complianceData.map((item, index) => (
            <TableRow key={index}>
              <TableCell>
                <Typography variant="body2">{item.question}</Typography>
              </TableCell>
              <TableCell align="center" style={{fontSize:"18px"}}>
                {renderAnswerIcon(item.answer)}
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="textSecondary">{item.explanation}</Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default AssessmentView;
