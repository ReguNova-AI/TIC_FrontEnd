import { brand } from "themes/theme/brand";
import React, { useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import GridOnOutlinedIcon from "@mui/icons-material/GridOnOutlined";
import CloseIcon from "@mui/icons-material/Close";
import SyncIcon from "@mui/icons-material/Sync";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { Modal, message } from "antd";
import { useProjectCreation } from "./ProjectCreationContext";
import { FileUploadApiService } from "services/api/FileUploadAPIService";

const MasterContractStep = () => {
  const { folders, masterContractFiles, setMasterContractFileForFolder, removeMasterContractFileForFolder } = useProjectCreation();
  const fileInputRefs = useRef({});
  const globalFileInputRef = useRef(null);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [replacingFolderId, setReplacingFolderId] = useState(null);

  // --- Scavenger & Proxy Download Logic ---

  const findBase64Recursive = (obj, path = "root") => {
    if (!obj) return null;
    if (typeof obj === "string") {
      if (obj.length > 100 && (obj.includes("base64,") || !/\s/.test(obj.substring(0, 50)))) {
        return obj;
      }
      return null;
    }
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        const found = findBase64Recursive(obj[i], `${path}[${i}]`);
        if (found) return found;
      }
      return null;
    }
    if (typeof obj === "object") {
      for (let key of Object.keys(obj)) {
        const found = findBase64Recursive(obj[key], `${path}.${key}`);
        if (found) return found;
      }
    }
    return null;
  };

  const proxyDownload = async (config) => {
    if (!config?.path) return;

    try {
      let key = config.path;
      if (key.startsWith("http")) {
        const parts = key.split("/");
        if (parts.length > 3) key = parts.slice(3).join("/");
      }

      const res = await FileUploadApiService.fileget({ imageKeys: [key] });

      let binaryBlob;
      const b64 = findBase64Recursive(res);

      if (b64) {
        let cleanB64 = b64;
        if (cleanB64.includes(",")) {
          const parts = cleanB64.split(",");
          cleanB64 = parts[parts.length - 1];
        }
        cleanB64 = cleanB64.replace(/\s/g, "");

        const ext = config.name.split(".").pop().toLowerCase();
        const mimeTypes = {
          xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          xls: "application/vnd.ms-excel",
          csv: "text/csv",
        };
        const mimeType = mimeTypes[ext] || "application/octet-stream";

        const dataUri = `data:${mimeType};base64,${cleanB64}`;
        binaryBlob = await (await fetch(dataUri)).blob();
      } else if (res instanceof Blob || res instanceof ArrayBuffer) {
        binaryBlob = res instanceof Blob ? res : new Blob([res]);
      } else {
        throw new Error("Could not find file data in response.");
      }

      const url = window.URL.createObjectURL(binaryBlob);
      const link = document.createElement("a");
      link.href = url;
      const downloadName = config.document_name || config.name;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        link.remove();
      }, 500);
    } catch (error) {
      console.error("[PROXY] Master contract download failed:", error);
      const link = document.createElement("a");
      link.href = config.path;
      link.setAttribute("download", config.name);
      link.setAttribute("target", "_blank");
      document.body.appendChild(link);
      link.click();
      setTimeout(() => link.remove(), 200);
      message.warning(`Proxy download failed. Attempted direct link for ${config.name}.`);
    }
  };

  // --- UI Handlers ---

  React.useEffect(() => {
    if (folders.length > 0) {
      setExpandedFolders((prev) => {
        const newExpanded = { ...prev };
        folders.forEach((f) => {
          if (newExpanded[f.id] === undefined) {
            newExpanded[f.id] = true;
          }
        });
        return newExpanded;
      });
    }
  }, [folders]);

  const handleGlobalUpload = () => {
    globalFileInputRef.current?.click();
  };

  const onGlobalFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && folders.length > 0) {
      const hasExistingContract = folders.some((folder) => masterContractFiles[folder.id]);
      setMasterContractFileForFolder(null, file, true, hasExistingContract);
    }
    e.target.value = "";
  };

  const handleFolderUpload = (folderId) => {
    setReplacingFolderId(null);
    fileInputRefs.current[folderId]?.click();
  };

  const handleReplaceContract = (folderId) => {
    setReplacingFolderId(folderId);
    fileInputRefs.current[folderId]?.click();
  };

  const onFolderFileChange = (folderId) => (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const isReplace = replacingFolderId === folderId;
      setMasterContractFileForFolder(folderId, file, false, isReplace);
    }
    setReplacingFolderId(null);
    e.target.value = "";
  };

  const handleDeleteContract = (folderId, contractName) => {
    Modal.confirm({
      title: "Delete Master Contract",
      content: `Are you sure you want to delete "${contractName}"? This action cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await removeMasterContractFileForFolder(folderId);
        } catch (error) {
          console.error("Delete failed:", error);
          message.error("Failed to delete master contract!");
        }
      },
    });
  };

  const toggleFolderExpand = (folderId) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "https://tic-uat.s3.us-east-1.amazonaws.com/Onshore+TSA%2BBOP%2BO%26M+Updated.docx";
    link.download = "Master_Contract_Sample_Template.docx";
    link.setAttribute("target", "_blank");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box>
      {/* ---- Action buttons ---- */}
      <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
        <Button
          variant="contained"
          startIcon={<UploadFileOutlinedIcon />}
          onClick={handleGlobalUpload}
          sx={{
            textTransform: "none",
            backgroundColor: brand.primary,
            borderRadius: "20px",
            "&:hover": { backgroundColor: brand.primaryHover },
          }}
        >
          Upload Master Contract
        </Button>
        <input
          ref={globalFileInputRef}
          type="file"
          hidden
          accept=".xlsx,.csv,.xls"
          onChange={onGlobalFileChange}
        />

        <Button
          variant="outlined"
          startIcon={<DownloadOutlinedIcon />}
          onClick={handleDownloadTemplate}
          sx={{
            textTransform: "none",
            borderColor: brand.primary,
            color: brand.primary,
            borderRadius: "20px",
            "&:hover": {
              borderColor: brand.primary,
              backgroundColor: "rgba(91,4,41,0.04)",
            },
          }}
        >
          Download Template
        </Button>
      </Box>

      {/* ---- Folder list with accordion ---- */}
      {folders.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 6,
            border: "2px dashed #e8e8e8",
            borderRadius: "8px",
          }}
        >
          <Typography variant="body2" sx={{ color: "#8c8c8c" }}>
            No folders available. Go back to Step 2 to create folders.
          </Typography>
        </Box>
      ) : (
        <Box>
          {folders.map((folder) => {
            const contract = masterContractFiles[folder.id];
            const hasContract = !!contract;
            const isExpanded = expandedFolders[folder.id];

            return (
              <Accordion
                key={folder.id}
                expanded={isExpanded}
                onChange={() => toggleFolderExpand(folder.id)}
                disableGutters
                sx={{
                  mb: 2,
                  borderRadius: "8px !important",
                  border: "1px solid #e8e8e8",
                  "&::before": { display: "none" },
                  boxShadow: "none",
                  overflow: "hidden",
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    backgroundColor: "#fafafa",
                    px: 2,
                    "& .MuiAccordionSummary-content": {
                      alignItems: "center",
                      gap: 1,
                    },
                  }}
                >
                  <FolderOutlinedIcon sx={{ color: brand.primary, mr: 1 }} />
                  <Typography sx={{ fontWeight: 600, flex: 1, color: "#262626" }}>
                    {folder.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#8c8c8c", mr: 2 }}>
                    {folder.files.length} file{folder.files.length !== 1 ? "s" : ""}
                  </Typography>

                  {hasContract && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mr: 2 }}>
                      <GridOnOutlinedIcon sx={{ fontSize: 16, color: brand.primary }} />
                      <Typography variant="caption" sx={{ color: "#262626", fontWeight: 500 }}>
                        {contract.name}
                      </Typography>
                    </Box>
                  )}
                </AccordionSummary>

                <AccordionDetails sx={{ p: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      pt: 2,
                      borderTop: "1px solid #f0f0f0",
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#262626" }}>
                      Master Contract File:
                    </Typography>

                    {hasContract ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <GridOnOutlinedIcon sx={{ fontSize: 18, color: brand.primary }} />
                          <Typography variant="body2" sx={{ color: "#262626", fontWeight: 500 }}>
                            {contract.document_name || contract.name}
                          </Typography>
                        </Box>

                        <Button
                          size="small"
                          variant="text"
                          startIcon={<SyncIcon sx={{ fontSize: 16 }} />}
                          onClick={() => handleReplaceContract(folder.id)}
                          sx={{
                            textTransform: "none",
                            color: brand.primary,
                            fontWeight: 500,
                            ml: 1,
                            "&:hover": { backgroundColor: "rgba(91,4,41,0.04)" },
                          }}
                        >
                          Replace
                        </Button>

                        <IconButton
                          size="small"
                          onClick={() => handleDeleteContract(folder.id, contract.name)}
                          sx={{
                            color: "#8c8c8c",
                            "&:hover": { color: "#ff4d4f", backgroundColor: "rgba(255,77,79,0.04)" },
                          }}
                        >
                          <CloseIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                    ) : (
                      <Button
                        size="small"
                        variant="text"
                        startIcon={<UploadFileOutlinedIcon sx={{ fontSize: 18 }} />}
                        onClick={() => handleFolderUpload(folder.id)}
                        sx={{
                          textTransform: "none",
                          color: brand.primary,
                          fontWeight: 500,
                          "&:hover": { backgroundColor: "rgba(91,4,41,0.04)" },
                        }}
                      >
                        Upload for this folder
                      </Button>
                    )}
                  </Box>

                  <input
                    ref={(el) => (fileInputRefs.current[folder.id] = el)}
                    type="file"
                    hidden
                    accept=".xlsx,.csv,.xls"
                    onChange={onFolderFileChange(folder.id)}
                  />
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default MasterContractStep;
