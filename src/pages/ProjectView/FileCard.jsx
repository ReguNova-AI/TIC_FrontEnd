import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tabs,
  Tab,
  Box as MuiBox,
  Button
} from '@mui/material';
import { DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import checklist from '../../assets/images/checklist3.jpg';
import assessment from '../../assets/images/assessment2.jpg';
import AssessmentView from './AssessmentView';
import { saveAs } from 'file-saver';

// Function to parse the API response into a structured format (skipping the title)
const parseApiResponse = (response) => {
  // Check if the response contains '---' and '**' (first format)
  if (response.includes('---') || response.includes('**')) {
      // Handle the first format (with '**' and '---')
      const sections = response.split('---').slice(1); // Skip the first "Title" section
      const lastSection = sections[sections.length - 1]?.trim();

      // If the last section starts with "Summary:", explicitly name it
      if (lastSection?.startsWith("Summary:")) {
          sections[sections.length - 1] = `**Summary**\n${lastSection}`;
      }

      // Now process all sections
      return sections?.map((section, index) => {
          let lines = section?.trim()?.split('\n'); // Split the section into lines

          // Extract and clean the title of the section
          let title = lines[0]?.replace('**', '')?.replace(':', '')?.trim();
          title= title?.replace("**","");
        if(title?.startsWith("Summary"))
        {
          lines.push(title?.replace("Summary",`${index}.`))
          lines[0] = title?.replace("Summary** ",`${index}.`);
          
          title = "Summary";
        } 
        else{
          title = title?.replace(`Section ${index + 1}`, '')?.trim();
        }   
       
        // Process the remaining lines as "points" and clean the list
        const points = lines?.slice(1).map(line => line.replace(/^\d+\./, '')?.trim());
    
        // console.log("title",title);
        // console.log("points",points);x
    
    
          return { title, points };
      });
  }

  // If the response contains '###' but not '---' (second format)
  else if (response.includes('###')) {
      // Handle the second format (with '###')
      const sections = response.split('###').slice(1); // Skip the first part (Title)
      return sections.map((section, index) => {
          let lines = section.trim().split('\n');

          // Extract and clean the title of the section
          let title = lines[0].replace(':', '').trim();

          if (title.startsWith("Section") || title.startsWith("Summary")) {
            // Clean up titles that include 'Section X'
            title = title.replace(/^Section \d+:?/, '').trim();
        }

          // Special handling for "Summary" in the title
          if(title?.startsWith("Summary"))
          {
            lines.push(title?.replace("Summary",`${index}.`))
            lines[0] = title?.replace("Summary** ",`${index}.`);
            
            title = "Summary";
          } 
          else{
            title = title?.replace(`Section ${index + 1}`, '')?.trim();
          }   
         
          // Process the remaining lines as "points" and clean the list
          const points = lines?.slice(1).map(line => line.replace(/^\d+\./, '')?.trim());
      
          // console.log("title",title);
          // console.log("points",points);x
      
      
            return { title, points };
      });
  }

  // Default case (if the response doesn't match either format)
  else {
      console.error("Unknown response format");
      return [];
  }
};


const FileCard = ({ fileName, onDownload, onView, apiResponse,data }) => {
  // Modal open state and active tab state
  const [openModal, setOpenModal] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [sections, setSections] = useState([]);
// apiResponse = "**Title:** IEC 61400-12: Power performance measurements of electricity producing wind turbines – Overview\n\n---\n\n**Section 1: Scope**\n1. Define the procedures for assessing power performance characteristics of wind turbines.\n2. Provide an overview of measurement options for power performance evaluation.\n3. Specify meteorological variables required for power performance evaluation.\n4. Refer to other parts of the IEC 61400-12 series for detailed evaluations.\n5. Clarify the intended use of the document for various stakeholders.\n6. Ensure consistency, accuracy, and reproducibility in measurement techniques.\n7. Outline expected measurement durations for statistically significant data collection.\n8. Establish the relationship between power output and wind speed.\n9. Incorporate methods for estimating annual energy production (AEP).\n10. Highlight the importance of compliance with referenced standards.\n11. Include information on data set collection over continuous periods.\n12. Specify conditions for test site assessments.\n13. Emphasize the need for comprehensive wind speed measurements.\n14. Indicate the impact of atmospheric conditions on power performance.\n15. Define the roles of manufacturers, purchasers, and operators in compliance.\n\n---\n\n**Section 2: Normative references**\n1. List all applicable IEC standards related to power performance measurements.\n2. Ensure that dated references are the editions cited.\n3. Include updated references for undated documents.\n4. Provide context for how each referenced document supports this standard.\n5. Specify the importance of adherence to normative references.\n6. Clarify the role of IEC 61400-50 for wind measurement methodologies.\n7. Ensure inclusion of the latest amendments to referenced documents.\n8. Highlight the referenced documents' requirements as part of compliance.\n9. Promote familiarity with the listed normative references for all users.\n10. Encourage users to verify the latest editions of the referenced standards.\n11. Illustrate the interconnectedness of standards within the IEC 61400 series.\n12. Point out any potential patent rights associated with the references.\n13. Define how normative references influence power performance assessments.\n14. Indicate the significance of these references for regulatory compliance.\n15. Encourage cross-referencing of normative documents for comprehensive understanding.\n\n---\n\n**Section 3: Terms and definitions**\n1. Standardize key terms used throughout the document.\n2. Define \"annual energy production\" (AEP) and its calculation.\n3. Clarify \"data set\" in the context of power performance measurement.\n4. Explain \"flow distortion\" and its implications for measurement accuracy.\n5. Define \"hub height\" in relation to wind turbine specifications.\n6. Describe \"measured power curve\" and its significance.\n7. Clarify the meaning of \"net active electric power.\"\n8. Define \"obstacle\" and its impact on wind measurements.\n9. Specify the term \"power performance\" and its relevance.\n10. Explain \"rotor equivalent wind speed\" and its calculation.\n11. Define \"test site\" as it relates to wind turbine assessments.\n12. Clarify \"uncertainty in measurement\" and its implications for results.\n13. Describe \"wind measurement equipment\" and its types.\n14. Define \"wind shear\" and its impact on turbine performance.\n15. Clarify \"wind veer\" and its significance in power performance evaluations.\n\n---\n\n**Section 4: Symbols, units, and abbreviated terms**\n1. Create a comprehensive list of symbols used throughout the document.\n2. Define each symbol's meaning to ensure clarity.\n3. Specify standard units of measurement for all variables.\n4. Include abbreviations for key terms to facilitate understanding.\n5. Ensure consistency in the use of symbols and units.\n6. Clarify any non-standard units that may be used.\n7. Provide context for each symbol's application in equations.\n8. Encourage users to refer to this section for accurate interpretations.\n9. Indicate the importance of precision in symbol usage for compliance.\n10. Ensure symbols align with international standards for uniformity.\n11. Clarify any specific measurement conditions associated with symbols.\n12. Provide examples of how symbols are applied in calculations.\n13. Promote awareness of the significance of proper unit conversions.\n14. Indicate the relevance of each symbol in relation to performance measurements.\n15. Encourage users to familiarize themselves with symbols for accurate reporting.\n\n---\n\n**Section 5: Power performance method overview**\n1. Establish a clear methodology for measuring power performance.\n2. Describe the relationship between wind speed and turbine output.\n3. Define the measured power curve and its components.\n4. Detail the procedure for simultaneous meteorological measurements.\n5. Specify the duration required for significant data collection.\n6. Outline the calculations for estimating annual energy production (AEP).\n7. Include the importance of uncertainty assessments in results.\n8. Clarify the impact of turbulence on power performance measurements.\n9. Define the kinetic energy flux equations for wind measurements.\n10. Ensure that methodologies comply with IEC 61400-12 series requirements.\n11. Emphasize the need for standardization in measurement practices.\n12. Provide examples of typical meteorological variable measurements.\n13. Clarify the role of data normalization in performance assessments.\n14. Indicate the significance of accurate wind speed measurements.\n15. Encourage transparency in the reporting of measurement results.\n\n---\n\n**Summary:**\nThe document outlines the requirements for measuring the power performance of wind turbines, emphasizing standardized methodologies, normative references, and clear definitions. It is aimed at manufacturers, operators, and regulators to ensure accurate and consistent performance assessments in the wind energy sector.";

apiResponse = data;

// console.log("apiResponse",apiResponse)
  useEffect(() => {
    if (apiResponse) {
      const parsedSections = parseApiResponse(apiResponse);
      setSections(parsedSections);
    }
  }, [apiResponse]);

  // Function to handle opening the modal
  const handleOpenModal = () => {
    setOpenModal(true);
  };

  // Function to handle closing the modal
  const handleCloseModal = () => {
    setOpenModal(false);
  };

  // Handle Tab Change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const downloadChecklistFile = ()=>{
    const content = data;
    const blob = new Blob([content], { type: 'application/msword' });
    saveAs(blob, 'IEC_Power_Performance_Standard.doc');
  }

  return (
    <>
      <Card sx={{ width: 200, textAlign: 'center', boxShadow: 3, marginRight: '20px' }}>
        <CardContent style={{ padding: '0px' }}>
          {/* File Icon at the top */}
          <Box sx={{ marginBottom: 1 }}>
            {/* File Icon, adjust based on file type */}
            <img src={fileName === 'Assessment Report' ? assessment : checklist} width="150" alt="File" />
          </Box>

          {/* File Name */}
          <Typography variant="h5" sx={{ marginBottom: 1 }}>
            {fileName}
          </Typography>
        </CardContent>

        {/* Action Buttons (Download and View) */}
        <CardActions sx={{ justifyContent: 'center' }}>
          <IconButton color="primary" onClick={downloadChecklistFile} aria-label="download">
            <DownloadOutlined />
          </IconButton>
          <IconButton color="primary" onClick={handleOpenModal} aria-label="view">
            <EyeOutlined />
          </IconButton>
        </CardActions>
      </Card>

      {/* Modal Popup */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="lg" style={{zIndex:"999999"}}>
        <DialogTitle>File Details</DialogTitle>
        <DialogContent>
          <MuiBox sx={{ width: '100%' }}>
            {fileName === 'Assessment Report' ? (
              <AssessmentView />
            ) : (
              <>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="file-tabs">
                  {/* Dynamically generate tabs */}
                  {sections.map((section, index) => (
                    <Tab key={index} label={section.title} />
                  ))}
                </Tabs>

                {/* Tab Content */}
                <Box sx={{ padding: 2 }}>
                  {sections.length > 0 && (
                    <Typography>
                      <ul>
                        {sections[activeTab]?.points.map((point, index) => (
                          <li key={index}>
                            <Typography>{point}</Typography>
                          </li>
                        ))}
                      </ul>
                    </Typography>
                  )}
                </Box>
              </>
            )}
          </MuiBox>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FileCard;
