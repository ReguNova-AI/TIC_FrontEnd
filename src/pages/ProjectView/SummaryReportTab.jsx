import React from "react";
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
} from "@mui/material";
import PropTypes from "prop-types";
import { Empty } from "antd";
import ParameterInput from "./ParameterInput";
import HistoryDetails from "./HistoryDetails";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { PROJECT_DETAIL_PAGE } from "shared/constants";
import { useParameterManager, useCsvManager } from "./useParameterManager";

const documentTypes = ["short", "long", "int", "boolean", "array", "object"];

const SummaryReportTab = ({ projectData, setSnackData }) => {
  const { parameters, handleAddParameters, handleDeleteParameter } = useParameterManager();

  const {
    csvParameters,
    editingIndex,
    editingValue,
    handleCsvFileUpload,
    handleEditParameter,
    handleSaveEdit,
    handleCancelEdit,
    handleDeleteCsvParameter,
    updateEditingValue,
  } = useCsvManager();

  const onCsvFileUpload = async (event) => {
    try {
      const result = await handleCsvFileUpload(event);
      setSnackData({
        show: true,
        message: result.message,
        type: "success",
      });
    } catch (error) {
      setSnackData({
        show: true,
        message: error.message,
        type: "error",
      });
    }
  };

  const onSaveEdit = () => {
    const result = handleSaveEdit();
    setSnackData({
      show: true,
      message: result.message,
      type: result.success ? "success" : "error",
    });
  };

  const onDeleteCsvParameter = (index) => {
    const result = handleDeleteCsvParameter(index);
    setSnackData({
      show: true,
      message: result.message,
      type: "success",
    });
  };

  const onAddParameter = (newParameter) => {
    const success = handleAddParameters(newParameter);
    if (success) {
      setSnackData({
        show: true,
        message: "Parameter added successfully",
        type: "success",
      });
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

    setSnackData({
      show: true,
      message: "Sample CSV file downloaded successfully",
      type: "success",
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* CSV Parameters Section */}
      <Box
        sx={{
          p: 3,

          borderRadius: "10px",
          border: "1px solid #e4e4e4",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", }}>
          <Typography style={{ fontSize: "18px" }}>
            {PROJECT_DETAIL_PAGE.CSV_PARAMETERS}
          </Typography>

          {/* CSV Upload and Download Buttons */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={downloadSampleFile}
            >
              Download Sample
            </Button>
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
        </Box>

        {/* Manual Input Section */}
        <ParameterInput
          onAddParameter={onAddParameter}
          documentTypes={documentTypes}
        />

        {/* CSV Parameters Table */}
        {csvParameters.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              CSV Parameters
            </Typography>

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
                  {csvParameters.map((param, index) => (
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
                  ))}
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

      {/* History Section */}
      <Box
        sx={{

          padding: "20px",
          borderRadius: "10px",
          border: "1px solid #e4e4e4",
        }}
      >
        <Typography style={{ fontSize: "18px" }}>
          {PROJECT_DETAIL_PAGE.HISTORY_DETAILS}
        </Typography>

        {projectData?.history !== undefined && projectData?.history !== null ? (
          <HistoryDetails data={projectData?.history} />
        ) : (
          <Empty />
        )}
      </Box>
    </Box>
  );
};

SummaryReportTab.propTypes = {
  projectData: PropTypes.object.isRequired,
  setSnackData: PropTypes.func.isRequired,
};

export default SummaryReportTab;