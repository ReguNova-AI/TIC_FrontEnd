import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Tooltip, Button, Progress, Popconfirm } from "antd";
import { 
    FolderOpen,
    Folder,
    FilePlus,
    ChevronDown, 
    ChevronUp,
    X, 
    Image, 
    Layers,
    Upload,
    Trash2,
    FileText,
    FileArchive,
    Pencil
} from 'lucide-react';
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { apiHost } from 'config';

// ── Modal style ──────────────────────────────────────────────────────────────
const modalBoxStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '85vw',
    height: '90vh',
    bgcolor: 'background.paper',
    boxShadow: 24,
    borderRadius: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
};

// ── File preview ─────────────────────────────────────────────────────────────
const FilePreview = ({ fileUrl, filename }) => {
    const [blobUrl, setBlobUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const ext = filename?.split('.').pop().toLowerCase();

    useEffect(() => {
        if (!fileUrl) return;
        let objectUrl = null;
        setLoading(true);
        setError(false);
        setBlobUrl(null);
        fetch(fileUrl, { credentials: 'include' })
            .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.blob(); })
            .then(blob => { objectUrl = URL.createObjectURL(blob); setBlobUrl(objectUrl); })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
        return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
    }, [fileUrl]);

    if (!fileUrl || !filename) return null;
    if (loading) return <Box sx={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%' }}><Typography color="text.secondary">Loading preview…</Typography></Box>;
    if (error || !blobUrl) return <Box sx={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:1.5 }}><Typography>Could not load preview.</Typography><a href={fileUrl} target="_blank" rel="noreferrer">Open in new tab</a></Box>;
    if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) return <img src={blobUrl} alt={filename} style={{ maxWidth:'100%', maxHeight:'100%', objectFit:'contain', margin:'auto', display:'block' }} />;
    if (ext === 'pdf') return <iframe src={blobUrl} title={filename} width="100%" height="100%" style={{ border:'none', flex:1 }} />;
    if (['doc','docx','xls','xlsx','ppt','pptx'].includes(ext)) return <iframe src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`} title={filename} width="100%" height="100%" style={{ border:'none', flex:1 }} />;
    if (ext === 'txt') return <iframe src={blobUrl} title={filename} width="100%" height="100%" style={{ border:'none', flex:1 }} />;
    return <Box sx={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:1.5 }}><Typography>Preview not available for <strong>.{ext}</strong> files.</Typography><a href={fileUrl} download target="_blank" rel="noreferrer">Download file</a></Box>;
};

// ── File icon click handler ───────────────────────────────────────────────────
const getFileIcon = (filename, onPreview, docName) => {
    if (!filename) return <FileText size={17} color="#999" />;
    const handleClick = (e) => {
        e.stopPropagation();
        try {
            const fileUrl = filename.startsWith("http://") || filename.startsWith("https://") ? filename : `${apiHost}/${filename}`;
            onPreview(fileUrl, filename, docName);
        } catch (err) { console.error("Error resolving file URL", err); }
    };
    const ext = filename.split(".").pop().toLowerCase();
    const props = { size: 17, style: { cursor: 'pointer', flexShrink: 0 }, onClick: handleClick };
    switch (ext) {
        case "pdf": return <FileText {...props} color="#5B0429" />;
        case "doc": case "docx": return <FileText {...props} color="#1565C0" />;
        case "xls": case "xlsx": return <FileArchive {...props} color="#2E7D32" />;
        case "jpg": case "jpeg": case "png": return <Image {...props} color="#E65100" />;
        case "txt": return <FileText {...props} color="#555" />;
        default: return <Layers {...props} color="#5B0429" />;
    }
};

// ── Single file row ───────────────────────────────────────────────────────────
function FileRow({ doc, onDeleteFile, readOnly, onUploadFile, onPreview, aiButtonLoading }) {
    const hasFile = doc.path || doc.fileObj;

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
                py: '10px',
                mb: 1, // Add margin bottom for standalone cards
                bgcolor: '#fff',
                border: '1px solid #e4e4e4', // Standalone border
                borderRadius: '4px', // Rounded corners
                '&:last-child': { mb: 0 },
                '&:hover': { bgcolor: '#fafafa', borderColor: '#d0d0d0' },
                transition: 'all 0.15s',
            }}
        >
            {/* File icon + name */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                {getFileIcon(doc.fileObj ? doc.fileObj.name : doc.path, onPreview, doc.name)}
                <Typography sx={{ fontSize: '13px', fontWeight: 500, color: '#222', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {doc.name}
                </Typography>
                {doc.fileObj?.size && (
                    <Typography sx={{ fontSize: '12px', color: '#aaa', flexShrink: 0 }}>
                        {(doc.fileObj.size / 1024 / 1024).toFixed(1)}mb
                    </Typography>
                )}
            </Box>

            {/* Actions */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {doc.progress !== undefined && doc.progress < 100 && doc.progress > 0 && (
                    <Progress type="circle" percent={doc.progress} width={20} />
                )}

                {hasFile ? (
                    !readOnly && onDeleteFile && (
                        <Popconfirm
                            title="Delete File"
                            description="Are you sure you want to delete this file?"
                            onConfirm={(e) => { e?.stopPropagation(); onDeleteFile(doc); }}
                            onCancel={(e) => e?.stopPropagation()}
                            okText="Delete" cancelText="Cancel"
                            disabled={aiButtonLoading}
                        >
                            <Trash2
                                size={15}
                                color={aiButtonLoading ? "rgba(91, 4, 41, 0.3)" : "#ef4444"}
                                style={{ cursor: aiButtonLoading ? "default" : "pointer" }}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </Popconfirm>
                    )
                ) : (
                    !readOnly && onUploadFile && (
                        <Tooltip title="Upload file">
                            <label htmlFor={`file-up-${doc.id}`} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', marginBottom: 0 }} onClick={(e) => e.stopPropagation()}>
                                <Upload size={15} color="#5B0429" />
                                <input id={`file-up-${doc.id}`} type="file" style={{ display: 'none' }} onChange={(e) => onUploadFile(e, doc)} />
                            </label>
                        </Tooltip>
                    )
                )}
            </Box>
        </Box>
    );
}

// ── Folder accordion ──────────────────────────────────────────────────────────
function FolderRow({ folder, expanded, onToggle, onAddFolderFile, onDeleteFolder, onRenameFolder, onDeleteFile, readOnly, onUploadFile, onPreview, aiButtonLoading }) {
    const { folderName, children } = folder;
    const count = children.length;

    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(folderName);

    const handleRename = (e) => {
        e.stopPropagation();
        if (editValue.trim() && editValue !== folderName && onRenameFolder) {
            onRenameFolder(folderName, editValue.trim());
        }
        setIsEditing(false);
    };

    return (
        <Box
            sx={{
                border: '1px solid #e4e4e4',
                borderRadius: '4px',
                overflow: 'hidden',
                bgcolor: '#fff',
            }}
        >
            {/* Folder header row */}
            <Box
                onClick={onToggle}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2,
                    py: '11px',
                    cursor: 'pointer',
                    bgcolor: expanded ? '#fafafe' : '#fff',
                    '&:hover': { bgcolor: '#f7f7fb' },
                    transition: 'background 0.15s',
                    borderBottom: expanded ? '1px solid #e4e4e4' : 'none',
                    userSelect: 'none',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                    {expanded
                        ? <FolderOpen size={18} color="#5B0429" style={{ flexShrink: 0 }} />
                        : <Folder size={18} color="#5B0429" style={{ flexShrink: 0 }} />
                    }
                    {isEditing ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }} onClick={(e) => e.stopPropagation()}>
                            <input
                                autoFocus
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleRename(e);
                                    if (e.key === 'Escape') setIsEditing(false);
                                }}
                                style={{
                                    flex: 1,
                                    fontSize: '14px',
                                    padding: '2px 8px',
                                    border: '1px solid #5B0429',
                                    borderRadius: '4px',
                                    outline: 'none'
                                }}
                            />
                            <Button size="small" type="primary" onClick={handleRename} sx={{ height: 24, fontSize: '12px' }}>Save</Button>
                            <Button size="small" onClick={() => setIsEditing(false)} sx={{ height: 24, fontSize: '12px' }}>Cancel</Button>
                        </Box>
                    ) : (
                        <>
                            <Typography sx={{ fontWeight: 600, color: '#222', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {folderName}
                            </Typography>
                            <Typography sx={{ color: '#aaa', fontSize: '13px', flexShrink: 0, ml: 0.5 }}>
                                {children.length} {children.length === 1 ? 'file' : 'files'}
                            </Typography>
                        </>
                    )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {!readOnly && !aiButtonLoading && !isEditing && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {onRenameFolder && (
                                <Tooltip title="Rename folder">
                                    <Box 
                                        onClick={(e) => { e.stopPropagation(); setIsEditing(true); setEditValue(folderName); }}
                                        sx={{ 
                                            p: 0.5, 
                                            cursor: 'pointer', 
                                            borderRadius: '4px', 
                                            '&:hover': { bgcolor: 'rgba(91,4,41,0.05)' },
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Pencil size={14} color="#5B0429" />
                                    </Box>
                                </Tooltip>
                            )}

                            {onAddFolderFile && expanded && (
                                <Tooltip title="Add file to this folder">
                                    <Box 
                                        onClick={(e) => { e.stopPropagation(); onAddFolderFile(folderName); }}
                                        sx={{ 
                                            p: 0.5, 
                                            cursor: 'pointer',
                                            borderRadius: '4px', 
                                            '&:hover': { bgcolor: 'rgba(91,4,41,0.05)' },
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <FilePlus size={16} color="#5B0429" />
                                    </Box>
                                </Tooltip>
                            )}
                            
                            {onDeleteFolder && (
                                <Popconfirm
                                    title="Delete Folder"
                                    description={`Are you sure you want to delete "${folderName}" and all its contents?`}
                                    onConfirm={(e) => { e?.stopPropagation(); onDeleteFolder(folderName); }}
                                    onCancel={(e) => e?.stopPropagation()}
                                    okText="Delete"
                                    cancelText="Cancel"
                                    okType="danger"
                                    disabled={aiButtonLoading}
                                >
                                    <Box
                                        onClick={(e) => { e.stopPropagation(); }}
                                        sx={{ 
                                            p: 0.5, 
                                            cursor: 'pointer',
                                            borderRadius: '4px', 
                                            '&:hover': { bgcolor: 'rgba(229,57,53,0.05)' },
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Trash2 size={15} color="#ef4444" />
                                    </Box>
                                </Popconfirm>
                            )}
                        </Box>
                    )}
                    {expanded
                        ? <ChevronUp size={16} color="#aaa" />
                        : <ChevronDown size={16} color="#aaa" />
                    }
                </Box>
            </Box>

            {/* Folder contents */}
            {expanded && (
                <Box sx={{ p: 2, bgcolor: '#fff', borderTop: '1px solid #e4e4e4' }}>
                    {children.length === 0 ? (
                        <Box 
                            sx={{ 
                                p: 3, 
                                display: "flex",
                                alignItems: "center",
                                gap: 3,
                                border: '1px dashed #e4e4e4', 
                                borderRadius: '8px', 
                                bgcolor: '#fff',
                                transition: "all 0.2s ease",
                                "&:hover": { bgcolor: "rgba(91,4,41,0.02)" },
                            }}
                        >
                            <Box sx={{ flexShrink: 0, width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: '#fafafa', borderRadius: '8px' }}>
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#bdbdbd" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17.5 19L9 19C6.23858 19 4 16.7614 4 14C4 11.2386 6.23858 9 9 9L9.75 9C10.6628 5.48583 13.8344 3 17.5 3C20.5376 3 23 5.46243 23 8.5C23 11.5376 20.5376 14 17.5 14L17.5 14" />
                                    <polyline points="13 13 10 10 7 13" />
                                    <line x1="10" y1="10" x2="10" y2="16" />
                                </svg>
                            </Box>
                            <Box sx={{ textAlign: 'left' }}>
                                <Typography sx={{ fontWeight: 600, color: "#262626", mb: 0.5, fontSize: '14px' }}>
                                    Click to upload or drag and drop files here
                                </Typography>
                                <Typography sx={{ color: "#8c8c8c", mb: 1.5, fontSize: '12px' }}>
                                    Supported file formats: PDF, DOCX, DOC, TXT, XLSX, XLS, CSV
                                </Typography>
                                {!readOnly && onAddFolderFile && !aiButtonLoading && (
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => onAddFolderFile(folderName)}
                                        sx={{
                                            textTransform: 'none',
                                            fontSize: '13px',
                                            borderRadius: '20px',
                                            color: '#5B0429',
                                            borderColor: '#5B0429',
                                            px: 3,
                                            fontWeight: 500,
                                            '&:hover': {
                                                bgcolor: 'rgba(91,4,41,0.05)',
                                                borderColor: '#4a0322'
                                            }
                                        }}
                                    >
                                        Browse
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    ) : (
                        children.map((child) => (
                            <FileRow
                                key={child.key}
                                doc={child.data}
                                onDeleteFile={onDeleteFile}
                                readOnly={readOnly}
                                onUploadFile={onUploadFile}
                                onPreview={onPreview}
                                aiButtonLoading={aiButtonLoading}
                            />
                        ))
                    )}
                </Box>
            )}
        </Box>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
const UnifiedFileTree = ({
    documents,
    onAddFolderFile,
    onDeleteFolder,
    onRenameFolder,
    onDeleteFile,
    expandedKeys,
    onExpand,
    readOnly = false,
    onUploadFile = null,
    aiButtonLoading
}) => {
    const [previewFile, setPreviewFile] = useState(null);

    const handlePreview = (fileUrl, filename, docName) => setPreviewFile({ url: fileUrl, name: filename, docName });
    const handleClosePreview = () => setPreviewFile(null);

    // Build tree structure from flat documents array
    const { folders, rootFiles } = useMemo(() => {
        const folderMap = {};
        const rootFiles = [];

        const normalized = documents.map(doc => ({
            ...doc,
            name: doc.document_name || doc.docuemnt_name,
            type: doc.document_type || doc.docuemnt_type,
            folder: doc.folder_name,
            id: doc.document_id,
            version: doc.version_id || doc.version,
            path: doc.file_path || doc.path,
            fileObj: doc.file,
        }));

        normalized.forEach((doc) => {
            const { folder, name, id, version } = doc;
            // A placeholder is a database entry representing a folder skeleton (no real file path or type is "Folder")
            const isPlaceholder = !name || !doc.path || doc.path === "null" || doc.type === "Folder";

            if (folder && folder !== "null") {
                if (!folderMap[folder]) {
                    folderMap[folder] = {
                        key: folder.replace(/\s+/g, "-"),
                        folderName: folder,
                        children: [],
                    };
                }
                if (!isPlaceholder) {
                    folderMap[folder].children.push({
                        key: `${id}-${version}`,
                        data: doc,
                    });
                }
            } else if (!isPlaceholder) {
                rootFiles.push({ key: `${id}-${version}`, data: doc });
            }
        });

        const sortedFolders = Object.values(folderMap).sort((a, b) => a.folderName.localeCompare(b.folderName));
        return { folders: sortedFolders, rootFiles };
    }, [documents]);

    const toggleFolder = (key) => {
        if (expandedKeys.includes(key)) {
            onExpand(expandedKeys.filter(k => k !== key));
        } else {
            onExpand([...expandedKeys, key]);
        }
    };

    const hasContent = folders.length > 0 || rootFiles.length > 0;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', mt: 1.5 }}>

            {/* Folders */}
            {folders.map(folder => (
                <FolderRow
                    key={folder.key}
                    folder={folder}
                    expanded={expandedKeys.includes(folder.key)}
                    onToggle={() => toggleFolder(folder.key)}
                    onAddFolderFile={onAddFolderFile}
                    onDeleteFolder={onDeleteFolder}
                    onDeleteFile={onDeleteFile}
                    readOnly={readOnly}
                    onUploadFile={onUploadFile}
                    onPreview={handlePreview}
                    aiButtonLoading={aiButtonLoading}
                />
            ))}

            {/* Root files wrapped in a default folder accordion */}
            {rootFiles.length > 0 && (
                <FolderRow
                    key="uncategorized"
                    folder={{ folderName: "Main Documents", children: rootFiles, key: "uncategorized" }}
                    expanded={expandedKeys.includes("uncategorized")}
                    onToggle={() => toggleFolder("uncategorized")}
                    onAddFolderFile={null} // Don't allow adding to root through this button
                    onDeleteFolder={null}
                    onDeleteFile={onDeleteFile}
                    readOnly={readOnly}
                    onUploadFile={onUploadFile}
                    onPreview={handlePreview}
                    aiButtonLoading={aiButtonLoading}
                />
            )}



            {/* Empty state */}
            {!hasContent && (
                <Box sx={{ py: 4, textAlign: 'center', border: '1px dashed #e4e4e4', borderRadius: '4px', bgcolor: '#fafafa' }}>
                    <Typography sx={{ fontSize: '13px', color: '#bbb', fontStyle: 'italic' }}>
                        No documents uploaded yet. Create a folder or upload files.
                    </Typography>
                </Box>
            )}

            {/* File preview modal */}
            <Modal open={!!previewFile} onClose={handleClosePreview} style={{ zIndex: 999999 }}>
                <Box sx={modalBoxStyle}>
                    <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', px:2, py:1.25, borderBottom:'1px solid #e0e0e0', bgcolor:'#fafafa', flexShrink:0 }}>
                        <Typography sx={{ fontWeight:500, fontSize:14, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {previewFile?.docName}
                        </Typography>
                        <IconButton size="small" onClick={handleClosePreview}>
                            <X size={16} />
                        </IconButton>
                    </Box>
                    <Box sx={{ flex:1, overflow:'auto', display:'flex', flexDirection:'column', p: previewFile && ['jpg','jpeg','png','gif','webp','svg'].includes(previewFile.name?.split('.').pop().toLowerCase()) ? 2 : 0 }}>
                        {previewFile && <FilePreview fileUrl={previewFile.url} filename={previewFile.name} />}
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
};

UnifiedFileTree.propTypes = {
    documents: PropTypes.array.isRequired,
    onAddFolderFile: PropTypes.func,
    onDeleteFolder: PropTypes.func,
    onDeleteFile: PropTypes.func,
    expandedKeys: PropTypes.array,
    onExpand: PropTypes.func,
    readOnly: PropTypes.bool,
    onUploadFile: PropTypes.func,
    aiButtonLoading: PropTypes.bool,
};

export default UnifiedFileTree;
