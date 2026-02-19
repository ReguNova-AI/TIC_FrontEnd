
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Button,
    Card,
    Grid,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Stack,
    Typography,
    IconButton,
    InputAdornment
} from '@mui/material';
import {
    CreateNewFolder as CreateNewFolderIcon,
    NoteAdd as NoteAddIcon,
    UploadFile as UploadFileIcon,
    Folder as FolderIcon,
    InsertDriveFile as InsertDriveFileIcon,
    Close as CloseIcon,
    Save as SaveIcon,
    AttachFile as AttachFileIcon,
    PictureAsPdf as PdfIcon,
    Description as DescriptionIcon,
    TableChart as ExcelIcon,
    Image as ImageIcon,
    Help as UnknownIcon
} from '@mui/icons-material';

const UnifiedDocumentControl = ({
    onAddFolder,
    onAddFile,
    folderList = [],
    acceptedFileTypes = ".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png",
    addingToFolder = null,
    onCancelAddingToFolder = () => { },
    showUploadMultiple = false,
    onUploadMultiple = () => { }
}) => {
    const [mode, setMode] = useState('view'); // 'view', 'folder', 'file'
    const [newFolderName, setNewFolderName] = useState("");
    const [newDoc, setNewDoc] = useState({
        name: "",
        type: "",
        desc: "",
        file: null
    });

    useEffect(() => {
        if (addingToFolder) {
            setMode('file');
        } else {
            // Only reset to view if we are not already in a specific mode initiated by the user
            // But if addingToFolder becomes null, usually means cancel or completion
            if (mode === 'file' && addingToFolder === null) {
                // Should we reset? Let's leave it to handleReset to be explicit
            }
        }
    }, [addingToFolder]);

    const handleReset = () => {
        setMode('view');
        setNewFolderName("");
        setNewDoc({ name: "", type: "", desc: "", file: null });
        onCancelAddingToFolder();
    };

    const handleSubmitFolder = async () => {
        if (!newFolderName.trim()) return;
        await onAddFolder(newFolderName);
        handleReset();
    };

    const handleSubmitFile = async () => {
        if (!newDoc.name.trim() || !newDoc.type) return;
        await onAddFile({
            ...newDoc,
            folderName: addingToFolder
        });
        handleReset();
    };

    const renderButtons = () => (
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <Button
                variant="outlined"
                startIcon={<CreateNewFolderIcon />}
                onClick={() => setMode('folder')}
                sx={{ textTransform: 'none', borderRadius: 2 }}
            >
                Create New Folder
            </Button>
            <Button
                variant="contained"
                color="primary"
                startIcon={<NoteAddIcon />}
                onClick={() => setMode('file')}
                sx={{ textTransform: 'none', borderRadius: 2 }}
            >
                Create New Document
            </Button>
            {showUploadMultiple && (
                <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<UploadFileIcon />}
                    onClick={onUploadMultiple}
                    sx={{ textTransform: 'none', borderRadius: 2, backgroundColor: '#722ed1', '&:hover': { backgroundColor: '#531dab' } }}
                >
                    Upload Multiple Files
                </Button>
            )}
        </Stack>
    );

    const renderFolderForm = () => (
        <Card variant="outlined" sx={{ p: 2, mb: 2, backgroundColor: '#f6ffed', borderColor: '#5B0429', borderRadius: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
                <CreateNewFolderIcon sx={{color:"primary.main"}}/>
                <TextField
                    size="small"
                    placeholder="Enter folder name..."
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    sx={{ minWidth: 250, bgcolor: 'white' }}
                />
                <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSubmitFolder}
                    sx={{ textTransform: 'none' }}
                >
                    Create
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<CloseIcon />}
                    onClick={handleReset}
                    sx={{ textTransform: 'none' }}
                >
                    Cancel
                </Button>
            </Stack>
        </Card>
    );

    const renderFileForm = () => (
        <Card variant="outlined" sx={{ p: 2, mb: 2, backgroundColor: '#f0f9ff', borderColor: '#5B0429', borderRadius: 2 }}>
            <Stack spacing={2}>
                {addingToFolder && (
                    <Box sx={{ p: 1, px: 2, bgcolor: '#e6f7ff', border: '1px solid #5B0429', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FolderIcon color="primary" fontSize="small" />
                        <Typography variant="body2" color="primary">
                            Adding to folder: <strong>{addingToFolder}</strong>
                        </Typography>
                    </Box>
                )}

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-start">
                    <InsertDriveFileIcon color="primary" sx={{ mt: 1 }} />

                    <Box sx={{ flexGrow: 1, width: '100%' }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Document Name"
                                    value={newDoc.name}
                                    onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                                    sx={{ bgcolor: 'white' }}
                                />
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}>
                                    <InputLabel sx={{ paddingTop: '4px' }} >Type</InputLabel>
                                    <Select
                                        value={newDoc.type}
                                        label="Type"
                                        onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value })}
                                        size='small'


                                    >
                                        <MenuItem value="Project Document"><InsertDriveFileIcon color="primary" fontSize="small" /> <span>Project Document</span></MenuItem>
                                        <MenuItem value="Specification"><DescriptionIcon color="secondary" fontSize="small" /> <span>Specification</span></MenuItem>
                                        <MenuItem value="Drawing"><ImageIcon color="action" fontSize="small" /> <span>Drawing</span></MenuItem>
                                        <MenuItem value="Report"><ExcelIcon color="success" fontSize="small" /> <span>Report</span></MenuItem>
                                        <MenuItem value="Certificate"><PdfIcon color="error" fontSize="small" /> <span>Certificate</span></MenuItem>
                                        <MenuItem value="Other"><UnknownIcon color="action" fontSize="small" /> <span>Other</span></MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Description (Optional)"
                                    value={newDoc.desc}
                                    onChange={(e) => setNewDoc({ ...newDoc, desc: e.target.value })}
                                    sx={{ bgcolor: 'white' }}
                                />
                            </Grid>
                            {/* <Grid item xs={12} md={3}>
                                <Button
                                    fullWidth
                                    component="label"
                                    variant="outlined"
                                    startIcon={<AttachFileIcon />}
                                    sx={{ textTransform: 'none', bgcolor: 'white', height: '40px' }}
                                >
                                    {newDoc.file ? (
                                        <Typography noWrap variant="body2" sx={{ maxWidth: '100%' }}>
                                            {newDoc.file.name}
                                        </Typography>
                                    ) : (
                                        "Attach File"
                                    )}
                                    <input
                                        type="file"
                                        hidden
                                        onChange={(e) => setNewDoc({ ...newDoc, file: e.target.files[0] })}
                                    />
                                </Button>
                            </Grid> */}
                        </Grid>
                    </Box>
                </Stack>

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                        variant="outlined"
                        startIcon={<CloseIcon />}
                        onClick={handleReset}
                        sx={{ textTransform: 'none' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                        onClick={handleSubmitFile}
                        sx={{ textTransform: 'none' }}
                    >
                        {addingToFolder ? "Add to Folder" : "Add Document"}
                    </Button>
                </Stack>
            </Stack>
        </Card>
    );

    return (
        <Box className="unified-document-control">
            {mode === 'view' && renderButtons()}
            {mode === 'folder' && renderFolderForm()}
            {mode === 'file' && renderFileForm()}
        </Box>
    );
};

UnifiedDocumentControl.propTypes = {
    onAddFolder: PropTypes.func.isRequired,
    onAddFile: PropTypes.func.isRequired,
    folderList: PropTypes.array,
    acceptedFileTypes: PropTypes.string,
    addingToFolder: PropTypes.string,
    onCancelAddingToFolder: PropTypes.func,
    showUploadMultiple: PropTypes.bool,
    onUploadMultiple: PropTypes.func
};

export default UnifiedDocumentControl;
