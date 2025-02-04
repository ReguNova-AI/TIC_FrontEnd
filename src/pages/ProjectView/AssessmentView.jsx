import React, { useEffect } from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell, Typography, Box } from '@mui/material';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

// const complianceData = [];

const questions = ["Define the procedures for assessing power performance characteristics of wind turbines.","Ensure compliance with general measurement methodologies outlined in the IEC 61400-12 series.","Specify wind speed data acquisition methods referenced in IEC 61400-50.","Identify the types of wind turbines covered under this standard.","Ensure consistency in power performance evaluations across different wind turbine types.","Prepare for the use of specifications for meteorological variables in assessments.","Integrate methodologies for measuring performance under various atmospheric conditions.","Confirm that all measurements are conducted at the test site location.","Establish criteria for the duration of measurement periods to ensure statistical significance.","Provide a framework for reporting power performance results.","Ensure that all measurements assume 100% availability for annual energy production (AEP) calculations.","Clarify that measurement procedures are applicable to both new and refurbished units.","Include a classification for varying wind conditions affecting performance assessments.","Address potential influences of obstacles and terrain on measurement outcomes.","Reference appropriate international standards that detail wind measurement procedures.","Incorporate IEC 61400-12-1 for general power performance measurement procedures.","Use IEC 61400-12-2 for power performance based on nacelle anemometry.","Reference IEC 61400-12-3 for site calibration measurement procedures.","Utilize IEC 61400-12-5 for evaluating the impact of obstacles and terrain.","Employ IEC 61400-12-6 for nacelle transfer function measurements.","Implement IEC 61400-50 for wind measurement overview guidance.","Apply IEC 61400-50-1 for meteorological mast and mounted instrument applications.","Reference IEC 61400-50-2 for ground-mounted remote sensing technology applications.","Include IEC 61400-50-3 for nacelle-mounted lidars in wind measurements.","Ensure all normative references are the latest editions or amendments.","Maintain a list of additional relevant standards that may affect wind performance assessments.","Verify that referenced documents are accessible to stakeholders involved in measurements.","Make clear distinctions between normative and informative references within documentation.","Ensure that all stakeholders understand the implications of referenced standards.","Facilitate coordination among different standards for comprehensive performance assessments.","Clearly define \"annual energy production\" (AEP) and its calculation basis.","Specify the term \"data set\" as a collection of measurements over a period.","Clarify \"flow distortion\" effects on wind speed and measurement accuracy.","Define \"hub height\" in the context of wind turbine specifications.","Ensure understanding of \"measured power curve\" and its significance.","Specify \"net active electric power\" as the output delivered to the grid.","Define \"obstacle\" and its potential impact on wind measurements.","Explain \"power performance\" as the capability of a turbine to produce energy.","Clarify the meaning of \"rotor equivalent wind speed\" and the associated equations.","Define \"test site\" in relation to measurement locations and their surroundings.","Explain \"uncertainty in measurement\" and its implications for data interpretation.","Identify \"wind measurement equipment\" types and their applications.","Define \"wind shear\" and its role in performance assessments.","Clarify \"wind veer\" and its potential effects on measurement outcomes.","Ensure all terms used are consistent with existing IEC terminologies.","Ensure all symbols used are defined clearly for user reference.","Validate the units of measurement for each symbol are consistent with SI standards.","Include explanations for all abbreviations relevant to power performance measurements.","Maintain consistency in the use of parameters throughout the document.","Create a reference table for quick identification of symbols and their meanings.","Ensure the accuracy of the defined equations related to kinetic energy flux.","Validate that all units are applicable to the contexts they are used in.","Ensure that the definitions align with the normative references.","Provide guidance for interpreting symbols in measurement contexts.","Include notes on potential variations in units based on measurement conditions.","Reference any specific standards that dictate the use of certain symbols or units.","Ensure clarity in the differentiation of variables in equations provided.","Reinforce the importance of consistent units in performance assessments.","Offer examples of equations in context to enhance understanding.","Maintain a glossary for symbols and terms used in all sections.","Detail the procedure for establishing a measured power curve.","Specify the collection of simultaneous measurements of wind speed and turbine output.","Define the conditions under which measurements should be conducted for reliability.","Clarify the role of AEP calculations using measured power curves.","Address the significance of statistical significance in collected data sets.","Provide guidance on the duration of measurement periods for accuracy.","Explain the impact of wind speed variation during measurement periods.","Ensure clarity in the definition of kinetic energy flux as per Equation (1).","Detail the correction factors to be applied for varying wind speeds.","Include guidance on measuring horizontal wind speed for performance evaluation.","Explain the implications of wind shear and veer on performance metrics.","Provide a framework for reporting uncertainties associated with power measurements.","Clarify the influence of atmospheric stability on power performance.","Define protocols for excluding wake-affected measurements from assessments.","Ensure that all procedures are aligned with the overarching objectives of the standard.","The document outlines standardized procedures for measuring and evaluating the power performance characteristics of wind turbines, ensuring accuracy and consistency across varied methodologies. It serves as a foundational guide for manufacturers, operators, and regulatory bodies involved in wind energy generation.",""]
const answersWithExplanation = [
  "NO\nRequirement not fulfilled.\nExplanation: No mention of procedures for assessing power performance characteristics.\nPage number: 9",
  "NO, answer is not available in the context",
  "NO, answer is not available in the context.",
  "NO\nTypes of wind turbines are not identified in the context.\nPage number: Not available in the context",
  "NO\nExplanation: The context does not mention anything about consistency in power performance evaluations. (answer is not available in the context)",
  "NO, specifications for meteorological variables are not mentioned in the context. (Page number not available)",
  "NO. \nMeasuring performance under atmospheric conditions is not mentioned. \n(answer is not available in the context)",
  "NO, outside turbine inspection from a distance, not test site. (page 9-15)",
  "NO. Measurement period criteria not mentioned. \n(answer is not available in the context)",
  "No, answer is not available in the context.",
  "NO\nMeasurements do not mention AEP calculations.\n(answer is not available in the context)",
  "NO\nMeasurement procedures applicability not specified in context. \n(answer is not available in the context)",
  "NO - No mention of classification for varying wind conditions.\nPage: 10, 14",
  "NO. No mention of obstacles or terrain affecting measurement outcomes. (page not available)",
  "NO\nStandard reference not provided in context.",
  "NO, IEC 61400-12-1 not mentioned. (answer is not available in the context)",
  "NO, IEC 61400-12-2 not mentioned in context. (Page number not available)",
  "NO, answer is not available in the context.",
  "NO\nAnswer is not available in the context.",
  "answer is not available in the context",
  "NO, answer is not available in the context.",
  "NO, answer is not available in the context.",
  "NO - IEC 61400-50-2 reference not found.\nPage number: 7",
  "NO\nIEC 61400-50-3 is not mentioned in the context.",
  "NO, missing information on the latest editions or amendments. (Page number not provided)",
  "NO\nFault consideration list in annex, not additional standards. (page not available)",
  "NO\nDocument accessibility not mentioned, only references to documents in the annex.\n(answer is not available in the context)",
  "NO - Only informative references are listed, not normative references. (Page number not available)",
  "NO, \nstandards not explicitly explained. \n(Page number: not available)",
  "NO, requirement not met. Lack of mention of coordinating different standards for performance. (Page not available)",
  "NO, answer is not available in the context.",
  "NO - not available in the context.",
  "NO - Flow distortion effects not mentioned in context. Page 14/15.",
  "answer is not available in the context",
  "NO, Measured power curve is not mentioned in the context.",
  "NO, answer is not available in the context.",
  "Answer is not available in the context.",
  "No, answer is not available in the context.",
  "NO, \nanswer is not available in the context.",
  "No, answer is not available in the context.",
  "Answer is not available in the context.",
  "NO\nExplanation: The context discusses monitoring and safety systems, but does not specifically mention wind measurement equipment types. (answer is not available in the context)",
  "Answer is not available in the context.",
  "NO\nExplanation: Wind veer and its effects are not discussed in the provided context. \nPage number: answer is not available in the context",
  "YES - Existing IEC terminologies such as PL and SRP/CS are used (page 2).",
  "YES, symbols and terms are defined clearly on page 2/15 in the provided context.",
  "NO\nSymbol units not mentioned.\n(answer is not available in the context)",
  "NO\nAbbreviations not explained.\nPage: 14 / 15.",
  "NO, inconsistency in parameter types and examples used. (Page not available)",
  "NO, symbols are mentioned but not in the context of a reference table. (Page 2)",
  "NO, not addressed in the provided context.",
  "NO, ISO 13849-1:2006 is mentioned, but not specific validation of units. (Page 2)",
  "YES. Definitions align with normative references. (Page number not available)",
  "NO\nSymbols and abbreviations are mentioned for the Wind Turbine Control System, not measurement contexts.",
  "No, requirement not satisfied. (answer is not available in the context)",
  "NO - Not specified in the context.",
  "NO, not available in the context.",
  "NO, mention of consistent units not present in context (page numbers not relevant).",
  "NO, no equations are provided for enhancing understanding. (Page 9)",
  "YES - Glossary of symbols and terms provided. (page 2/15)",
  "Answer is not available in the context",
  "YES - Wind speed calculated from rotor speed, power, and blade angle.\nPage 9",
  "NO, measurement conditions not defined in context (page 8).",
  "NO, answer is not available in the context.",
  "NO, answer is not available in the context.",
  "NO, duration of measurement periods not mentioned. (answer is not available in the context)",
  "NO - Wind speed impact not addressed.\n(Page number not available)",
  "answer is not available in the context",
  "NO, correction factors for varying wind speeds not mentioned in context. (Page 10)",
  "NO\nNot addressed in context, only mentions wind speed sensor comparison.\nPage: 10, 11",
  "NO, answer is not available in the context.",
  "NO - Uncertainty reporting not mentioned in context.",
  "No, answer is not available in the context.",
  "NO, not mentioned in the context.",
  "NO, procedures alignment not mentioned. (Page not available)",
  "NO, not mentioned in context.",
  "No\nNo mention of rotor speed compliance in the context, not available.\nPage 5"
];

