import { brand } from "themes/theme/brand";
import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import GridOnOutlinedIcon from "@mui/icons-material/GridOnOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useProjectCreation } from "./ProjectCreationContext";

// ---- Format bytes ----
const formatFileSize = (bytes) => {
  if (!bytes) return "";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// ---- Section wrapper with left accent (matches reviewscreen.jpg) ----
const ReviewSection = ({ title, children }) => (
  <Box sx={{ mb: 4 }}>
    {/* Section title with left maroon accent bar */}
    <Typography
      variant="subtitle1"
      sx={{
        fontWeight: 700,
        color: "#262626",
        mb: 2,
        pl: 1.5,
        borderLeft: `2px solid ${brand.primary}`,
      }}
    >
      {title}
    </Typography>
    {children}
    <Divider sx={{ mt: 3, borderColor: "rgba(91,4,41,0.1)" }} />
  </Box>
);

const ReviewAssessStep = () => {
  const { projectName, projectDesc, folders, configFiles, removeFileFromFolder } =
    useProjectCreation();

  return (
    <Box>
      {/* ---- 1. Project Details ---- */}
      <ReviewSection title="Project Details">
        <Box sx={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <Box sx={{ minWidth: 160 }}>
            <Typography
              variant="body2"
              sx={{ color: "#8c8c8c", mb: 0.5 }}
            >
              Project Name
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500, color: "#262626" }}>
              {projectName || "—"}
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{ color: "#8c8c8c", mb: 0.5 }}
            >
              Project Description
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#434343", lineHeight: 1.6 }}
            >
              {projectDesc || "—"}
            </Typography>
          </Box>
        </Box>
      </ReviewSection>

      {/* ---- 2. Documents Uploads ---- */}
      <ReviewSection title="Documents Uploads">
        {folders.length === 0 ? (
          <Typography variant="body2" sx={{ color: "#8c8c8c" }}>
            No documents uploaded.
          </Typography>
        ) : (
          folders.map((folder) => (
            <Accordion
              key={folder.id}
              defaultExpanded={false}
              disableGutters
              sx={{
                mb: 1,
                boxShadow: "none",
                borderRadius: "6px !important",
                border: "1px solid #f0f0f0",
                "&::before": { display: "none" },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  minHeight: 44,
                  "& .MuiAccordionSummary-content": {
                    alignItems: "center",
                    gap: 1,
                    my: 0.5,
                  },
                }}
              >
                <FolderOutlinedIcon
                  sx={{ color: brand.primary, fontSize: 20 }}
                />
                <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>
                  {folder.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#8c8c8c" }}
                >
                  {folder.files.length} file{folder.files.length !== 1 ? "s" : ""}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ py: 0, px: 2, pb: 1.5 }}>
                {folder.files.map((f) => (
                  <Box
                    key={f.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      py: 0.75,
                      px: 1,
                      borderRadius: "4px",
                      border: "1px solid #f5f5f5",
                      mb: 0.5,
                      "&:hover": { backgroundColor: "#fafafa" },
                    }}
                  >
                    <InsertDriveFileOutlinedIcon
                      sx={{ color: brand.primary, fontSize: 18 }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ flex: 1, color: "#434343" }}
                      noWrap
                    >
                      {f.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#8c8c8c" }}>
                      {formatFileSize(f.size)}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => removeFileFromFolder(folder.id, f.id)}
                    >
                      <DeleteOutlineIcon
                        fontSize="small"
                        sx={{ color: "#ff4d4f" }}
                      />
                    </IconButton>
                  </Box>
                ))}
                {folder.files.length === 0 && (
                  <Typography variant="caption" sx={{ color: "#bfbfbf" }}>
                    No files in this folder.
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </ReviewSection>

      {/* ---- 3. Project Configuration ---- */}
      <ReviewSection title="Project Configuration">
        {folders.length === 0 ? (
          <Typography variant="body2" sx={{ color: "#8c8c8c" }}>
            No configuration files uploaded.
          </Typography>
        ) : (
          <Box>
            {folders.map((folder) => {
              const config = configFiles[folder.id];
              const hasConfig = !!config;

              return (
                <Accordion
                  key={folder.id}
                  defaultExpanded={false}
                  disableGutters
                  sx={{
                    mb: 1,
                    boxShadow: "none",
                    borderRadius: "6px !important",
                    border: "1px solid #f0f0f0",
                    "&::before": { display: "none" },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      minHeight: 44,
                      "& .MuiAccordionSummary-content": {
                        alignItems: "center",
                        gap: 1,
                        my: 0.5,
                      },
                    }}
                  >
                    <FolderOutlinedIcon
                      sx={{ color: brand.primary, fontSize: 20 }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>
                      {folder.name}
                    </Typography>
                    {hasConfig && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          mr: 1,
                        }}
                      >
                        <GridOnOutlinedIcon
                          sx={{ fontSize: 14, color: brand.primary }}
                        />
                        <Typography
                          variant="caption"
                          sx={{ color: "#262626", fontWeight: 500 }}
                        >
                          {config.name}
                        </Typography>
                      </Box>
                    )}
                  </AccordionSummary>
                  <AccordionDetails sx={{ py: 0, px: 2, pb: 1.5 }}>
                    {hasConfig ? (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          py: 0.75,
                          px: 1,
                          borderRadius: "4px",
                          border: "1px solid #f5f5f5",
                          mb: 0.5,
                          backgroundColor: "#fafafa",
                        }}
                      >
                        <GridOnOutlinedIcon
                          sx={{ color: "#52c41a", fontSize: 18 }}
                        />
                        <Typography
                          variant="body2"
                          sx={{ flex: 1, color: "#434343" }}
                          noWrap
                        >
                          {config.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#8c8c8c" }}>
                          Configuration File
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" sx={{ color: "#bfbfbf" }}>
                        No configuration file for this folder.
                      </Typography>
                    )}
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        )}
      </ReviewSection>
    </Box>
  );
};

export default ReviewAssessStep;
