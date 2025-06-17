import React, { useState, useEffect } from "react";
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
  Button,
} from "@mui/material";
import {
  DownloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import checklist from "../../assets/images/checklist3.jpg";
import assessment from "../../assets/images/assessment2.jpg";
import { saveAs } from "file-saver";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Header,
  ImageRun,
} from "docx";
import {
  Table as DocxTable,
  TableRow as DocxTableRow,
  TableCell as DocxTableCell,
} from "docx";
import { OrganisationApiService } from "services/api/OrganizationAPIService";
import logo from "../../assets/images/logo1.jpeg";
import DocumentDialog from "../../components/@extended/DocumentDialog";
import { PROJECT_DETAIL_PAGE } from "shared/constants";
import _ from "lodash";

// Function to parse the API response into a structured format (skipping the title)
export const parseApiResponse = (response) => {
  // If the response contains 'checklist' (new checklist format)
  if (response.checklist && Array.isArray(response.checklist)) {
    let checklist = response.checklist;

    // Process checklist into sections and annexes
    const sections = [];
    const annexes = [];
    let currentSectionIndex = -1;
    let currentAnnexIndex = -1;
    let isAnnex = false;

    checklist.forEach((item) => {
      // Split checklist items based on whether they contain a section or annex
      if (item.includes("##")) {
        // Check if it's an Annex or Section
        if (item.toLowerCase().startsWith("## title")) {
          sections.push({
            title: item,
            points: [],
          });
          currentSectionIndex = sections.length - 1;
          isAnnex = false;
        } else if (item.toLowerCase().startsWith("## annex")) {
          annexes.push({
            title: item
              .split("##")[1]
              ?.trim()
              .replace(/^Annex\s*[:\-]?\s*/i, ""), // Remove "Annex"
            points: [],
          });
          currentAnnexIndex = annexes.length - 1;
          isAnnex = true;
        } else if (item.toLowerCase().startsWith("## section")) {
          sections.push({
            title: item
              .split("##")[1]
              ?.trim()
              .replace(/^Section\s*[:\-]?\s*/i, "")
              .replace(/^\d+(\.\d+)?\s*/, "")
              .replace(/\**/g, ""), // Remove "Section" and leading digits
            points: [],
          });
          currentSectionIndex = sections.length - 1;
          isAnnex = false;
        }
      } else if (item.includes("**")) {
        // Check if it's an Annex or Section
        if (item.toLowerCase().startsWith("**title")) {
          sections.push({
            title: item
              .split("**")
              ?.join(" ")
              ?.trim()
              .replace(/^\d+(\.\d+)?\s*/, ""),
            points: [],
          });
          currentSectionIndex = sections.length - 1;
          isAnnex = false;
        } else if (item.toLowerCase().startsWith("**annex")) {
          annexes.push({
            title: item
              .split("**")[1]
              ?.trim()
              .replace(/^Annex\s*[:\-]?\s*/i, "")
              .replace(/^\d+(\.\d+)?\s*/, ""), // Remove "Annex"
            points: [],
          });
          currentAnnexIndex = annexes.length - 1;
          isAnnex = true;
        } else if (item.toLowerCase().includes("**section")) {
          sections.push({
            title: item
              .split("**")[1]
              ?.trim()
              .replace(/^Section\s*[:\-]?\s*/i, "")
              .replace(/^\d+(\.\d+)?\s*/, ""), // Remove "Section" and leading digits
            points: [],
          });
          currentSectionIndex = sections.length - 1;
          isAnnex = false;
        }
      } else {
        // Push points to the correct list
        if (isAnnex && currentAnnexIndex >= 0) {
          annexes[currentAnnexIndex].points.push(
            item
              .replace(/^\d+\.\s*/, "")
              .replace("---", "")
              .replace(/\\"/g, "")
              .trim()
          );
        } else if (!isAnnex && currentSectionIndex >= 0) {
          sections[currentSectionIndex].points.push(
            item
              .replace(/^\d+\.\s*/, "")
              .replace("---", "")
              .replace(/\\"/g, "")
              .trim()
          );
        }
      }
    });

    return [
      ...sections.map((section, index) => ({
        title: section.title,
        points: section.points,
      })),
      ...annexes.map((annex, index) => ({
        title: annex.title,
        points: annex.points,
      })),
    ];

    // const sections = [];
    // const annexes = [];
    // let currentSectionIndex = -1;
    // let currentAnnexIndex = -1;
    // let isAnnex = false;

    // checklist.forEach((rawItem) => {
    //   const lowerRaw = rawItem.toLowerCase().trim();

    //   // Clean for storing
    //   const item = rawItem
    //     .replace(/^#+\s*|^#+(?=\S)/, "") // ✅ Removes markdown headings (with or without space)
    //     .replace(/\*\*/g, "") // Remove bold markers **
    //     .replace(/\#\#/g, "") // Remove bold markers **
    //     .replace(/^\d+(\.\d+)*\.\s*/, "") // Remove indexes like 1., 1.1.2.
    //     .trim();

    //   if (lowerRaw.includes("title:")) {
    //     sections.push({
    //       title: item,
    //       points: [],
    //     });
    //     currentSectionIndex = sections.length - 1;
    //     isAnnex = false;
    //   } else if (lowerRaw.includes("section:")) {
    //     sections.push({
    //       title: item.replace(/^section[:\-]?\s*/i, "").trim(), // ✅ Remove 'Section:'
    //       points: [],
    //     });
    //     currentSectionIndex = sections.length - 1;
    //     isAnnex = false;
    //   } else if (lowerRaw.includes("annex")) {
    //     annexes.push({
    //       title: item.replace(/^annex[:\-]?\s*/i, "").trim(),
    //       points: [],
    //     });
    //     currentAnnexIndex = annexes.length - 1;
    //     isAnnex = true;
    //   } else {
    //     const point = item
    //       .replace(/^[-–—]\s*/, "")
    //       .replace(/\\"/g, "")
    //       .trim();

    //     if (isAnnex && currentAnnexIndex >= 0) {
    //       annexes[currentAnnexIndex].points.push(point);
    //     } else if (!isAnnex && currentSectionIndex >= 0) {
    //       sections[currentSectionIndex].points.push(point);
    //     }
    //   }
    // });

    // const result = [
    //   ...sections.map(({ title, points }) => ({ title, points })),
    //   ...annexes.map(({ title, points }) => ({ title, points })),
    // ];
    // console.log("result", result);
    // return result;
  }
  // If the response contains '---' or '**' (first format)
  if (
    response.includes("---") ||
    response.includes("**") ||
    response.includes("\n\n")
  ) {
    let sections = response.split("---").slice(1); // Skip the first "Title" section

    if (sections.length === 0 || sections.length < 4) {
      sections = response.split("\n\n").slice(1);
    }

    const lastSection = sections[sections.length - 1]?.trim();

    if (lastSection?.startsWith("Summary:")) {
      sections[sections.length - 1] = `**Summary**\n${lastSection}`;
    }

    const sectionPattern = /^(?:\*\*)?(?:Section\s*[:\-]?\s*|\#\#\s*)/i;
    const annexPattern = /^Annex/i;

    return sections.map((section, index) => {
      let lines = section.trim().replace("\n\n", "\n").split("\n");

      let title = lines[0]
        ?.replace("**", "")
        ?.replace("###", "")
        ?.replace("---")
        ?.replace(":", "")
        ?.trim();
      title = title?.replace("**", "");

      // Match any Section or Annex as tabs
      if (sectionPattern.test(title) || annexPattern.test(title)) {
        // Check if it's a section or annex
        if (sectionPattern.test(title)) {
          title = title.replace(sectionPattern, "").trim();
          title = title
            .replace(/^Section\s*[:\-]?\s*/i, "")
            .replace(/^\d+(\.\d+)?\s*/, ""); // Remove "Section" and leading digits
        } else if (annexPattern.test(title)) {
          title = title.replace(annexPattern, "").trim();
          title = title.replace(/^Annex\s*[:\-]?\s*/i, ""); // Remove "Annex"
        }

        return {
          title: title,
          points: lines
            .slice(1)
            .map((line) => line.replace(/^\d+(\.\d+)?\./, "").trim()),
        };
      }
      return {
        title: `Section ${index + 1}`,
        points: lines.slice(1).map((line) => line.trim()),
      };
    });
  }

  // If the response contains '###' but not '---' (second format)
  else if (response.includes("###")) {
    const sections = response
      ?.replace(/\\n/g, "\n")
      ?.replace("\n\n", "\n")
      ?.split("###")
      .slice(1);

    const sectionPattern = /^(?:\*\*)?(?:Section\s*[:\-]?\s*|\#\#\s*)/i;
    const annexPattern = /^Annex/i;

    return sections.map((section, index) => {
      let lines = section
        ?.trim()
        ?.replace(/\\n/g, "\n")
        ?.replace("\n\n", "\n")
        ?.replace(/^\d+\./g, "\n")
        ?.split("\n");

      let title = lines[0]
        ?.replace("**", "")
        ?.replace("###", "")
        ?.replace("---", "")
        ?.replace(":", "")
        ?.trim();

      // Match any Section or Annex as tabs
      if (sectionPattern.test(title) || annexPattern.test(title)) {
        // Check if it's a section or annex
        if (sectionPattern.test(title)) {
          title = title.replace(sectionPattern, "").trim();
          title = title
            .replace(/^Section\s*[:\-]?\s*/i, "")
            .replace(/^\d+(\.\d+)?\s*/, ""); // Remove "Section" and leading digits
        } else if (annexPattern.test(title)) {
          title = title.replace(annexPattern, "").trim();
          title = title.replace(/^Annex\s*[:\-]?\s*/i, ""); // Remove "Annex"
        }

        return {
          title: title,
          points: lines
            .slice(1)
            .map((line) => line.replace(/^\d+(\.\d+)?\./, "").trim()),
        };
      }

      return {
        title: `Section ${index + 1}`,
        points: lines.slice(1).map((line) => line.trim()),
      };
    });
  }

  // Default case (if the response doesn't match either format)
  else {
    console.error("Unknown response format");
    return [];
  }
};

export const extractAnswerAndExplanation = (questions, dataValue) => {
  return (
    dataValue &&
    dataValue?.map((item, index) => {
      const normalizedItem = item.toLowerCase(); // Normalize the string to lowercase

      // Check if it contains "yes" or "no" (in any capitalization)
      let answer = "";
      let explanation = "";

      // if (normalizedItem.includes("yes")) {
      //   answer = "YES";
      //   explanation = item.replace(/\byes\b/i, "").trim(); // Remove only the first "yes" (case insensitive)
      // } else if (normalizedItem.includes("no")) {
      //   answer = "NO";
      //   explanation = item.replace(/\bno\b/i, "").trim(); // Remove only the first "no" (case insensitive)
      // }

      // Check if it starts with YES or NO
      if (/^yes\b/i.test(normalizedItem)) {
        answer = "YES";
        explanation = normalizedItem.replace(/^yes\b/i, "").trim();
      } else if (/^no\b/i.test(normalizedItem)) {
        answer = "NO";
        explanation = normalizedItem.replace(/^no\b/i, "").trim();
      } else {
        answer = "NO";
        explanation = normalizedItem.replace(/^no\b/i, "").trim();
      }

      // Remove unwanted punctuation (., -) from the start or end of the explanation
      explanation = explanation.replace(/[.,-]+$/, "").trim(); // Remove trailing punctuation
      explanation = explanation.replace(/^[.,-]+/, "").trim(); // Remove leading punctuation

      // Combine the question with the answer and explanation
      return {
        question: questions[index], // Add the corresponding question
        answer,
        explanation,
      };
    })
  );
};

function cleanTitle(text, keyword, preserveLabel = false) {
  let cleaned = text
    .replace(new RegExp(`^(${keyword})\\s*[:\\-]?\\s*`, "i"), "") // Remove keyword label
    .replace(/^\d+(\.\d+)?\s*/, "") // Remove leading numbers
    .replace(/[^a-zA-Z0-9\s]/g, "") // Remove special characters
    .trim();

  return preserveLabel ? `${keyword}: ${cleaned}` : cleaned;
}

let sectionDataBeforeEdit = [];
let complienceDataBeforeEdit = [];

const FileCard = ({
  fileName,
  onDownload,
  onView,
  apiResponse,
  data,
  data1,
  projectData,
  updateProjectComplianceAssessment,
  updateProjectChecklist,
}) => {
  // Modal open state and active tab state
  const [openModal, setOpenModal] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);

  const [sections, setSections] = useState([]);
  const [assessmentData, setAssessmentData] = useState([]);
  const [complianceData, setComplianceData] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [dirtyFileName, setDirtyFileName] = React.useState(null);

  apiResponse = data;
  const userdetails = JSON.parse(sessionStorage.getItem("userDetails"));
  const userEmail = userdetails?.[0]?.user_email;

  useEffect(() => {
    if (apiResponse) {
      const parsedSections = parseApiResponse(apiResponse);
      setSections(parsedSections);
      let array = [];
      parsedSections?.map((item) => {
        item.points?.map((line) => {
          array.push(line);
        });
      });

      const complianceResponse = data1?.split("|,|");

      setAssessmentData(array);
      setComplianceData(extractAnswerAndExplanation(array, complianceResponse));
    }
  }, [apiResponse, data1]);

  const handleExplanationChange = (index, value) => {
    const updatedData = [...complianceData];
    updatedData[index].explanation = value;
    setComplianceData(updatedData);
  };

  const handleAnswerChange = (index, value) => {
    const updated = [...complianceData];
    // updated[index].answer = value;
    updated[index].answer = value ? "YES" : "NO";
    setComplianceData(updated);
  };

  const handleTabTitleChange = (index, newTitle) => {
    const updated = [...sections];
    updated[index].title = newTitle;
    setSections(updated);
  };

  const handlePointChange = (tabIndex, pointIndex, newText) => {
    const updated = [...sections];
    updated[tabIndex].points[pointIndex] = newText;
    setSections(updated);
  };

  // const handleAddTab = () => {
  //   setSections([
  //     ...sections,
  //     {
  //       title: "",
  //       points: [""],
  //     },
  //   ]);
  //   setActiveTab(sections.length); // focus on new tab
  // };

  const handleAddTab = () => {
    const updated = [...sections, { title: "", points: [""] }];
    setSections(updated);
    setActiveTab(updated.length); // focus on the newly added tab
  };

  const handleAddPoint = (tabIndex) => {
    const updated = [...sections];
    updated[tabIndex].points.push("");
    setSections(updated);
  };

  const handleDeleteTab = (index) => {
    const updated = [...sections];
    updated.splice(index, 1);
    setSections(updated);

    // Reset activeTab if needed
    if (activeTab >= updated.length) {
      setActiveTab(updated.length - 1);
    }
  };
  const handleDeleteContentItem = (sectionIndex, pointIndex) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].points.splice(pointIndex, 1);
    setSections(updatedSections);
  };

  const handleSaveAll = (fileName) => {
    if (fileName === PROJECT_DETAIL_PAGE.ASSESSMENT_REPORT) {
      const complianceAssessment = complianceData
        .map((item) => `${item.answer}, ${item.explanation}`)
        .join("|,|");

      const payload = {
        project_id: projectData.project_id,
        complianceAssessment: complianceAssessment,
      };
      updateProjectComplianceAssessment(payload);
    } else if (fileName === PROJECT_DETAIL_PAGE.CHECKLIST_REPORT) {
      const checklist = formatSectionsToList(sections);

      const payload = {
        project_id: projectData.project_id,
        checkListResponse: {
          checklist: checklist,
        },
      };
      updateProjectChecklist(payload);
    }
  };

  const formatSectionsToList = (sections) => {
    const result = [];

    sections.forEach((section) => {
      const title = section.title?.trim();

      // Skip if title is empty
      if (!title) return;

      // Add formatted title
      if (title.toLowerCase().startsWith("title")) {
        result.push(`**${title}**`);
      } else {
        result.push(`**Section : ${title}**`);
      }

      // Add only non-empty points
      (section.points || []).forEach((point, idx) => {
        if (point && point.trim()) {
          result.push(`${idx + 1}. ${point.trim()}`);
        }
      });
    });

    return result;
  };

  // Function to handle opening the modal
  const handleOpenModal = () => {
    complienceDataBeforeEdit = _.cloneDeep(complianceData);
    sectionDataBeforeEdit = _.cloneDeep(sections);
    setOpenModal(true);
  };

  // Function to handle closing the modal
  const handleCloseModal = (fileName) => {
    let isEqual = true;

    if (fileName === PROJECT_DETAIL_PAGE.CHECKLIST_REPORT) {
      isEqual = _.isEqual(sections, sectionDataBeforeEdit);
    }

    if (fileName === PROJECT_DETAIL_PAGE.ASSESSMENT_REPORT) {
      isEqual = _.isEqual(complianceData, complienceDataBeforeEdit);
    }

    if (!isEqual) {
      setDirtyFileName(fileName);
      setShowConfirmDialog(true); // Show confirmation popover/dialog
      return;
    }

    setOpenModal(false);
  };

  const handleConfirmClose = (shouldSave) => {
    if (shouldSave) {
      handleSaveAll(dirtyFileName);
    } else {
      // Revert data back to original
      if (dirtyFileName === PROJECT_DETAIL_PAGE.CHECKLIST_REPORT) {
        setSections(_.cloneDeep(sectionDataBeforeEdit));
      }

      if (dirtyFileName === PROJECT_DETAIL_PAGE.ASSESSMENT_REPORT) {
        // If you're using a setter, use that here
        setComplianceData(_.cloneDeep(complienceDataBeforeEdit));
      }
    }

    setShowConfirmDialog(false);
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

  const fetchOrgDetails = async (id) => {
    try {
      const response = await OrganisationApiService.organisationDetails(id);
      return response?.data?.details?.[0]; // Returning the relevant organization details
    } catch (errResponse) {
      console.log("Error fetching org details:", errResponse);
      return null; // Return null if there's an error to handle gracefully
    }
  };

  const getFormattedDate = () => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    const date = new Date();
    return date.toLocaleDateString("en-US", options);
  };

  const downloadChecklistFile = async () => {
    const OrgData = await fetchOrgDetails(projectData?.org_id);
    const imagePath = logo;

    let imageBlob;
    try {
      const response = await fetch(imagePath);
      if (!response.ok) throw new Error("Image fetch failed");
      imageBlob = await response.blob();
    } catch (error) {
      console.error("Error fetching image:", error);
      imageBlob = null;
    }

    const imageLogo = imageBlob
      ? new Paragraph({
          children: [
            new ImageRun({
              data: imageBlob, // Pass the image blob directly
              transformation: {
                width: 100, // Set the desired width of the image
                height: 100, // Set the desired height of the image
              },
            }),
          ],
          alignment: AlignmentType.CENTER, // Center the image on the page
          spacing: { after: 200 }, // Add space after the image
        })
      : null;

    const orgLogo = new Paragraph({
      children: [
        OrgData?.org_logo
          ? new ImageRun({
              data: OrgData?.org_logo || "", // Pass the image blob directly
              transformation: {
                width: 100, // Set the desired width of the image
                height: 100, // Set the desired height of the image
              },
            })
          : "",
      ],
      alignment: AlignmentType.CENTER, // Center the image on the page
      spacing: { after: 200 }, // Add space after the image
    });

    const inviteData = [];
    projectData?.invite_members?.map((idata) => {
      inviteData.push(idata?.user_name);
    });

    const extraInfo = {
      projectName: projectData?.project_name,
      projectNo: projectData?.project_no,
      regulatory: projectData?.regulatory_standard,
      projectDescription: projectData?.project_description,
      invitedMembers: inviteData.join(","),
      organizationName: projectData?.org_name,
      city: OrgData?.org_address?.city,
      country: OrgData?.org_address?.country,
      street: OrgData?.org_address?.street,
      zipCode: OrgData?.org_address?.zip,
      // email: OrgData?.contact_json?.primary_contact?.email,
      email: userEmail,
      submittedByName: "Regunova AI",
      submittedByZip: "PO Box 375,",
      submittedByAddress: "Frisco, TX 75034, US",
      submittedByEmail: "Email support@regunova.ai",
    };

    const content = data; // Assuming this is your existing content

    // Split content by new lines, preserving individual lines
    const contentLines = content.checklist;

    // Create the "Prepared for" details section with label-value pairs

    const projectParagraphs = [
      { label: "Project Name:", value: extraInfo.projectName },
      { label: "Date:", value: getFormattedDate() },
      { label: "Project No:", value: extraInfo.projectNo },
      { label: "Regulatory Standards:", value: extraInfo.regulatory },
      { label: "Project Description:", value: extraInfo.projectDescription },
      { label: "Invited Members:", value: extraInfo.invitedMembers },
    ];

    const preparedForParagraphs = [
      { label: "Organization Name:", value: extraInfo.organizationName },
      {
        label: "City, State, Zip:",
        value: `${extraInfo.street} ${extraInfo.city}, ${extraInfo.country} ${extraInfo.zipCode}`,
      },
      { label: "Email:", value: extraInfo.email },
    ];

    const submittedByParagraphs = [
      { label: "Organization Name:", value: extraInfo.submittedByName },
      { label: "submittedByZip:", value: extraInfo.submittedByZip },
      { label: "submittedByAddress:", value: extraInfo.submittedByAddress },
      { label: "submittedByEmail:", value: extraInfo.submittedByEmail },
    ];

    const projectContent = projectParagraphs.map((info) => {
      return new Paragraph({
        children: [
          new TextRun({
            text: `${info.label} ${info.value}`,
          }),
        ],
        alignment: AlignmentType.LEFT,
        spacing: { after: 100 }, // Add space after each line
      });
    });

    // Generate paragraphs for the "Prepared for" section
    const preparedForContent = preparedForParagraphs.map((info) => {
      return new Paragraph({
        children: [
          new TextRun({
            text: `${info.value}`,
          }),
        ],
        alignment: AlignmentType.LEFT,
        spacing: { after: 100 }, // Add space after each line
      });
    });

    const submittedByContent = submittedByParagraphs.map((info) => {
      return new Paragraph({
        children: [
          new TextRun({
            text: `${info.value}`,
          }),
        ],
        alignment: AlignmentType.LEFT,
        spacing: { after: 100 }, // Add space after each line
      });
    });

    // Create the table with extra information (project details)
    const extraInfoTable = new DocxTable({
      rows: [
        new DocxTableRow({
          children: [
            new DocxTableCell({
              children: [new Paragraph("Project Name:")],
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
              children: [new Paragraph("Project No.:")],
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
              children: [new Paragraph("Regulatory:")],
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
              children: [new Paragraph("Invited Members:")],
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

    const preparedforTable = new DocxTable({
      properties: {
        tableLayout: "fixed", // Ensures fixed width of columns
      },
      rows: [
        // Table header row
        new DocxTableRow({
          children: [
            new DocxTableCell({
              children: [...preparedForContent],
              width: { size: 50, type: "pct" },
              verticalAlign: "center",
              borders: {
                top: { style: "none", size: 0 },
                left: { style: "none", size: 0 },
                bottom: { style: "none", size: 0 },
                right: { style: "none", size: 0 },
              },
            }),
            new DocxTableCell({
              children: [orgLogo || ""],
              width: { size: 20, type: "pct" },
              verticalAlign: "center",
              borders: {
                top: { style: "none", size: 0 },
                left: { style: "none", size: 0 },
                bottom: { style: "none", size: 0 },
                right: { style: "none", size: 0 },
              },
            }),
          ],
        }),
      ],
    });

    const submittedbyTable = new DocxTable({
      properties: {
        tableLayout: "fixed", // Ensures fixed width of columns
      },
      rows: [
        // Table header row
        new DocxTableRow({
          children: [
            new DocxTableCell({
              children: [...submittedByContent],
              width: { size: 50, type: "pct" },
              verticalAlign: "center",
              borders: {
                top: { style: "none", size: 0 },
                left: { style: "none", size: 0 },
                bottom: { style: "none", size: 0 },
                right: { style: "none", size: 0 },
              },
            }),
            new DocxTableCell({
              children: [imageLogo],
              width: { size: 20, type: "pct" },
              verticalAlign: "center",
              borders: {
                top: { style: "none", size: 0 },
                left: { style: "none", size: 0 },
                bottom: { style: "none", size: 0 },
                right: { style: "none", size: 0 },
              },
            }),
          ],
        }),
      ],
    });

    // Compliance data table (only if complianceData exists)
    const complianceTable =
      complianceData?.length > 0
        ? new DocxTable({
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
              ...complianceData?.map(
                (item) =>
                  new DocxTableRow({
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
                  })
              ),
            ],
          })
        : null; // Only create table if complianceData exists

    const header = new Header({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: `${extraInfo.projectName} - Page `,
            }),
            new TextRun({
              text: "PAGE ", // This is the placeholder for the page number
              fieldCode: "PAGE", // This field code is used for page number
              font: "Times New Roman", // Set the font of the page number
              size: 24, // Font size for the page number
              bold: true, // Make the page number bold (optional)
            }),
          ],
          alignment: AlignmentType.LEFT, // Align to the left
        }),
      ],
    });

    // Create a new document
    const doc =
      fileName === PROJECT_DETAIL_PAGE.ASSESSMENT_REPORT
        ? new Document({
            sections: [
              {
                properties: {
                  header: header, // Define the header with project name and page number
                },
                children: [
                  // Add content sections
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "ASSESSMENT REPORT",
                        size: 60, // Size 48 (larger than normal text size)
                        bold: true,
                      }),
                    ],
                    spacing: { after: 1200, before: 1200 },
                    alignment: AlignmentType.CENTER,
                  }),

                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "PROJECT DETAILS:",
                        size: 30, // Size 48 (larger than normal text size)
                        bold: true,
                      }),
                    ],
                    spacing: { after: 200 },
                  }),

                  ...projectContent,

                  new Paragraph({
                    children: [],
                    spacing: { after: 600 },
                  }),

                  // "Prepared for" details
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "PREPARED FOR:",
                        size: 30, // Size 48 (larger than normal text size)
                        bold: true,
                      }),
                    ],
                    spacing: { after: 200 },
                  }),
                  // ...preparedForContent,
                  preparedforTable,

                  new Paragraph({
                    children: [],
                    spacing: { after: 600 },
                  }),

                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "PREPARED BY:",
                        size: 30, // Size 48 (larger than normal text size)
                        bold: true,
                      }),
                    ],
                    spacing: { after: 200 },
                  }),
                  // ...submittedByContent,

                  submittedbyTable,

                  // imageParagraph,

                  // Add a page break after the table (move to the next page)
                  new Paragraph({
                    children: [],
                    pageBreakBefore: true,
                  }),

                  // Loop through content lines and add each one as a separate TextRun
                  complianceTable,
                ],
              },
            ],
          })
        : new Document({
            sections: [
              {
                properties: {
                  header: header,
                },
                children: [
                  // Add header with project name and page number

                  // Add content sections
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "CHECKLIST REPORT",
                        size: 60, // Size 48 (larger than normal text size)
                        bold: true,
                      }),
                    ],
                    spacing: { after: 1200, before: 1200 },
                    alignment: AlignmentType.CENTER,
                  }),

                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "CHECKLIST DETAILS:",
                        size: 30, // Size 48 (larger than normal text size)
                        bold: true,
                      }),
                    ],
                    spacing: { after: 200 },
                  }),

                  ...projectContent,

                  new Paragraph({
                    children: [],
                    spacing: { after: 600 },
                  }),

                  // "Prepared for" details
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "PREPARED FOR:",
                        size: 30, // Size 48 (larger than normal text size)
                        bold: true,
                      }),
                    ],
                    spacing: { after: 200 },
                  }),
                  // ...preparedForContent,
                  preparedforTable,

                  new Paragraph({
                    children: [],
                    spacing: { after: 600 },
                  }),

                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "PREPARED BY:",
                        size: 30, // Size 48 (larger than normal text size)
                        bold: true,
                      }),
                    ],
                    spacing: { after: 200 },
                  }),
                  // ...submittedByContent,
                  submittedbyTable,

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
                          text: line
                            ?.replace("**", "")
                            ?.replace("---", "")
                            ?.replace("###", "")
                            ?.replace("**", ""),
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
      saveAs(blob, `${fileName}.docx`);
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
      <Card
        sx={{
          width: 200,
          textAlign: "center",
          boxShadow: 3,
          marginRight: "20px",
        }}
      >
        <CardContent style={{ padding: "0px" }}>
          {/* File Icon at the top */}
          <Box sx={{ marginBottom: 1 }}>
            {/* File Icon, adjust based on file type */}
            <img
              src={
                fileName === PROJECT_DETAIL_PAGE.ASSESSMENT_REPORT
                  ? assessment
                  : checklist
              }
              width="150"
              alt="File"
            />
          </Box>

          {/* File Name */}
          <Typography variant="h5" sx={{ marginBottom: 1 }}>
            {fileName}
          </Typography>
        </CardContent>

        {/* Action Buttons (Download and View) */}
        <CardActions sx={{ justifyContent: "center" }}>
          <IconButton
            color="primary"
            onClick={downloadChecklistFile}
            aria-label="download"
          >
            <DownloadOutlined />
          </IconButton>
          <IconButton
            color="primary"
            onClick={handleOpenModal}
            aria-label="view"
          >
            <EyeOutlined />
          </IconButton>
        </CardActions>
      </Card>

      {/* Modal Popup */}
      <DocumentDialog
        open={openModal}
        onClose={handleCloseModal}
        fileName={fileName}
        editMode={editMode}
        setEditMode={setEditMode}
        complianceData={complianceData}
        sections={sections}
        setSections={setSections}
        handleTabTitleChange={handleTabTitleChange}
        handleAnswerChange={handleAnswerChange}
        handleExplanationChange={handleExplanationChange}
        renderAnswerIcon={renderAnswerIcon}
        handleAddTab={handleAddTab}
        handleAddPoint={handleAddPoint}
        handlePointChange={handlePointChange}
        handleSaveAll={handleSaveAll}
      />

      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        style={{ zIndex: 9999999 }}
      >
        <DialogTitle>Unsaved Changes</DialogTitle>
        <DialogContent>
          <Typography>
            You’ve got unsaved changes. Wanna save them before closing?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleConfirmClose(false)} color="secondary">
            No, Discard
          </Button>
          <Button onClick={() => handleConfirmClose(true)} color="primary">
            Yes, Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FileCard;
