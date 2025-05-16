import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Tabs,
  Tab,
  TextField,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Switch,
  FormControlLabel,
} from "@mui/material";
import React from "react";

const DocumentDialog = ({
  open,
  onClose,
  fileName,
  editMode,
  setEditMode,
  complianceData,
  sections,
  handleTabTitleChange,
  handleAnswerChange,
  handleExplanationChange,
  renderAnswerIcon,
  handleAddTab,
  handleAddPoint,
  handlePointChange,
  handleSaveAll,
  isReadOnly = false,
}) => {
  const [localActiveTab, setLocalActiveTab] = React.useState(0);
  const [localTabFlag, setLocalTabFlag] = React.useState(false);

  const handleLocalTabChange = (event, newValue) => {
    setLocalActiveTab(newValue);
  };
  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason !== "backdropClick") {
          onClose();
        }
      }}
      fullWidth
      maxWidth="lg"
      style={{ zIndex: "999999" }}
    >
      <DialogTitle>
        File Details
        {!isReadOnly && (
          <FormControlLabel
            style={{ float: "right" }}
            control={
              <Switch
                checked={editMode}
                onChange={() => setEditMode(!editMode)}
              />
            }
            label="Edit mode"
          />
        )}
      </DialogTitle>

      <DialogContent>
        {fileName === "Assessment Report" ? (
          <Box sx={{ width: "100%", marginTop: 2 }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Requirements</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Fulfilled or Not</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Explanation</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {complianceData?.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ width: "45%" }}>
                      <Typography>{item.question}</Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ width: "10%" }}>
                      {editMode ? (
                        <Switch
                          checked={item.answer === "YES"}
                          onChange={(e) =>
                            handleAnswerChange(index, e.target.checked)
                          }
                          color="success"
                          size="small"
                        />
                      ) : (
                        <Box fontSize="18px">
                          {renderAnswerIcon(item.answer)}
                        </Box>
                      )}
                    </TableCell>
                    <TableCell sx={{ width: "45%" }}>
                      {editMode ? (
                        <TextField
                          variant="standard"
                          multiline
                          fullWidth
                          minRows={2}
                          value={item.explanation}
                          onChange={(e) =>
                            handleExplanationChange(index, e.target.value)
                          }
                        />
                      ) : (
                        <Typography variant="body2">
                          {item.explanation}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        ) : (
          <>
            <Tabs
              value={localActiveTab}
              onChange={handleLocalTabChange}
              aria-label="file-tabs"
              scrollButtons="auto"
              variant="scrollable"
            >
              {sections.map((section, index) => {
                if (section.title.includes("Title:") && !localTabFlag) {
                  setLocalActiveTab(1);
                  setLocalTabFlag(true);
                }
                return (
                  section &&
                  section.title && (
                    <Tab
                      key={index}
                      style={{
                        display: section.title.includes("Title:")
                          ? "none"
                          : "block",
                      }}
                      label={
                        editMode ? (
                          <TextField
                            value={section.title}
                            placeholder="Enter tab title"
                            onChange={(e) =>
                              handleTabTitleChange(index, e.target.value)
                            }
                            variant="standard"
                          />
                        ) : (
                          section.title
                        )
                      }
                    />
                  )
                );
              })}
              {editMode && (
                <Button
                  onClick={handleAddTab}
                  size="small"
                  style={{ marginLeft: "10px" }}
                >
                  + Add Tab
                </Button>
              )}
            </Tabs>

            <Box sx={{ padding: 2 }}>
              {sections.length > 0 && (
                <Box>
                  <ul>
                    {sections[localActiveTab]?.points.map((point, index) => (
                      <li key={index}>
                        {editMode ? (
                          <TextField
                            value={point}
                            placeholder="Enter point"
                            variant="standard"
                            multiline
                            fullWidth
                            onChange={(e) =>
                              handlePointChange(
                                localActiveTab,
                                index,
                                e.target.value
                              )
                            }
                          />
                        ) : (
                          <Typography>{point}</Typography>
                        )}
                      </li>
                    ))}
                  </ul>
                  {editMode && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleAddPoint(localActiveTab)}
                    >
                      + Add Point
                    </Button>
                  )}
                </Box>
              )}
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions>
        {!isReadOnly && (
          <Button onClick={() => handleSaveAll(fileName)} color="primary">
            Save All
          </Button>
        )}
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentDialog;
