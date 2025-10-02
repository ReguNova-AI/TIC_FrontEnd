import { useState, useCallback, useEffect } from "react";

export const useParameterManager = () => {
  const [parameters, setParameters] = useState([]);

  const handleAddParameters = useCallback((newParameter) => {
    setParameters((prev) => [...prev, newParameter]);
    return true; // success
  }, []);

  const handleDeleteParameter = useCallback((index) => {
    setParameters((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return {
    parameters,
    handleAddParameters,
    handleDeleteParameter,
  };
};

export const useCsvManager = () => {
  const [csvParameters, setCsvParameters] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editingValue, setEditingValue] = useState({ name: "", type: "" });

  // Debug: Monitor csvParameters changes in the hook with stack trace
  useEffect(() => {
    console.log("useCsvManager hook - csvParameters changed:", csvParameters);
    if (csvParameters.length === 0) {
      console.log("csvParameters was reset to empty array!");
      console.trace("Stack trace for empty array:");
    }
  }, [csvParameters]);

  const handleCsvFileUpload = useCallback(
    (event) => {
      return new Promise((resolve, reject) => {
        const file = event.target.files[0];
        if (file && file.type === "text/csv") {
          const reader = new FileReader();
          reader.onload = (e) => {
            const csv = e.target.result;
            const lines = csv.split("\n");
            const headers = lines[0].split(",");

            if (
              headers.length >= 2 &&
              headers[0].toLowerCase().includes("parameter") &&
              headers[1].toLowerCase().includes("type")
            ) {
              const csvData = [];
              for (let i = 1; i < lines.length; i++) {
                const data = lines[i].split(",");
                if (data.length >= 2 && data[0].trim() && data[1].trim()) {
                  csvData.push({
                    name: data[0].trim(),
                    type: data[1].trim(),
                  });
                }
              }
              console.log("About to set CSV parameters:", csvData);

              // Use immediate state update instead of functional update
              setCsvParameters(csvData);

              console.log(
                "Called setCsvParameters with:",
                csvData.length,
                "parameters"
              );

              // Resolve the promise after setting state
              resolve({
                success: true,
                message: `Successfully loaded ${csvData.length} parameters from CSV`,
                data: csvData,
              });
            } else {
              reject({
                success: false,
                message:
                  "Invalid CSV format. Expected columns: Parameter, Type",
              });
            }
          };
          reader.readAsText(file);
        } else {
          reject({
            success: false,
            message: "Please select a valid CSV file",
          });
        }
      });
    },
    [setCsvParameters]
  );

  const handleEditParameter = useCallback(
    (index) => {
      setEditingIndex(index);
      setEditingValue({
        name: csvParameters[index].name,
        type: csvParameters[index].type,
      });
    },
    [csvParameters]
  );

  const handleSaveEdit = useCallback(() => {
    if (!editingValue.name || !editingValue.type) {
      return {
        success: false,
        message: "Parameter name and type are required",
      };
    }

    const updatedParams = [...csvParameters];
    updatedParams[editingIndex] = { ...editingValue };
    setCsvParameters(updatedParams);
    setEditingIndex(-1);
    setEditingValue({ name: "", type: "" });

    return {
      success: true,
      message: "Parameter updated successfully",
    };
  }, [csvParameters, editingIndex, editingValue, setCsvParameters]);

  const handleCancelEdit = useCallback(() => {
    setEditingIndex(-1);
    setEditingValue({ name: "", type: "" });
  }, []);

  const handleDeleteCsvParameter = useCallback(
    (index) => {
      setCsvParameters((prev) => prev.filter((_, i) => i !== index));
      return {
        success: true,
        message: "Parameter deleted successfully",
      };
    },
    [setCsvParameters]
  );

  const updateEditingValue = useCallback((field, value) => {
    setEditingValue((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  return {
    csvParameters,
    editingIndex,
    editingValue,
    handleCsvFileUpload,
    handleEditParameter,
    handleSaveEdit,
    handleCancelEdit,
    handleDeleteCsvParameter,
    updateEditingValue,
    setCsvParameters, // Expose setCsvParameters for manual state updates
  };
};
