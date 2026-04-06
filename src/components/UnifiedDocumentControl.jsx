
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import { 
    FolderPlus, 
    FilePlus, 
    Upload, 
    Folder, 
    FileText, 
    X, 
    Save, 
    ChevronDown, 
    FileSpreadsheet, 
    Image, 
    HelpCircle,
    Paperclip
} from 'lucide-react';
import { default as UnknownIcon } from "@mui/icons-material/Help";

const UnifiedDocumentControl = ({
    onAddFolder,
    onAddFile,
    folderList = [],
    acceptedFileTypes = ".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png",
    addingToFolder = null,
    onCancelAddingToFolder = () => { },
    showUploadMultiple = false,
    onUploadMultiple = () => { },
    disabled = false
}) => {
    const [mode, setMode] = useState('view'); // 'view', 'folder', 'file'
    const [newFolderName, setNewFolderName] = useState("");
    const [newDoc, setNewDoc] = useState({
        name: "",
        type: "",
        desc: "",
        file: null
    });
    const handleCreateFolderClick = () => {
        setMode('folder');
    };

    const handleUploadFilesClick = (e) => {
        onUploadMultiple(e);
    };

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
        <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
                variant="text"
                startIcon={<FolderPlus size={16} color={!disabled ? "#fff" : "rgba(91, 4, 41, 0.4)"} />}
                onClick={handleCreateFolderClick}
                disabled={disabled}
                sx={{ 
                    textTransform: 'none', 
                    borderRadius: '20px', 
                    height: '34px',
                    color: !disabled ? '#fff' : 'rgba(91, 4, 41, 0.4)',
                    fontWeight: 500,
                    fontSize: '13px',
                    bgcolor: !disabled ? '#5B0429' : 'rgba(91, 4, 41, 0.05)',
                    px: 2.5,
                    border: !disabled ? 'none' : '1px solid rgba(91, 4, 41, 0.1)',
                    '&:hover': { 
                        bgcolor: !disabled ? '#4a0322' : 'rgba(91, 4, 41, 0.1)', 
                    },
                    '&.Mui-disabled': { 
                        bgcolor: 'rgba(91, 4, 41, 0.05)', 
                        color: 'rgba(91, 4, 41, 0.4)'
                    }
                }}
            >
                Create folder
            </Button>
            {showUploadMultiple && (
                <Button
                    variant="outlined"
                    startIcon={<Upload size={16} />}
                    onClick={handleUploadFilesClick}
                    disabled={disabled}
                    sx={{ 
                        textTransform: 'none', 
                        borderRadius: '20px', 
                        height: '34px',
                        color: !disabled ? '#5B0429' : 'rgba(91, 4, 41, 0.4)',
                        borderColor: !disabled ? '#5B0429' : 'rgba(91, 4, 41, 0.2)',
                        fontWeight: 500,
                        fontSize: '13px',
                        px: 2.5,
                        '&:hover': { 
                            bgcolor: 'rgba(91, 4, 41, 0.05)',
                            borderColor: '#4a0322'
                        },
                        '&.Mui-disabled': { 
                            borderColor: 'rgba(91, 4, 41, 0.1)', 
                            color: 'rgba(91, 4, 41, 0.4)'
                        }
                    }}
                >
                    Upload Multiple
                </Button>
            )}
        </Box>
    );

    const renderFolderForm = () => (
        <Card variant="outlined" sx={{ p: 2, mb: 2, backgroundColor: '#f6ffed', borderColor: '#5B0429', borderRadius: '4px' }}>
            <Stack direction="row" spacing={2} alignItems="center">
                <FolderPlus size={20} color="#5B0429" />
                <TextField
                    size="small"
                    placeholder="Enter folder name..."
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    sx={{ minWidth: 250, bgcolor: 'white' }}
                />
                <Button
                    variant="contained"
                    startIcon={<Save size={18} />}
                    onClick={handleSubmitFolder}
                    sx={{ textTransform: 'none', bgcolor: '#5B0429', borderRadius: '20px', height: '40px', '&:hover': { bgcolor: '#4a0322' } }}
                >
                    Create
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<X size={18} />}
                    onClick={handleReset}
                    sx={{ textTransform: 'none', color: '#5B0429', borderColor: '#5B0429', borderRadius: '20px', height: '40px' }}
                >
                    Cancel
                </Button>
            </Stack>
        </Card>
    );

    const renderFileForm = () => (
        <Card variant="outlined" sx={{ p: 2, mb: 2, backgroundColor: '#f0f9ff', borderColor: '#5B0429', borderRadius: '4px' }}>
            <Stack spacing={2}>
                {addingToFolder && (
                    <Box sx={{ p: 1, px: 2, bgcolor: '#e6f7ff', border: '1px solid #5B0429', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Folder size={18} color="#5B0429" />
                        <Typography variant="body2" color="#5B0429">
                            Adding to folder: <strong>{addingToFolder}</strong>
                        </Typography>
                    </Box>
                )}

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-start">
                    <FileText size={20} color="#5B0429" style={{ marginTop: '8px' }} />

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
                                        <MenuItem value="Project Document"><FileText size={16} color="#5B0429" style={{ marginRight: '8px' }} /> <span>Project Document</span></MenuItem>
                                        <MenuItem value="Specification"><FileText size={16} color="#5B0429" style={{ marginRight: '8px' }} /> <span>Specification</span></MenuItem>
                                        <MenuItem value="Drawing"><Image size={16} color="#5B0429" style={{ marginRight: '8px' }} /> <span>Drawing</span></MenuItem>
                                        <MenuItem value="Report"><FileSpreadsheet size={16} color="#5B0429" style={{ marginRight: '8px' }} /> <span>Report</span></MenuItem>
                                        <MenuItem value="Certificate"><FileText size={16} color="#cf1322" style={{ marginRight: '8px' }} /> <span>Certificate</span></MenuItem>
                                        <MenuItem value="Other"><HelpCircle size={16} color="#5B0429" style={{ marginRight: '8px' }} /> <span>Other</span></MenuItem>
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
                            <Grid item xs={12} md={3}>
                                <Button
                                    fullWidth
                                    component="label"
                                    variant="outlined"
                                    startIcon={<Paperclip size={18} />}
                                    sx={{ 
                                        textTransform: 'none', 
                                        bgcolor: 'white', 
                                        height: '40px',
                                        color: '#5B0429',
                                        borderColor: '#5B0429',
                                        borderRadius: '4px',
                                        '&:hover': {
                                            bgcolor: 'rgba(91,4,41,0.05)',
                                            borderColor: '#4a0322'
                                        }
                                    }}
                                >
                                    <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                                        {newDoc.file ? newDoc.file.name : "Attach File"}
                                    </Box>
                                    <input
                                        type="file"
                                        hidden
                                        onChange={(e) => setNewDoc({ ...newDoc, file: e.target.files[0] })}
                                    />
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </Stack>

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                        variant="outlined"
                        startIcon={<X size={18} />}
                        onClick={handleReset}
                        sx={{ textTransform: 'none', color: '#5B0429', borderColor: '#5B0429', borderRadius: '20px', height: '40px' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Save size={18} />}
                        onClick={handleSubmitFile}
                        sx={{ textTransform: 'none', bgcolor: '#5B0429', borderRadius: '20px', height: '40px', '&:hover': { bgcolor: '#4a0322' } }}
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
