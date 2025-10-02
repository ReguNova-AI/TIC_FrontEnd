import React, { useState } from "react";
import {
  Typography,
  Box,
  Button,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import PropTypes from "prop-types";
import { Empty } from "antd";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ParameterInput from "./ParameterInput";
import HistoryDetails from "./HistoryDetails";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { PROJECT_DETAIL_PAGE } from "shared/constants";
import { useParameterManager } from "./useParameterManager";
import { ProjectApiService } from "services/api/ProjectAPIService";
import { useExtractedInfo } from "./useProjectQueries";

const documentTypes = ["short", "long", "int", "boolean", "array", "object"];

const SummaryReportTab = ({ projectData }) => {
  const { parameters, handleAddParameters, handleDeleteParameter } = useParameterManager();

  // State for parameter extraction
  const [extractedParameters, setExtractedParameters] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Accordion state - only one can be open at a time
  const [expandedAccordion, setExpandedAccordion] = useState(false);

  // Handle accordion change - only one can be open at a time
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  // Helper function to render extracted info as table data
  const renderExtractedInfoTable = (data) => {
    if (!data) return null;

    // Check if data is the expected format: array of objects with Parameter, Answer, Source Document
    if (Array.isArray(data) && data.length > 0 && data[0].Parameter !== undefined) {
      return (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Parameter</strong></TableCell>
                <TableCell><strong>Answer</strong></TableCell>
                <TableCell><strong>Source Document</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ fontWeight: 'medium', width: '25%' }}>
                    {item.Parameter || 'N/A'}
                  </TableCell>
                  <TableCell sx={{ width: '45%' }}>
                    <Box sx={{
                      wordWrap: 'break-word',
                      whiteSpace: 'pre-wrap',
                      maxWidth: '400px'
                    }}>
                      {item.Answer || 'No answer available'}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ width: '30%' }}>
                    <Box sx={{
                      wordWrap: 'break-word',
                      fontSize: '0.875rem',
                      maxWidth: '300px'
                    }}>
                      {item["Source Document"] ?
                        item["Source Document"].split('/').pop() : // Show only filename
                        'Unknown source'
                      }
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    // Fallback for other data formats
    let tableData = [];

    if (typeof data === 'string') {
      tableData = [{ key: 'Information', value: data }];
    } else if (Array.isArray(data)) {
      tableData = data.map((item, index) => ({
        key: `Item ${index + 1}`,
        value: typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)
      }));
    } else if (typeof data === 'object') {
      tableData = Object.entries(data).map(([key, value]) => ({
        key,
        value: typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
      }));
    }

    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Field</strong></TableCell>
              <TableCell><strong>Value</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row, index) => (
              <TableRow key={index}>
                <TableCell sx={{ fontWeight: 'medium', width: '30%' }}>
                  {row.key}
                </TableCell>
                <TableCell>
                  <Box sx={{
                    wordWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    maxWidth: '500px'
                  }}>
                    {row.value}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Use React Query hook to fetch extracted info
  const {
    data: extractedInfo,
    isLoading: isLoadingExtractedInfo,
    error: extractedInfoError
  } = useExtractedInfo(projectData?.project_id);

  // CSV Parameters state - moved to component level to prevent remounting issues
  const [csvParameters, setCsvParameters] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editingValue, setEditingValue] = useState({ name: "", type: "" });

  // CSV Upload handler
  const handleCsvFileUpload = async (event) => {
    return new Promise((resolve, reject) => {
      const file = event.target.files[0];
      if (file && file.type === "text/csv") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const csv = e.target.result;
          const lines = csv.split("\n");
          const headers = lines[0].split(",");

          if (
            headers.length >= 2 &&
            headers[0].toLowerCase().includes("parameter") &&
            headers[1].toLowerCase().includes("type")
          ) {
            const csvData = [];
            for (let i = 1; i < lines.length; i++) {
              const data = lines[i].split(",");
              if (data.length >= 2 && data[0].trim() && data[1].trim()) {
                csvData.push({
                  name: data[0].trim(),
                  type: data[1].trim(),
                });
              }
            }
            setCsvParameters([...csvData]);

            // Add a small delay to ensure state update is processed
            setTimeout(() => {
              resolve({
                success: true,
                message: `Successfully loaded ${csvData.length} parameters from CSV`,
                data: csvData,
              });
            }, 50);
          } else {
            reject({
              success: false,
              message: "Invalid CSV format. Expected columns: Parameter, Type",
            });
          }
        };
        reader.readAsText(file);
      } else {
        reject({
          success: false,
          message: "Please select a valid CSV file",
        });
      }
    });
  };

  // CSV Edit functions
  const handleEditParameter = (index) => {
    setEditingIndex(index);
    setEditingValue({
      name: csvParameters[index].name,
      type: csvParameters[index].type,
    });
  };

  const handleSaveEdit = () => {
    if (!editingValue.name || !editingValue.type) {
      return {
        success: false,
        message: "Parameter name and type are required",
      };
    }

    const updatedParams = [...csvParameters];
    updatedParams[editingIndex] = { ...editingValue };
    setCsvParameters(updatedParams);
    setEditingIndex(-1);
    setEditingValue({ name: "", type: "" });

    return {
      success: true,
      message: "Parameter updated successfully",
    };
  };

  const handleCancelEdit = () => {
    setEditingIndex(-1);
    setEditingValue({ name: "", type: "" });
  };

  const handleDeleteCsvParameter = (index) => {
    setCsvParameters((prev) => prev.filter((_, i) => i !== index));
    return {
      success: true,
      message: "Parameter deleted successfully",
    };
  };

  const updateEditingValue = (field, value) => {
    setEditingValue((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const onCsvFileUpload = async (event) => {
    // Prevent multiple uploads if files array is empty
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    try {
      await handleCsvFileUpload(event);
      // Handle success result if needed
    } catch (error) {
      console.error('CSV upload error:', error);
      // Handle error if needed
    }
  };

  const onSaveEdit = () => {
    handleSaveEdit();
  };

  const onDeleteCsvParameter = (index) => {
    handleDeleteCsvParameter(index);
  };

  const onAddParameter = (newParameter) => {
    const success = handleAddParameters(newParameter);
    if (success) {

    }
  };

  const downloadSampleFile = () => {
    // Sample CSV data based on the attached Paramfile.csv
    const sampleCsvData = `Parameter,Type
Contract Price,short
Owner name,short
Delivery Requirements,long
spare parts,long
Limitation of Liability,long
Limit on delay liquidated damages,short
Limitation of Liability,long
Payment schedule,long
Initial sworn statement,long`;

    const blob = new Blob([sampleCsvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'parameter_sample.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);


  };

  const handleExtractParameters = async () => {
    if (csvParameters.length === 0) {

      return;
    }

    setIsExtracting(true);

    try {
      // Convert csvParameters to the required format
      const formattedParameters = csvParameters.map(param => ({
        Parameter: param.name,
        Type: param.type
      }));

      const payload = {
        project_id: projectData?.project_id,
        parameters: formattedParameters
      };

      const response = await ProjectApiService.extractParameters(payload);

      // Handle the actual API response format
      let extractedData;
      if (response.data && Array.isArray(response.data)) {
        // Convert array format to object format for display
        extractedData = {};
        response.data.forEach(item => {
          if (item.Parameter) {
            extractedData[item.Parameter] = {
              answer: item.Answer || "No answer available",
              sourceDocument: item["Source Document"] || "Unknown source"
            };
          }
        });
      } else {
        extractedData = response.data || {};
      }

      setExtractedParameters(extractedData);
      setShowResults(true);


    } catch (error) {
      console.error("Parameter extraction failed:", error);

    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* CSV Parameters Section */}
      <Box
        sx={{
          px: 3,
          py: 1.5,

          borderRadius: "10px",
          border: "1px solid #e4e4e4",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", }}>
          <Typography style={{ fontSize: "18px" }}>
            Data Query
          </Typography>

          <Button
            variant="text"
            startIcon={<DownloadIcon />}
            onClick={downloadSampleFile}
          >
            Download Sample
          </Button>

        </Box>

        {/* Manual Input Section - Hide when showing results */}
        <Box sx={{ display: "flex", gap: 1 }}>

          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadFileIcon />}
          >
            Load CSV
            <input
              type="file"
              accept=".csv"
              hidden
              onChange={onCsvFileUpload}
            />
          </Button>
        </Box>

        {/* CSV Parameters Table - Hide when showing results */}
        {csvParameters.length > 0 && !showResults && (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", }}>
              <Typography variant="h6" gutterBottom>
                CSV Parameters ({csvParameters.length} parameters loaded)
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleExtractParameters}
                disabled={isExtracting || csvParameters.length === 0}
                startIcon={isExtracting ? <CircularProgress size={20} /> : null}
              >
                {isExtracting ? "Extracting..." : "Extract Data"}
              </Button>
            </Box>

            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Parameter Name</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {csvParameters.map((param, index) => {
                    return (
                      <TableRow key={`csv-param-${index}`}>
                        <TableCell>
                          {editingIndex === index ? (
                            <TextField
                              value={editingValue.name}
                              onChange={(e) => updateEditingValue('name', e.target.value)}
                              size="small"
                              fullWidth
                              autoFocus
                              variant="outlined"
                            />
                          ) : (
                            param.name
                          )}
                        </TableCell>
                        <TableCell>
                          {editingIndex === index ? (
                            <FormControl size="small" fullWidth variant="outlined">
                              <Select
                                value={editingValue.type}
                                onChange={(e) => updateEditingValue('type', e.target.value)}
                              >
                                {documentTypes.map((type) => (
                                  <MenuItem key={type} value={type}>
                                    {type}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          ) : (
                            param.type
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {editingIndex === index ? (
                            <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                              <IconButton
                                color="primary"
                                onClick={onSaveEdit}
                                size="small"
                              >
                                <SaveIcon />
                              </IconButton>
                              <IconButton
                                color="secondary"
                                onClick={handleCancelEdit}
                                size="small"
                              >
                                <CancelIcon />
                              </IconButton>
                            </Box>
                          ) : (
                            <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                              <IconButton
                                color="primary"
                                onClick={() => handleEditParameter(index)}
                                size="small"
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                color="error"
                                onClick={() => onDeleteCsvParameter(index)}
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>


          </Box>
        )}

        {/* Message when no CSV parameters are loaded */}
        {csvParameters.length === 0 && !showResults && (
          <Box sx={{ mt: 3, p: 2, bgcolor: '#f9f9f9', borderRadius: 1, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No CSV parameters loaded. Please upload a CSV file to see parameters here.
            </Typography>
          </Box>
        )}

        {/* Extracted Parameters Results */}
        {showResults && extractedParameters && (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", }}>
              <Typography variant="h6" gutterBottom>
                Extracted Parameter Data
              </Typography>
              <Button
                variant="outlined"
                onClick={() => {
                  setShowResults(false);
                  setExtractedParameters(null);
                }}
              >
                Back to Input Mode
              </Button>
            </Box>

            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Parameter Name</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Extracted Answer</strong></TableCell>
                    <TableCell><strong>Source Document</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(extractedParameters).map(([key, value], index) => {
                    // Find the corresponding parameter to get its type
                    const paramData = csvParameters.find(p => p.name === key);
                    return (
                      <TableRow key={`extracted-param-${index}`}>
                        <TableCell>{key}</TableCell>
                        <TableCell>{paramData?.type || 'N/A'}</TableCell>
                        <TableCell>
                          <Box sx={{ maxWidth: 300, wordWrap: 'break-word' }}>
                            {typeof value === 'object' ? value.answer || 'No answer' : String(value)}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ maxWidth: 200, wordWrap: 'break-word', fontSize: '0.875rem' }}>
                            {typeof value === 'object' ? value.sourceDocument || 'Unknown' : 'N/A'}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>


          </Box>
        )}

        {/* Manual Added Parameters List */}
        {parameters.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Manually Added Parameters
            </Typography>

            {parameters.map((param, index) => (
              <Box
                key={`manual-param-${index}-${param.name}`}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 1,
                  mb: 1,
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                }}
              >
                <Typography>
                  <strong>{param.name}</strong> ({param.type})
                </Typography>
                <IconButton
                  color="error"
                  onClick={() => handleDeleteParameter(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Extracted Information Section - Accordion */}
      <Accordion
        expanded={expandedAccordion === 'extractedInfo'}
        onChange={handleAccordionChange('extractedInfo')}
        sx={{
          borderRadius: "10px",
          border: "1px solid #e4e4e4",
          '&:before': {
            display: 'none',
          },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            backgroundColor: '#f9f9f9',
            borderRadius: "10px 10px 0 0",
            '&.Mui-expanded': {
              borderRadius: "10px 10px 0 0",
            }
          }}
        >
          <Typography style={{ fontSize: "18px", fontWeight: 'medium' }}>
            Previously Extracted Information
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: "20px" }}>
          {isLoadingExtractedInfo ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Loading extracted information...</Typography>
            </Box>
          ) : extractedInfoError ? (
            <Box sx={{ p: 2, bgcolor: '#fff3cd', borderRadius: 1, border: '1px solid #ffeaa7' }}>
              <Typography color="warning.main">
                Failed to load extracted information. Please try again later.
              </Typography>
            </Box>
          ) : extractedInfo ? (
            renderExtractedInfoTable(extractedInfo)
          ) : (
            <Typography>No extracted information available.</Typography>
          )}
        </AccordionDetails>
      </Accordion>

      {/* History Section - Accordion */}
      <Accordion
        expanded={expandedAccordion === 'history'}
        onChange={handleAccordionChange('history')}
        sx={{
          borderRadius: "10px",
          border: "1px solid #e4e4e4",
          '&:before': {
            display: 'none',
          },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            backgroundColor: '#f9f9f9',
            borderRadius: "10px 10px 0 0",
            '&.Mui-expanded': {
              borderRadius: "10px 10px 0 0",
            }
          }}
        >
          <Typography style={{ fontSize: "18px", fontWeight: 'medium' }}>
            {PROJECT_DETAIL_PAGE.HISTORY_DETAILS}
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: "20px" }}>
          {projectData?.history !== undefined && projectData?.history !== null ? (
            <HistoryDetails data={projectData?.history} />
          ) : (
            <Empty />
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

SummaryReportTab.propTypes = {
  projectData: PropTypes.object.isRequired
};

export default SummaryReportTab;