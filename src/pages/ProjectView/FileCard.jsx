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
  Button,
  Table, TableHead, TableBody, TableRow, TableCell
} from '@mui/material';
import { DownloadOutlined, EyeOutlined,CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
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
          
      
      
            return { title, points };
      });
  }

  // Default case (if the response doesn't match either format)
  else {
      console.error("Unknown response format");
      return [];
  }
};


const FileCard = ({ fileName, onDownload, onView, apiResponse,data,data1 }) => {
  // Modal open state and active tab state
  const [openModal, setOpenModal] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [sections, setSections] = useState([]);
  const [assessmentData,setAssessmentData]= useState([]);
  const [questions ,setQuestion] = useState([]);
  const [answersWithExplanation ,setAnswersWithExplanation] = useState([]);
const [ complianceData , setComplianceData] = useState([]);
apiResponse = data;

  useEffect(() => {
    if (apiResponse) {
      const parsedSections = parseApiResponse(apiResponse);
      setSections(parsedSections);
      let array = [];
      parsedSections?.map(item=>{
        item.points?.map(line=>{
          array.push(line)
        });
      });

      const complianceResponse = data1?.split("|,|")
      
      setAssessmentData(array);
  setComplianceData(extractAnswerAndExplanation(array, complianceResponse));
}
  }, [apiResponse,data1]);

  const extractAnswerAndExplanation = (questions, dataValue) => {
    return dataValue && dataValue?.map((item, index) => {
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

  
  const renderAnswerIcon = (answer) => {
    return answer === "YES" ? <CheckCircleOutlined style={{ color: "green" }} /> : <CloseCircleOutlined style={{ color: "red" }} />;
};



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
          {complianceData?.map((item, index) => (
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
