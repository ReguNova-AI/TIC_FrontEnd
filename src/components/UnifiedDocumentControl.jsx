import React, { useState } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Stack from "@mui/material/Stack";
import { default as CreateNewFolderIcon } from "@mui/icons-material/CreateNewFolder";
import { default as InsertDriveFileIcon } from "@mui/icons-material/InsertDriveFile";
import { default as CloseIcon } from "@mui/icons-material/Close";
import { default as SaveIcon } from "@mui/icons-material/Save";
import { default as PdfIcon } from "@mui/icons-material/PictureAsPdf";
import { default as DescriptionIcon } from "@mui/icons-material/Description";
import { default as ExcelIcon } from "@mui/icons-material/TableChart";
import { default as ImageIcon } from "@mui/icons-material/Image";
import { default as UnknownIcon } from "@mui/icons-material/Help";

const UnifiedDocumentControl = ({
  onAddFolder,
  onCancelAddingToFolder = () => {},
  onUploadFile = () => {},
}) => {
  const [mode, setMode] = useState("view"); // 'view', 'folder', 'file'
  const [newFolderName, setNewFolderName] = useState("");
  const [newDoc, setNewDoc] = useState({
    name: "",
    type: "",
    desc: "",
    file: null,
  });

  const handleReset = () => {
    setMode("view");
    setNewFolderName("");
    setNewDoc({ name: "", type: "", desc: "", file: null });
    onCancelAddingToFolder();
  };

  const handleSubmitFolder = async () => {
    if (!newFolderName.trim()) return;
    console.log(newFolderName, "newFolderName");
    await onAddFolder(newFolderName);
    handleReset();
  };

  const renderButtons = () => (
    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
      <Button
        variant="outlined"
        startIcon={<CreateNewFolderIcon />}
        onClick={() => setMode("folder")}
        sx={{ textTransform: "none", borderRadius: 2 }}
      >
        Create New Folder
      </Button>
      <Button
        variant="outlined"
        startIcon={<CreateNewFolderIcon />}
        onClick={(e) => {
          e.stopPropagation();
          onUploadFile(e); // triggers global file picker
        }}
        sx={{ textTransform: "none", borderRadius: 2 }}
      >
        Upload Config File
      </Button>
    </Stack>
  );

  const renderFolderForm = () => (
    <Card
      variant="outlined"
      sx={{
        p: 2,
        mb: 2,
        backgroundColor: "#f6ffed",
        borderColor: "#5B0429",
        borderRadius: 2,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <CreateNewFolderIcon sx={{ color: "primary.main" }} />
        <TextField
          size="small"
          placeholder="Enter folder name..."
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          sx={{ minWidth: 250, bgcolor: "white" }}
        />
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSubmitFolder}
          sx={{ textTransform: "none" }}
        >
          Create
        </Button>
        <Button
          variant="outlined"
          startIcon={<CloseIcon />}
          onClick={handleReset}
          sx={{ textTransform: "none" }}
        >
          Cancel
        </Button>
      </Stack>
    </Card>
  );

  return (
    <Box className="unified-document-control">
      {mode === "view" && renderButtons()}
      {mode === "folder" && renderFolderForm()}
    </Box>
  );
};

UnifiedDocumentControl.propTypes = {
  onAddFolder: PropTypes.func.isRequired,
  onCancelAddingToFolder: PropTypes.func,
};

export default UnifiedDocumentControl;
