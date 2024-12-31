import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box } from '@mui/material';
import { DownOutlined } from '@ant-design/icons';

const complianceData = [
  { question: "Control system must implement active and passive means to maintain operational parameters within safe limits", answer: "YES" },
  { question: "Protection functions should prevent structural overloading due to failure modes", answer: "YES. Equipment loading is below rated values to reduce failure probability." },
  { question: "Conduct failure mode and effects analysis (FMEA) to identify relevant fault events for wind turbine loading", answer: "YES - Failure modes analysis is conducted to identify fault events (Not explicitly mentioned but implied)." },
  { question: "Ensure redundancy in critical control and protection functions to avoid common-cause failures", answer: "YES, Requirement 4 is satisfied. Redundancy and fault exclusions are mentioned to avoid common-cause failures." },
  { question: "Implement emergency stop functions that comply with recognized standards such as ISO 13850", answer: "YES, compliant. ISO 13850 is mentioned in the provided context." },
  { question: "Provide clear procedures for manual operation, including visibility and accessibility of manual controls", answer: "NO, answer is not available in the context." },
  { question: "Establish protocols for automatic, manual, and remote restart procedures post-failure", answer: "NO, the requirement of establishing protocols for restart post-failure is not mentioned in the context." },
  { question: "Verify that braking systems can bring the rotor to a safe standstill from any operational condition", answer: "YES. The context describes constant monitoring and emergency braking systems to bring the rotor to a safe standstill." },
  { question: "All control systems must be capable of responding to excessive rotor speed, vibrations, and power production", answer: "YES. The context ensures control systems can respond to excessive rotor speed, vibrations, and power." },
  { question: "Control functions must be validated through design load cases excluding fault conditions", answer: "NO. Fault consideration is discussed, but validation through design load cases excluding fault conditions is not specifically addressed." },
  { question: "Define turbine behavior following control function failures to ensure safe operation", answer: "NO. The context discusses control system design and standards, but does not directly address defining turbine behavior after control failures." },
  { question: "Document all mechanical system components, ensuring they meet applicable IEC or ISO standards", answer: "YES, EN ISO 13849-2:2012 is referenced for mechanical components, meeting IEC or ISO standards." },
  { question: "All hydraulic or pneumatic systems must be designed to avoid hazards related to energy discharge", answer: "YES. The components are selected for compatibility and to reduce risk by controlling hazards (force, distance, time)." },
  { question: "Electrical systems must comply with IEC 60204-1 for safety and operational standards", answer: "YES. The context mentions the guideline IEC 60204-1:2005 for safety standards in electrical equipment." },
  { question: "Implement protective devices to guard against short circuits, overcurrent, and ground faults", answer: "YES. Short circuits, overcurrent protection, grounding, and voltage spikes suppression are addressed in the context." },
  { question: "Ensure proper insulation coordination for electrical systems according to IEC standards", answer: "YES, IEC standards IEC 60204-1:2005 and IEC 62061:2005 are referenced (page 9) in the context." },
  { question: "Lightning protection systems must be designed in accordance with IEC 61400-24", answer: "NO, IEC 61400-24 is not mentioned in the context." },
  { question: "Conduct site-specific assessments for wind conditions, seismic, and soil conditions", answer: "NO. Site-specific assessments for wind, seismic, and soil conditions are not mentioned in the context provided." },
  { question: "Maintain documentation for installation, operation, and maintenance procedures to ensure safety compliance", answer: "YES, the context mentions following standards and guidelines for safety compliance (Germanischer Lloyd, IEC 60204-1, IEC 62061)." },
  { question: "Perform routine inspections and maintenance of control and safety systems to ensure ongoing compliance and safety", answer: "YES - Context mentions the need for safety functions, regular maintenance, and control system monitoring (page 1)." }
];

const AssessmentView = () => {
    const formatAnswer = (answer) => {
        // Replace "YES" or "NO" with bolded versions using regex
        return answer.split(/(\s|[,.!?;])+/).map((word, index) => {
          if (word.toUpperCase() === "YES" || word.toUpperCase() === "NO") {
            return <strong key={index} style={{color:"black"}}>{word}</strong>;
          }
          return word;
        });
      };

  return (
    <Box sx={{ width: '100%', marginTop: 2 }}>
      {complianceData.map((item, index) => (
        <Accordion key={index} style={{marginTop:"10px"}}>
          <AccordionSummary expandIcon={<DownOutlined/>} aria-controls={`panel${index}-content`} id={`panel${index}-header`}>
            <Typography variant="h6">{`Requirement ${index + 1}: ${item.question}`}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography style={{color:"grey", marginLeft:"30px"}}>{formatAnswer(item.answer)}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default AssessmentView;
