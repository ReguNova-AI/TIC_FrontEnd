import React, { useState, useEffect } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import PropTypes from "prop-types";
import { Empty, message } from "antd";
import RiskAssessmentTab from "./RiskAssessmentTab";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { useParameterManager } from "./useParameterManager";
import { ProjectApiService } from "services/api/ProjectAPIService";
import { useExtractedInfo, useRiskSummary } from "./useProjectQueries";
import { useDataQuery } from "../../contexts/DataQueryContext";
import DataExtractionLoader_Timer, { clearExtractionTimer, markExtractionStart } from "components/DataExtractionLoader_Timer";
import { apiPath } from "../../config";

const documentTypes = ["short", "long", "int", "boolean", "array", "object"];

// ── Section heading with left accent bar ──────────────────────────────────────
const SectionHeading = ({ children, action }) => (
  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box sx={{ width: 3, height: 20, bgcolor: "#5B0429", borderRadius: "2px", flexShrink: 0 }} />
      <Typography sx={{ fontWeight: 700, fontSize: "15px", color: "#1a1a1a" }}>
        {children}
      </Typography>
    </Box>
    {action}
  </Box>
);

// ── Previously assessed report row ────────────────────────────────────────────
const ReportRow = ({ entry, onDownload }) => {
  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const label =
    entry?.changes?.riskSummaryRun ||
    entry?.changes?.assessmentRun ||
    "Assessment Report";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        py: 1.5,
        border: "1px solid #e8e8e8",
        borderRadius: "4px",
        bgcolor: "#fafafa",
        "&:hover": { bgcolor: "#f5f5f5" },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <ArticleOutlinedIcon sx={{ fontSize: 20, color: "#5B0429" }} />
        <Box>
          <Typography sx={{ fontSize: "14px", fontWeight: 500, color: "#222" }}>
            {typeof label === "string" ? label : "Assessment Report"}
          </Typography>
          <Typography sx={{ fontSize: "12px", color: "#888", mt: 0.25 }}>
            {formatDate(entry?.date)} · by {entry?.changedby || "System"}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 15 }} />}
          sx={{
            textTransform: "none",
            fontSize: "12px",
            borderRadius: "20px",
            borderColor: "#e0e0e0",
            color: "#555",
            fontWeight: 500,
            px: 1.5,
            "&:hover": { borderColor: "#5B0429", color: "#5B0429" },
          }}
        >
          View
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<DownloadIcon sx={{ fontSize: 15 }} />}
          onClick={() => onDownload && onDownload(entry)}
          sx={{
            textTransform: "none",
            fontSize: "12px",
            borderRadius: "20px",
            borderColor: "#e0e0e0",
            color: "#555",
            fontWeight: 500,
            px: 1.5,
            "&:hover": { borderColor: "#5B0429", color: "#5B0429" },
          }}
        >
          Download
        </Button>
      </Box>
    </Box>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const SummaryReportTab = ({ projectData }) => {
  const { parameters, handleAddParameters, handleDeleteParameter } = useParameterManager();

  const {
    isExtracting,
    isProjectExtracting,
    startDataExtraction,
    stopDataExtraction,
    setCsvParameters,
    getCsvParameters,
    setExtractedParameters,
    getExtractedParameters,
    setShowResults,
    getShowResults,
    clearProjectData,
  } = useDataQuery();

  const projectId = projectData?.project_id;
  const csvParameters = getCsvParameters(projectId);
  const extractedParameters = getExtractedParameters(projectId);
  const [localShowResults, setLocalShowResults] = useState(false);

  useEffect(() => {
    const globalShowResults = getShowResults(projectId);
    setLocalShowResults(globalShowResults);
  }, [projectId, extractedParameters]);

  const showResults = localShowResults;

  // Fetch extracted info history
  const {
    data: extractedInfo,
    isLoading: isLoadingExtractedInfo,
    refetch: refetchExtractedInfo,
  } = useExtractedInfo(projectData?.project_id);

  // Fetch risk summary for download
  const { data: riskSummary } = useRiskSummary(projectId);

  const handleDownloadReport = () => {
    if (!riskSummary?.doc_path_aws) return;
    const link = document.createElement("a");
    link.href = `${apiPath}/${riskSummary.doc_path_aws}`;
    link.setAttribute("download", riskSummary.doc_path_aws.split("/").pop());
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  };

  // CSV editing
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editingValue, setEditingValue] = useState({ name: "", type: "" });

  const handleCsvFileUpload = async (event) => {
    return new Promise((resolve, reject) => {
      const file = event.target.files[0];
      if (file && file.type === "text/csv") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const csv = e.target.result;
          const lines = csv.split("\n");
          const headers = lines[0].split(",");
          if (headers.length >= 2 && headers[0].toLowerCase().includes("parameter") && headers[1].toLowerCase().includes("type")) {
            const csvData = [];
            for (let i = 1; i < lines.length; i++) {
              const data = lines[i].split(",");
              if (data.length >= 2 && data[0].trim() && data[1].trim()) {
                csvData.push({ name: data[0].trim(), type: data[1].trim() });
              }
            }
            setCsvParameters(projectId, csvData);
            setLocalShowResults(false);
            setTimeout(() => resolve({ success: true, message: `Loaded ${csvData.length} parameters`, data: csvData }), 50);
          } else {
            reject({ success: false, message: "Invalid CSV format. Expected columns: Parameter, Type" });
          }
        };
        reader.readAsText(file);
      } else {
        reject({ success: false, message: "Please select a valid CSV file" });
      }
    });
  };

  const onCsvFileUpload = async (event) => {
    if (!event.target.files || event.target.files.length === 0) return;
    try {
      const result = await handleCsvFileUpload(event);
      if (result?.success) message.success(result.message);
    } catch (error) {
      message.error(error.message || "Failed to upload CSV file");
    } finally {
      event.target.value = "";
    }
  };

  const handleEditParameter = (index) => {
    setEditingIndex(index);
    setEditingValue({ name: csvParameters[index].name, type: csvParameters[index].type });
  };

  const handleSaveEdit = () => {
    if (!editingValue.name || !editingValue.type) return;
    const updatedParams = [...csvParameters];
    updatedParams[editingIndex] = { ...editingValue };
    setCsvParameters(projectId, updatedParams);
    setEditingIndex(-1);
    setEditingValue({ name: "", type: "" });
  };

  const handleCancelEdit = () => { setEditingIndex(-1); setEditingValue({ name: "", type: "" }); };

  const handleDeleteCsvParameter = (index) => {
    setCsvParameters(projectId, csvParameters.filter((_, i) => i !== index));
  };

  const handleAddNewParameter = () => {
    const newParam = { name: "", type: "short" };
    const updatedParams = [...csvParameters, newParam];
    setCsvParameters(projectId, updatedParams);
    setEditingIndex(updatedParams.length - 1);
    setEditingValue(newParam);
  };

  const updateEditingValue = (field, value) => {
    setEditingValue((prev) => ({ ...prev, [field]: value }));
  };

  const downloadSampleFile = () => {
    const sampleCsvData = `Parameter,Type\nContract Price,short\nOwner name,short\nDelivery Requirements,long\nLimit on delay liquidated damages,short\nPayment schedule,long`;
    const blob = new Blob([sampleCsvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "parameter_sample.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExtractParameters = async () => {
    if (csvParameters.length === 0) return;
    const validParameters = csvParameters.filter((p) => p.name && p.name.trim() !== "");
    if (validParameters.length === 0) { message.error("Please add at least one valid parameter."); return; }

    markExtractionStart(projectId);
    try {
      startDataExtraction(projectId, projectData?.project_name || "Project");
      const formattedParameters = validParameters.map((p) => ({ Parameter: p.name, Type: p.type }));
      const response = await ProjectApiService.extractParameters({ project_id: projectId, parameters: formattedParameters });

      let extractedData = {};
      if (response.data && Array.isArray(response.data)) {
        response.data.forEach((item) => {
          if (item.Parameter) {
            extractedData[item.Parameter] = { answer: item.Answer || "No answer available", sourceDocument: item["Source Document"] || "Unknown source" };
          }
        });
      } else {
        extractedData = response.data || {};
      }

      setExtractedParameters(projectId, extractedData);
      setShowResults(projectId, true);
      setLocalShowResults(true);
      stopDataExtraction(projectId, projectData?.project_name, "Completed", true);
      refetchExtractedInfo();
    } catch (error) {
      console.error("Extraction failed:", error);
      stopDataExtraction(projectId, projectData?.project_name, "Failed", false);
    } finally {
      clearExtractionTimer(projectId);
    }
  };

  // History entries that represent assessment reports
  const reportHistory = (projectData?.history || []).filter(
    (entry) => entry?.changes?.riskSummaryRun || entry?.changes?.assessmentRun
  );

  // All history for fallback
  const allHistory = projectData?.history || [];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <DataExtractionLoader_Timer projectId={projectId} variant="progress" />

      {/* ── Latest Report ──────────────────────────────────────── */}
      <Box>
        <SectionHeading
          action={
            <Button
              size="small"
              variant="contained"
              startIcon={<DownloadIcon sx={{ fontSize: 15 }} />}
              disabled={!riskSummary?.doc_path_aws}
              onClick={handleDownloadReport}
              sx={{
                textTransform: "none",
                fontSize: "13px",
                borderRadius: "4px",
                bgcolor: "#5B0429",
                color: "#fff",
                fontWeight: 600,
                px: 2,
                py: 0.8,
                boxShadow: 'none',
                "&:hover": { bgcolor: "#4a0322", boxShadow: 'none' },
                "&.Mui-disabled": { bgcolor: "#e0e0e0", color: "#bbb" },
              }}
            >
              Download full report
            </Button>
          }
        >
          Latest Report
        </SectionHeading>

        {/* Blue-bordered risk summary preview */}
        <Box
          sx={{
            border: "2px solid #64B5F6",
            borderRadius: "4px",
            overflow: "hidden",
            bgcolor: "#fff",
          }}
        >
          <RiskAssessmentTab projectData={projectData} />
        </Box>
      </Box>

      {/* ── Previously assessed reports ─────────────────────────── */}
      <Box>
        <SectionHeading>Previously assessed reports</SectionHeading>

        {allHistory.length === 0 ? (
          <Box
            sx={{
              py: 4,
              textAlign: "center",
              bgcolor: "#fafafa",
              border: "1px dashed #e4e4e4",
              borderRadius: "4px",
            }}
          >
            <Typography sx={{ color: "#aaa", fontSize: "14px", fontStyle: "italic" }}>
              No previously assessed reports found.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {allHistory.map((entry, idx) => (
              <ReportRow
                key={idx}
                entry={entry}
                onDownload={handleDownloadReport}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* ── Data Query Extract (collapsible) ────────────────────── */}
      <Accordion
        disableGutters
        elevation={0}
        sx={{
          border: "1px solid #e4e4e4",
          borderRadius: "4px !important",
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            px: 2.5,
            minHeight: 48,
            "&.Mui-expanded": { minHeight: 48 },
            "& .MuiAccordionSummary-content": { my: 1.5 },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 3, height: 16, bgcolor: "#5B0429", borderRadius: "2px" }} />
            <Typography sx={{ fontWeight: 700, fontSize: "14px", color: "#1a1a1a" }}>
              Data Query Extract
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 2.5, pb: 3 }}>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography sx={{ fontSize: "14px", color: "#555" }}>
              Load parameters to extract specific answers from your AI assessment.
            </Typography>
            <Button
              variant="text"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={downloadSampleFile}
              sx={{ textTransform: "none", color: "#5B0429", fontSize: "13px" }}
            >
              Download Sample
            </Button>
          </Box>

          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <Button
              variant="outlined"
              component="label"
              size="small"
              startIcon={<UploadFileIcon />}
              sx={{ textTransform: "none", borderRadius: "20px", borderColor: "#5B0429", color: "#5B0429", fontSize: "13px" }}
            >
              Load CSV
              <input type="file" accept=".csv" hidden onChange={onCsvFileUpload} />
            </Button>
          </Box>

          {/* CSV Parameters table */}
          {csvParameters.length > 0 && !showResults && (
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                <Typography sx={{ fontWeight: 600, fontSize: "14px" }}>
                  CSV Parameters ({csvParameters.length} loaded)
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button variant="outlined" size="small" onClick={handleAddNewParameter} startIcon={<EditIcon />}
                    sx={{ textTransform: "none", borderRadius: "20px", fontSize: "13px" }}>
                    Add Parameter
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleExtractParameters}
                    disabled={isProjectExtracting(projectId) || csvParameters.length === 0}
                    startIcon={isProjectExtracting(projectId) ? <CircularProgress size={16} /> : null}
                    sx={{ textTransform: "none", borderRadius: "20px", bgcolor: "#5B0429", fontSize: "13px",
                      "&:hover": { bgcolor: "#4a0322" }, "&.Mui-disabled": { bgcolor: "#e0e0e0" } }}
                  >
                    {isProjectExtracting(projectId) ? "Extracting..." : "Extract Data"}
                  </Button>
                </Box>
              </Box>

              <TableContainer component={Paper} sx={{ borderRadius: "4px" }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: "#fafafa" }}>
                    <TableRow>
                      <TableCell><strong>Parameter Name</strong></TableCell>
                      <TableCell><strong>Type</strong></TableCell>
                      <TableCell align="center"><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {csvParameters.map((param, index) => (
                      <TableRow key={`csv-${index}`}>
                        <TableCell>
                          {editingIndex === index ? (
                            <TextField value={editingValue.name} onChange={(e) => updateEditingValue("name", e.target.value)}
                              size="small" fullWidth autoFocus />
                          ) : param.name}
                        </TableCell>
                        <TableCell>
                          {editingIndex === index ? (
                            <FormControl size="small" fullWidth>
                              <Select value={editingValue.type} onChange={(e) => updateEditingValue("type", e.target.value)}>
                                {documentTypes.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                              </Select>
                            </FormControl>
                          ) : param.type}
                        </TableCell>
                        <TableCell align="center">
                          {editingIndex === index ? (
                            <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                              <IconButton color="primary" onClick={handleSaveEdit} size="small"><SaveIcon /></IconButton>
                              <IconButton color="secondary" onClick={handleCancelEdit} size="small"><CancelIcon /></IconButton>
                            </Box>
                          ) : (
                            <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                              <IconButton color="primary" onClick={() => handleEditParameter(index)} size="small"
                                disabled={isProjectExtracting(projectId)}><EditIcon /></IconButton>
                              <IconButton color="error" onClick={() => handleDeleteCsvParameter(index)} size="small"
                                disabled={isProjectExtracting(projectId)}><DeleteIcon /></IconButton>
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

          {csvParameters.length === 0 && !showResults && (
            <Box sx={{ py: 3, textAlign: "center", bgcolor: "#fafafa", borderRadius: "4px", border: "1px dashed #e4e4e4" }}>
              <Typography sx={{ color: "#aaa", fontSize: "14px" }}>
                Upload a CSV file to load parameters for extraction.
              </Typography>
            </Box>
          )}

          {/* Extracted results */}
          {showResults && extractedParameters && (
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                <Typography sx={{ fontWeight: 600, fontSize: "14px" }}>Extracted Parameter Data</Typography>
                <Button variant="outlined" size="small"
                  onClick={() => { setShowResults(projectId, false); setLocalShowResults(false); setExtractedParameters(projectId, null); clearProjectData(projectId); }}
                  sx={{ textTransform: "none", borderRadius: "20px", borderColor: "#5B0429", color: "#5B0429", fontSize: "13px" }}>
                  Back to Input
                </Button>
              </Box>
              <TableContainer component={Paper} sx={{ borderRadius: "4px" }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: "#fafafa" }}>
                    <TableRow>
                      <TableCell><strong>Parameter</strong></TableCell>
                      <TableCell><strong>Type</strong></TableCell>
                      <TableCell><strong>Extracted Answer</strong></TableCell>
                      <TableCell><strong>Source</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(extractedParameters).map(([key, value], idx) => {
                      const paramData = csvParameters.find((p) => p.name === key);
                      return (
                        <TableRow key={`ep-${idx}`}>
                          <TableCell>{key}</TableCell>
                          <TableCell>{paramData?.type || "N/A"}</TableCell>
                          <TableCell><Box sx={{ maxWidth: 280, wordWrap: "break-word" }}>{typeof value === "object" ? value.answer || "No answer" : String(value)}</Box></TableCell>
                          <TableCell><Box sx={{ maxWidth: 180, wordWrap: "break-word", fontSize: "12px" }}>{typeof value === "object" ? value.sourceDocument || "Unknown" : "N/A"}</Box></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* History of extractions */}
          {extractedInfo && extractedInfo.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography sx={{ fontWeight: 600, fontSize: "14px", mb: 1 }}>Previously Extracted Data</Typography>
              {extractedInfo.map((item, idx) => (
                <Box key={idx} sx={{ mb: 1, p: 1.5, border: "1px solid #e8e8e8", borderRadius: "4px", bgcolor: "#fafafa" }}>
                  <Typography sx={{ fontSize: "12px", color: "#888", mb: 0.5 }}>
                    {new Date(item.date).toLocaleString()}
                  </Typography>
                  {Array.isArray(item.extracted_data) && item.extracted_data.slice(0, 3).map((d, di) => (
                    <Typography key={di} sx={{ fontSize: "13px", color: "#444" }}>
                      <strong>{d.Parameter}:</strong> {d.Answer}
                    </Typography>
                  ))}
                  {Array.isArray(item.extracted_data) && item.extracted_data.length > 3 && (
                    <Typography sx={{ fontSize: "12px", color: "#aaa" }}>+{item.extracted_data.length - 3} more...</Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

SummaryReportTab.propTypes = {
  projectData: PropTypes.object.isRequired,
};

export default SummaryReportTab;