const extractAnswerAndExplanation = (questions, data) => {
  return data.map((item, index) => {
    const normalizedItem = item.toLowerCase();  // Normalize the string to lowercase

    // Check if it contains "yes" or "no" (in any capitalization)
    let answer = "";
    let explanation = "";

    if (normalizedItem.includes("yes")) {
      answer = "YES";
      explanation = item.replace(/yes/i, "").trim();  // Remove "YES" (case insensitive)
    } else if (normalizedItem.includes("no")) {
      answer = "NO";
      explanation = item.replace(/no/i, "").trim();  // Remove "NO" (case insensitive)
    }

    // Remove unwanted punctuation (., -) from the start or end of the explanation
    explanation = explanation.replace(/[.,-]+$/, '').trim();  // Remove trailing punctuation
    explanation = explanation.replace(/^[.,-]+/, '').trim();  // Remove leading punctuation

    // Combine the question with the answer and explanation
    return {
      question: questions[index], // Add the corresponding question
      answer,
      explanation
    };
  });
};

const complianceData = extractAnswerAndExplanation(questions, answersWithExplanation);

const AssessmentView = () => {
    const renderAnswerIcon = (answer) => {
        return answer === "YES" ? <CheckCircleOutlined style={{ color: "green" }} /> : <CloseCircleOutlined style={{ color: "red" }} />;
    };
    
  return (
    <Box sx={{ width: '100%', marginTop: 2 }}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell><strong>Requirements</strong></TableCell>
            <TableCell align="center"><strong>Fulfilled or Not</strong></TableCell>
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
