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
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import { Table as DocxTable, TableRow as DocxTableRow, TableCell as DocxTableCell } from "docx";



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


const FileCard = ({ fileName, onDownload, onView, apiResponse,data,data1,projectData }) => {
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

  // const downloadChecklistFile = ()=>{
  //   const content = data;
  //   const blob = new Blob([content], { type: 'application/msword' });
  //   saveAs(blob, 'IEC_Power_Performance_Standard.doc');
  // }

  const downloadChecklistFile = () => {

    const inviteData = [];
    projectData?.invite_members?.map(idata=>{
      inviteData.push(idata?.user_name);
    });

    const extraInfo = {
      projectName: projectData?.project_name,
      projectNo: projectData?.project_no,
      regulatory: projectData?.regulatory_standard,
      invitedMembers: inviteData.join(","),

    };
  
    const content = data; // Assuming this is your existing content
    
    // Split content by new lines, preserving individual lines
    const contentLines = content.split("\n");
  
    // Create the table with two columns using aliased imports
    const extraInfoTable = new DocxTable({
      rows: [
        new DocxTableRow({
          children: [
            new DocxTableCell({
              children: [new Paragraph("Project Name")],
              width: { size: 50, type: "pct" },
              verticalAlign: "center",
            }),
            new DocxTableCell({
              children: [new Paragraph(extraInfo.projectName)],
              width: { size: 50, type: "pct" },
              verticalAlign: "center",
            }),
          ],
        }),
        new DocxTableRow({
          children: [
            new DocxTableCell({
              children: [new Paragraph("Project No.")],
              width: { size: 50, type: "pct" },
              verticalAlign: "center",
            }),
            new DocxTableCell({
              children: [new Paragraph(extraInfo.projectNo)],
              width: { size: 50, type: "pct" },
              verticalAlign: "center",
            }),
          ],
        }),
        new DocxTableRow({
          children: [
            new DocxTableCell({
              children: [new Paragraph("Regulatory")],
              width: { size: 50, type: "pct" },
              verticalAlign: "center",
            }),
            new DocxTableCell({
              children: [new Paragraph(extraInfo.regulatory)],
              width: { size: 50, type: "pct" },
              verticalAlign: "center",
            }),
          ],
        }),
        new DocxTableRow({
          children: [
            new DocxTableCell({
              children: [new Paragraph("Invited Members")],
              width: { size: 50, type: "pct" },
              verticalAlign: "center",
            }),
            new DocxTableCell({
              children: [new Paragraph(extraInfo.invitedMembers)],
              width: { size: 50, type: "pct" },
              verticalAlign: "center",
            }),
          ],
        }),
      ],
    });
  
     // Compliance data table (only if complianceData exists)
  const complianceTable = complianceData?.length > 0 ? new DocxTable({
    rows: [
      // Table header row
      new DocxTableRow({
        children: [
          new DocxTableCell({
            children: [new Paragraph("Requirement")],
            width: { size: 50, type: "pct" },
            verticalAlign: "center",
          }),
          new DocxTableCell({
            children: [new Paragraph("Fulfilled or Not")],
            width: { size: 20, type: "pct" },
            verticalAlign: "center",
          }),
          new DocxTableCell({
            children: [new Paragraph("Explanation")],
            width: { size: 30, type: "pct" },
            verticalAlign: "center",
          }),
        ],
      }),

      // Table content rows
      ...complianceData?.map(item => new DocxTableRow({
        children: [
          new DocxTableCell({
            children: [new Paragraph(item.question)],
            width: { size: 50, type: "pct" },
            verticalAlign: "center",
            alignment: AlignmentType.CENTER,
          }),
          new DocxTableCell({
            children: [new Paragraph(item.answer)],
            width: { size: 20, type: "pct" },
            verticalAlign: "center",
            alignment: AlignmentType.CENTER,
          }),
          new DocxTableCell({
            children: [new Paragraph(item.explanation)],
            width: { size: 30, type: "pct" },
            verticalAlign: "center",
            alignment: AlignmentType.CENTER,
          }),
        ],
      })),
    ],
  }) : null;  // Only create table if complianceData exists

  
    // Create a new document
    const doc = fileName === 'Assessment Report' ? new Document({
      sections: [
        {
          properties: {},
          children: [
            // Heading "Checklist Report" in a larger font size, centered horizontally and vertically
            new Paragraph({
              children: [
                new TextRun({
                  text: "Assessment Report",
                  size: 48, // Size 48 (larger than normal text size)
                  bold: true,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 800 }, // Adds space after the heading to push the table below
            }),
  
            // Add a table with extra information
            extraInfoTable,
  
            // Add a page break after the table (move to the next page)
            new Paragraph({
              children: [],
              pageBreakBefore: true,
            }),

            complianceTable && complianceTable,
  
          ],
        },
      ],
    })
    :
    new Document({
      sections: [
        {
          properties: {},
          children: [
            // Heading "Checklist Report" in a larger font size, centered horizontally and vertically
            new Paragraph({
              children: [
                new TextRun({
                  text: "Checklist Report",
                  size: 48, // Size 48 (larger than normal text size)
                  bold: true,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 800 }, // Adds space after the heading to push the table below
            }),
  
            // Add a table with extra information
            extraInfoTable,
  
            // Add a page break after the table (move to the next page)
            new Paragraph({
              children: [],
              pageBreakBefore: true,
            }),
            // Loop through content lines and add each one as a separate TextRun
            ...contentLines.map((line) => {
              return new Paragraph({
                children: [
                  new TextRun({
                    text: line?.replace("**","")?.replace("---","")?.replace("###","")?.replace("**",""),
                  }),
                ],
              });
            }),
          ],
        },
      ],
    }); 
  
    // Create a blob and download the file
    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, "IEC_Power_Performance_Standard.docx");
    });
  };
  

  const renderAnswerIcon = (answer) => {
    return answer === "YES" ? (
      <CheckCircleOutlined style={{ color: "green" }} />
    ) : (
      <CloseCircleOutlined style={{ color: "red" }} />
    );
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
