import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Tree, Tooltip, Button, Progress, Popconfirm } from "antd";
import FilePdfOutlined from "@ant-design/icons/FilePdfOutlined";
import FileWordOutlined from "@ant-design/icons/FileWordOutlined";
import FileExcelOutlined from "@ant-design/icons/FileExcelOutlined";
import FileTextOutlined from "@ant-design/icons/FileTextOutlined";
import FileImageOutlined from "@ant-design/icons/FileImageOutlined";
import FileUnknownOutlined from "@ant-design/icons/FileUnknownOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import PlusCircleOutlined from "@ant-design/icons/PlusCircleOutlined";
import PaperClipOutlined from "@ant-design/icons/PaperClipOutlined";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import folderIcon from "../assets/images/icons/folderIcon1.svg";
import { apiHost } from 'config';

// --- Modal styles ---
const modalBoxStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '85vw',
    height: '90vh',
    bgcolor: 'background.paper',
    boxShadow: 24,
    borderRadius: 2,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
};

// --- File preview renderer inside modal ---
// --- File preview renderer inside modal ---
const FilePreview = ({ fileUrl, filename }) => {
    console.log(filename,"filename");
    console.log(fileUrl,"fileUrl");
    
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

        fetch(fileUrl, { credentials: 'include' })   // 'include' sends cookies if your API needs auth
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.blob();
            })
            .then(blob => {
                objectUrl = URL.createObjectURL(blob);
                setBlobUrl(objectUrl);
            })
            .catch(err => {
                console.error('File fetch failed:', err);
                setError(true);
            })
            .finally(() => setLoading(false));

        // Revoke the blob URL when the component unmounts or fileUrl changes
        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [fileUrl]);

    if (!fileUrl || !filename) return null;

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
                <span style={{ color: '#888' }}>Loading preview…</span>
            </div>
        );
    }

    if (error || !blobUrl) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
                <FileUnknownOutlined style={{ fontSize: 48, color: '#595959' }} />
                <p style={{ color: '#555' }}>Could not load preview.</p>
                <a href={fileUrl} target="_blank" rel="noreferrer">Open in new tab</a>
            </div>
        );
    }

    // Images — blob URL works perfectly
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
        return (
            <img
                src={blobUrl}
                alt={filename}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', margin: 'auto', display: 'block' }}
            />
        );
    }

    // PDF — blob URL bypasses X-Frame-Options completely
    if (ext === 'pdf') {
        return (
            <iframe
                src={blobUrl}
                title={filename}
                width="100%"
                height="100%"
                style={{ border: 'none', flex: 1, zIndex:10000 }}
            />
        );
    }

    // Word / Excel — blob URL + Google Docs Viewer won't work (needs a public URL)
    // So for Office files, fetch the blob and use it directly via an object URL
    // with a mime-type override, or fall back to a download prompt
    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) {
        // Google Docs Viewer requires a publicly accessible URL, so use the original URL
        // If your server is publicly accessible swap blobUrl → encoded original URL
        const encodedUrl = encodeURIComponent(fileUrl);
        return (
            <iframe
                src={`https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`}
                title={filename}
                width="100%"
                height="100%"
                style={{ border: 'none', flex: 1 }}
            />
        );
    }

    // Plain text — render blob URL in an iframe
    if (ext === 'txt') {
        return (
            <iframe
                src={blobUrl}
                title={filename}
                width="100%"
                height="100%"
                style={{ border: 'none', flex: 1, fontFamily: 'monospace' }}
            />
        );
    }

    // Unsupported
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
            <FileUnknownOutlined style={{ fontSize: 48, color: '#595959' }} />
            <p style={{ color: '#555' }}>Preview not available for <strong>.{ext}</strong> files.</p>
            <a href={fileUrl} target="_blank" rel="noreferrer" download>Download file</a>
        </div>
    );
};

// --- Utility: build icon, accepts onPreview callback instead of opening new tab ---
const getFileIcon = (filename, onPreview, docName) => {
    if (!filename) return <FileUnknownOutlined style={{ color: "#595959" }} />;

    const handleClick = (e) => {
        e.stopPropagation();
        try {
            const fileUrl = filename.startsWith("http://") || filename.startsWith("https://")
                ? filename
                : `${apiHost}/${filename}`;
            onPreview(fileUrl, filename, docName);   // 👈 open modal instead of new tab
        } catch (error) {
            console.error("Error resolving file URL", error);
        }
    };

    const ext = filename.split(".").pop().toLowerCase();
    switch (ext) {
        case "pdf":
            return <FilePdfOutlined style={{ color: "#cf1322", cursor: 'pointer' }} onClick={handleClick} />;
        case "doc":
        case "docx":
            return <FileWordOutlined style={{ color: "#1890ff", cursor: 'pointer' }} onClick={handleClick} />;
        case "xls":
        case "xlsx":
            return <FileExcelOutlined style={{ color: "#52c41a", cursor: 'pointer' }} onClick={handleClick} />;
        case "jpg":
        case "jpeg":
        case "png":
            return <FileImageOutlined style={{ color: "#fa8c16", cursor: 'pointer' }} onClick={handleClick} />;
        case "txt":
            return <FileTextOutlined style={{ color: "#722ed1", cursor: 'pointer' }} onClick={handleClick} />;
        default:
            return <FileUnknownOutlined style={{ color: "#595959", cursor: 'pointer' }} onClick={handleClick} />;
    }
};

