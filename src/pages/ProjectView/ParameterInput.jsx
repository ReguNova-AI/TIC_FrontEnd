import React, { useState, useCallback } from 'react';
import { TextField, FormControl, InputLabel, Select, MenuItem, Button, Box } from '@mui/material';

const ParameterInput = ({ onAddParameter, documentTypes }) => {
  const [newDoc, setNewDoc] = useState({
    name: "",
    type: "",
  });

  const handleParameterNameChange = useCallback((e) => {
    const value = e.target.value;
    setNewDoc(prev => ({ ...prev, name: value }));
  }, []);

  const handleParameterTypeChange = useCallback((e) => {
    const value = e.target.value;
    setNewDoc(prev => ({ ...prev, type: value }));
  }, []);

  const handleAdd = useCallback(() => {
    if (!newDoc.name?.trim() || !newDoc.type) {
      return;
    }

    const newParameter = {
      name: newDoc.name.trim(),
      type: newDoc.type
    };

    onAddParameter(newParameter);
    setNewDoc({ name: "", type: "" }); // reset inputs
  }, [newDoc, onAddParameter]);

  return (
    <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
      <TextField
        label="Parameter Name"
        variant="outlined"
        required
        value={newDoc.name}
        onChange={handleParameterNameChange}
        placeholder="Enter parameter name"
        sx={{ minWidth: 200 }}
      />

      <FormControl sx={{ minWidth: 160 }}>
        <InputLabel id="document-type-label">Type*</InputLabel>
        <Select
          labelId="document-type-label"
          label="Type"
          value={newDoc.type}
          onChange={handleParameterTypeChange}
          required
        >
          {documentTypes.map((type) => (
            <MenuItem key={`manual-type-${type}`} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        variant="contained"
        onClick={handleAdd}
        disabled={!newDoc.name?.trim() || !newDoc.type}
      >
        Add
      </Button>
    </Box>
  );
};

export default ParameterInput;