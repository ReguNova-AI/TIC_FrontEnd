import React, { useMemo } from 'react';
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
import folderIcon from "../assets/images/icons/folderIcon1.svg";

// Utility function for file icons
const getFileIcon = (filename) => {
    if (!filename) return <FileUnknownOutlined style={{ color: "#595959" }} />;
    const ext = filename.split(".").pop().toLowerCase();
    switch (ext) {
        case "pdf":
            return <FilePdfOutlined style={{ color: "#cf1322" }} />;
        case "doc":
        case "docx":
            return <FileWordOutlined style={{ color: "#1890ff" }} />;
        case "xls":
        case "xlsx":
            return <FileExcelOutlined style={{ color: "#52c41a" }} />;
        case "jpg":
        case "jpeg":
        case "png":
            return <FileImageOutlined style={{ color: "#fa8c16" }} />;
        case "txt":
            return <FileTextOutlined style={{ color: "#722ed1" }} />;
        default:
            return <FileUnknownOutlined style={{ color: "#595959" }} />;
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
    onUploadFile = null // Prop for handling file attachment
}) => {

    // --- Transform Data to Tree
    const treeData = useMemo(() => {
        const treeStructure = {};
        const rootFiles = [];

        // Normalize document properties
        const normalizedDocs = documents.map(doc => ({
            ...doc,
            // Handle potential property name differences
            name: doc.document_name || doc.docuemnt_name,
            type: doc.document_type || doc.docuemnt_type,
            folder: doc.folder_name,
            id: doc.document_id,
            version: doc.version_id || doc.version,
            path: doc.file_path || doc.path,
            fileObj: doc.file
        }));

        normalizedDocs.forEach((doc) => {
            const { folder, name, id, version, type } = doc;

            // Skip invalid entries or placeholders if needed
            const isPlaceholder = !name;

            if (folder && folder !== "null") {
                if (!treeStructure[folder]) {
                    treeStructure[folder] = {
                        title: (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <img
                                        src={folderIcon}
                                        width="20px"
                                        style={{ marginRight: "8px" }}
                                        alt="folder"
                                    />
                                    <span style={{ fontWeight: 500, color: "#5B0429" }}>{folder}</span>
                                </div>
                                {!readOnly && (
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <Tooltip title="Add document to this folder">
                                            <Button
                                                type="text"
                                                shape="circle"
                                                icon={<PlusCircleOutlined style={{ fontSize: '20px' }} />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (onAddFolderFile) onAddFolderFile(folder);
                                                }}
                                                style={{
                                                    color: "#1976d2",
                                                    border: 'none',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: 32,
                                                    height: 32,
                                                    minWidth: 32,
                                                    padding: 0,
                                                }}
                                            />
                                        </Tooltip>
                                        {onDeleteFolder && (
                                            <Popconfirm
                                                title="Delete Folder"
                                                description="Delete this folder and all contents?"
                                                onConfirm={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteFolder(folder);
                                                }}
                                                onCancel={(e) => e.stopPropagation()}
                                                okText="Yes"
                                                cancelText="No"
                                            >
                                                <DeleteOutlined
                                                    style={{ color: 'red', marginLeft: 8, fontSize: 16 }}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
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
                        title: renderFileTitle(doc, onDeleteFile, readOnly, onUploadFile), // Pass handler
                        key: `${id}-${version}`,
                        isLeaf: true,
                        data: doc
                    });
                }
            } else if (!isPlaceholder) {
                // Root file
                rootFiles.push({
                    title: renderFileTitle(doc, onDeleteFile, readOnly, onUploadFile), // Pass handler
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

    return (
        <Tree
            showIcon={false}
            showLine={{ showLeafIcon: false }}
            treeData={treeData}
            expandedKeys={expandedKeys}
            onExpand={onExpand}
            selectable={false}
            blockNode={true} // CRITICAL: This fixes the layout alignment
            height={500}
        />
    );
};

// Helper to render file node title
function renderFileTitle(doc, onDeleteFile, readOnly, onUploadFile) {
    const hasFile = doc.path || doc.fileObj;

    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
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
                        {getFileIcon(doc.fileObj ? doc.fileObj.name : doc.path)}
                        {!readOnly && onDeleteFile && (
                            <Popconfirm
                                title="Delete File"
                                onConfirm={(e) => {
                                    e.stopPropagation();
                                    onDeleteFile(doc);
                                }}
                                onCancel={(e) => e.stopPropagation()}
                                okText="Yes"
                                cancelText="No"
                            >
                                <DeleteOutlined
                                    style={{ color: 'red', marginLeft: 8 }}
                                    onClick={(e) => e.stopPropagation()}
                                />
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
                            {/* Allow delete even if no file attached? usually yes, to remove the entry */}
                            {onDeleteFile && (
                                <Popconfirm
                                    title="Delete Document Entry"
                                    onConfirm={(e) => {
                                        e.stopPropagation();
                                        onDeleteFile(doc);
                                    }}
                                    onCancel={(e) => e.stopPropagation()}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <DeleteOutlined
                                        style={{ color: 'red', marginLeft: 8 }}
                                        onClick={(e) => e.stopPropagation()}
                                    />
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
    onAddFolderFile: PropTypes.func, // (folderName) => void
    onDeleteFolder: PropTypes.func, // (folderName) => void
    onDeleteFile: PropTypes.func, // (document) => void
    expandedKeys: PropTypes.array,
    onExpand: PropTypes.func,
    readOnly: PropTypes.bool,
    onUploadFile: PropTypes.func
};

export default UnifiedFileTree;