const UnifiedFileTree = ({
    documents,
    onAddFolderFile,
    onDeleteFolder,
    onDeleteFile,
    expandedKeys,
    onExpand,
    readOnly = false,
    onUploadFile = null,
    aiButtonLoading
}) => {
    // --- Modal state lives here ---
    const [previewFile, setPreviewFile] = useState(null); // { url, name }

    const handlePreview = (fileUrl, filename, docName) => {
        console.log(fileUrl,"fileUrlll");
        
        setPreviewFile({ url: fileUrl, name: filename, docName });
    };

    const handleClosePreview = () => setPreviewFile(null);

    // --- Transform Data to Tree ---
    const treeData = useMemo(() => {
        const treeStructure = {};
        const rootFiles = [];

        const normalizedDocs = documents.map(doc => ({
            ...doc,
            name: doc.document_name || doc.docuemnt_name,
            type: doc.document_type || doc.docuemnt_type,
            folder: doc.folder_name,
            id: doc.document_id,
            version: doc.version_id || doc.version,
            path: doc.file_path || doc.path,
            fileObj: doc.file
        }));

        normalizedDocs.forEach((doc) => {
            const { folder, name, id, version } = doc;
            const isPlaceholder = !name;

            if (folder && folder !== "null") {
                if (!treeStructure[folder]) {
                    treeStructure[folder] = {
                        title: (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <img src={folderIcon} width="20px" style={{ marginRight: "8px" }} alt="folder" />
                                    <span style={{ fontWeight: 500, color: "#5B0429" }}>{folder}</span>
                                </div>
                                {!readOnly && (
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <Tooltip title="Add document to this folder">
                                            <Button
                                                type="text"
                                                shape="circle"
                                                icon={<PlusCircleOutlined style={{ fontSize: '20px' }} />}
                                                onClick={(e) => { e.stopPropagation(); if (onAddFolderFile) onAddFolderFile(folder); }}
                                                style={{ color: "#1976d2", border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, minWidth: 32, padding: 0 }}
                                            />
                                        </Tooltip>
                                        {onDeleteFolder && (
                                            <Popconfirm
                                                title="Delete Folder"
                                                description="Delete this folder and all contents?"
                                                onConfirm={(e) => { e.stopPropagation(); onDeleteFolder(folder); }}
                                                onCancel={(e) => e.stopPropagation()}
                                                okText="Yes"
                                                cancelText="No"
                                            >
                                                <DeleteOutlined style={{ color: 'red', marginLeft: 8, fontSize: 16 }} onClick={(e) => e.stopPropagation()} />
                                            </Popconfirm>
                                        )}
                                    </div>
                                )}
                            </div>
                        ),
                        key: folder.replace(/\s+/g, "-"),
                        children: []
                    };
                }

                if (!isPlaceholder) {
                    treeStructure[folder].children.push({
                        title: renderFileTitle(doc, onDeleteFile, readOnly, onUploadFile, handlePreview, aiButtonLoading),
                        key: `${id}-${version}`,
                        isLeaf: true,
                        data: doc
                    });
                }
            } else if (!isPlaceholder) {
                rootFiles.push({
                    title: renderFileTitle(doc, onDeleteFile, readOnly, onUploadFile, handlePreview, aiButtonLoading),
                    key: `${id}-${version}`,
                    isLeaf: true,
                    data: doc
                });
            }
        });

        // Sort folders alphabetically
        const sortedFolders = Object.values(treeStructure).sort((a, b) =>
            (a.key || '').localeCompare(b.key || '')
        );

        // Sort files within folders
        sortedFolders.forEach(folder => {
            folder.children.sort((a, b) => (a.title.props.children[0].props.children[0] || '').localeCompare(b.title.props.children[0].props.children[0] || ''));
        });

        // Sort root files
        rootFiles.sort((a, b) => (a.title.props.children[0].props.children[0] || '').localeCompare(b.title.props.children[0].props.children[0] || ''));

        return [...sortedFolders, ...rootFiles];
    }, [documents, onAddFolderFile, onDeleteFile, onDeleteFolder, readOnly, onUploadFile]);
    // Note: handlePreview is stable (defined outside useMemo with useState), 
    // but if you want to be safe, wrap it in useCallback.

    return (
        <>
            <Tree
                showIcon={false}
                showLine={{ showLeafIcon: false }}
                treeData={treeData}
                expandedKeys={expandedKeys}
                onExpand={onExpand}
                selectable={false}
                blockNode={true}
                height={500}
            />

            {/* ---- File Preview Modal ---- */}
            <Modal
                open={!!previewFile}
                onClose={handleClosePreview}
                aria-labelledby="file-preview-modal"
                style={{zIndex:999999}}
            >
                <Box sx={modalBoxStyle}>
                    {/* Header bar */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: 2,
                        py: 1,
                        borderBottom: '1px solid #e0e0e0',
                        bgcolor: '#fafafa',
                        flexShrink: 0,
                    }}>
                        <span style={{ fontWeight: 500, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {previewFile?.docName}
                        </span>
                        <IconButton size="small" onClick={handleClosePreview} aria-label="close preview">
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    {/* Preview content */}
                    <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', p: previewFile && ['jpg','jpeg','png','gif','webp','svg'].includes(previewFile.name?.split('.').pop().toLowerCase()) ? 2 : 0 }}>
                        {previewFile && (
                            <FilePreview fileUrl={previewFile.url} filename={previewFile.name} />
                        )}
                    </Box>
                </Box>
            </Modal>
        </>
    );
};

// --- renderFileTitle now receives onPreview ---
function renderFileTitle(doc, onDeleteFile, readOnly, onUploadFile, onPreview, aiButtonLoading) {
    const hasFile = doc.path || doc.fileObj;

    return (
        <div style={{ display: "flex", cursor: "auto", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            <span style={{ flex: 1, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", marginRight: 8 }}>
                {doc.name} <span style={{ color: '#888' }}>({doc.type})</span>
            </span>
            <div style={{ display: "flex", alignItems: "center", flexDirection: 'row' }}>
                {/* Progress indicator if available */}
                {doc.progress !== undefined && doc.progress < 100 && doc.progress > 0 && (
                    <Progress type="circle" percent={doc.progress} width={20} style={{ marginRight: 8 }} />
                )}

                {hasFile ? (
                    <div style={{ display: "flex", alignItems: "center", flexDirection: 'row' }}>
                        {/* 👇 pass onPreview through */}
                        {getFileIcon(doc.fileObj ? doc.fileObj.name : doc.path, onPreview, doc.name)}
                        {!readOnly && onDeleteFile && (
                            <Popconfirm
                                title="Delete File"
                                onConfirm={(e) => { e.stopPropagation(); onDeleteFile(doc); }}
                                onCancel={(e) => e.stopPropagation()}
                                okText="Yes"
                                cancelText="No"
                                disabled={aiButtonLoading}
                            >
                                <DeleteOutlined style={{ color: `${aiButtonLoading ? "grey" : "red"}`, cursor: `${aiButtonLoading ? "auto" : "pointer"}`, marginLeft: 8 }} onClick={(e) => e.stopPropagation()} />
                            </Popconfirm>
                        )}
                    </div>
                ) : (
                    !readOnly && onUploadFile && (
                        <div style={{ display: "flex", alignItems: "center", flexDirection: 'row' }}>
                            <Tooltip title="Upload Document">
                                <label
                                    htmlFor={`file-upload-${doc.id}`}
                                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', marginBottom: 0 }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <PaperClipOutlined style={{ fontSize: 18, color: '#1890ff' }} />
                                    <input
                                        id={`file-upload-${doc.id}`}
                                        type="file"
                                        style={{ display: 'none' }}
                                        onChange={(e) => onUploadFile(e, doc)}
                                    />
                                </label>
                            </Tooltip>
                            {onDeleteFile && (
                                <Popconfirm
                                    title="Delete Document Entry"
                                    onConfirm={(e) => { e.stopPropagation(); onDeleteFile(doc); }}
                                    onCancel={(e) => e.stopPropagation()}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <DeleteOutlined style={{ color: 'red', marginLeft: 8 }} onClick={(e) => e.stopPropagation()} />
                                </Popconfirm>
                            )}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

UnifiedFileTree.propTypes = {
    documents: PropTypes.array.isRequired,
    onAddFolderFile: PropTypes.func,
    onDeleteFolder: PropTypes.func,
    onDeleteFile: PropTypes.func,
    expandedKeys: PropTypes.array,
    onExpand: PropTypes.func,
    readOnly: PropTypes.bool,
    onUploadFile: PropTypes.func
};

export default UnifiedFileTree;
