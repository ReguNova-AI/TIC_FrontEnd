import React, { useState } from "react";

const UploadChecklistModal = ({ isOpen, onClose, onConfirm }) => {
    const [includeOcr, setIncludeOcr] = useState(false);
    const [detailLevel, setDetailLevel] = useState("detailed");

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm({
            include_ocr: includeOcr,
            detail_level: detailLevel
        });
        onClose();
    };

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <h3>Select Options</h3>

                {/* Include OCR */}
                <div style={rowSectionStyle}>
                    <span style={rowLabelStyle}>Include OCR:</span>

                    <div style={radioGroupStyle}>
                        <label style={radioOptionStyle}>
                            <input
                                type="radio"
                                name="include_ocr"
                                checked={includeOcr === true}
                                onChange={() => setIncludeOcr(true)}
                            />
                            True
                        </label>

                        <label style={radioOptionStyle}>
                            <input
                                type="radio"
                                name="include_ocr"
                                checked={includeOcr === false}
                                onChange={() => setIncludeOcr(false)}
                            />
                            False
                        </label>
                    </div>
                </div>

                {/* Detail Level */}
                <div style={rowSectionStyle}>
                    <span style={rowLabelStyle}>Detail Level:</span>

                    <div style={radioGroupStyle}>
                        <label style={radioOptionStyle}>
                            <input
                                type="radio"
                                name="detail_level"
                                checked={detailLevel === "detailed"}
                                onChange={() => setDetailLevel("detailed")}
                            />
                            Detailed
                        </label>

                        <label style={radioOptionStyle}>
                            <input
                                type="radio"
                                name="detail_level"
                                checked={detailLevel === "concise"}
                                onChange={() => setDetailLevel("concise")}
                            />
                            Concise
                        </label>

                        <label style={radioOptionStyle}>
                            <input
                                type="radio"
                                name="detail_level"
                                checked={detailLevel === "executive"}
                                onChange={() => setDetailLevel("executive")}
                            />
                            Executive
                        </label>
                    </div>
                </div>

                {/* Actions */}
                <div style={actionsStyle}>
                    <button
                        onClick={onClose}
                        style={actionButtonStyle}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleConfirm}
                        style={{ ...actionButtonStyle, marginLeft: "50px" }}
                    >
                        Generate Checklist
                    </button>
                </div>

            </div>
        </div>
    );
};

const rowSectionStyle = {
    display: "flex",
    alignItems: "center",
    marginBottom: "16px"
};

const rowLabelStyle = {
    fontWeight: "600",
    fontSize: "14px",
    minWidth: "110px",
    textAlign: "left"
};

const radioGroupStyle = {
    display: "flex",
    gap: "10px"
};

const radioOptionStyle = {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    fontSize: "14px"
};

const overlayStyle = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
};

const modalStyle = {
    background: "#fff",
    padding: "20px",
    borderRadius: "8px",
    width: "400px",
    textAlign: "center"
};

const actionsStyle = {
    display: "flex",
    justifyContent: "center"
};

const actionButtonStyle = {
    backgroundColor: "#2979ff", // blue
    color: "#ffffff",          // white text
    border: "none",
    padding: "8px 16px",
    borderRadius: "4px",
    cursor: "pointer",
};

export default UploadChecklistModal;
