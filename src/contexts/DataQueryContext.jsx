    import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { NotificationApiService } from '../services/api/NotificationAPIService';
import { message } from 'antd';

// Action types
const DATA_QUERY_ACTIONS = {
  START_EXTRACTING: 'START_EXTRACTING',
  STOP_EXTRACTING: 'STOP_EXTRACTING',
  SET_EXTRACTION_STATUS: 'SET_EXTRACTION_STATUS',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_CSV_PARAMETERS: 'SET_CSV_PARAMETERS',
  SET_EXTRACTED_PARAMETERS: 'SET_EXTRACTED_PARAMETERS',
  SET_SHOW_RESULTS: 'SET_SHOW_RESULTS',
  CLEAR_PROJECT_DATA: 'CLEAR_PROJECT_DATA',
};

// Helper functions for sessionStorage
const getStoredState = () => {
  try {
    const stored = sessionStorage.getItem('dataQueryState');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        extractingProjects: new Set(parsed.extractingProjects || []),
        // Ensure new properties exist
        csvParameters: parsed.csvParameters || {},
        extractedParameters: parsed.extractedParameters || {},
        showResults: parsed.showResults || {}
      };
    }
  } catch (error) {
    console.error('Error parsing stored data query state:', error);
  }
  return {
    isExtracting: false,
    extractingProjects: new Set(),
    extractionStatuses: {},
    error: null,
    lastExtractedProject: null,
    // Project-specific data
    csvParameters: {}, // projectId -> array of parameters
    extractedParameters: {}, // projectId -> extracted data
    showResults: {}, // projectId -> boolean
  };
};

const saveStateToStorage = (state) => {
  try {
    const stateToSave = {
      ...state,
      extractingProjects: Array.from(state.extractingProjects)
    };
    sessionStorage.setItem('dataQueryState', JSON.stringify(stateToSave));
  } catch (error) {
    console.error('Error saving data query state:', error);
  }
};

// Initial state
const initialState = getStoredState();

// Reducer
const dataQueryReducer = (state, action) => {
  let newState;
  
  switch (action.type) {
    case DATA_QUERY_ACTIONS.START_EXTRACTING:
      newState = {
        ...state,
        isExtracting: true,
        extractingProjects: new Set([...state.extractingProjects, action.projectId]),
        extractionStatuses: {
          ...state.extractionStatuses,
          [action.projectId]: 'Extracting Data...'
        },
        error: null,
        lastExtractedProject: action.projectId,
      };
      break;

    case DATA_QUERY_ACTIONS.STOP_EXTRACTING:
      const newExtractingProjects = new Set(state.extractingProjects);
      newExtractingProjects.delete(action.projectId);
      
      newState = {
        ...state,
        isExtracting: newExtractingProjects.size > 0,
        extractingProjects: newExtractingProjects,
        extractionStatuses: {
          ...state.extractionStatuses,
          [action.projectId]: action.status || 'Completed'
        },
      };
      break;

    case DATA_QUERY_ACTIONS.SET_EXTRACTION_STATUS:
      newState = {
        ...state,
        extractionStatuses: {
          ...state.extractionStatuses,
          [action.projectId]: action.status
        },
      };
      break;

    case DATA_QUERY_ACTIONS.SET_ERROR:
      newState = {
        ...state,
        error: action.error,
        isExtracting: false,
        extractingProjects: new Set(),
      };
      break;

    case DATA_QUERY_ACTIONS.CLEAR_ERROR:
      newState = {
        ...state,
        error: null,
      };
      break;

    case DATA_QUERY_ACTIONS.SET_CSV_PARAMETERS:
      newState = {
        ...state,
        csvParameters: {
          ...(state.csvParameters || {}),
          [action.projectId]: action.parameters
        }
      };
      break;

    case DATA_QUERY_ACTIONS.SET_EXTRACTED_PARAMETERS:
      newState = {
        ...state,
        extractedParameters: {
          ...(state.extractedParameters || {}),
          [action.projectId]: action.data
        }
      };
      break;

    case DATA_QUERY_ACTIONS.SET_SHOW_RESULTS:
      newState = {
        ...state,
        showResults: {
          ...(state.showResults || {}),
          [action.projectId]: action.show
        }
      };
      break;

    case DATA_QUERY_ACTIONS.CLEAR_PROJECT_DATA:
      const { [action.projectId]: removedCsv, ...remainingCsv } = state.csvParameters || {};
      const { [action.projectId]: removedExtracted, ...remainingExtracted } = state.extractedParameters || {};
      const { [action.projectId]: removedShow, ...remainingShow } = state.showResults || {};
      
      newState = {
        ...state,
        csvParameters: remainingCsv,
        extractedParameters: remainingExtracted,
        showResults: remainingShow
      };
      break;

    default:
      newState = state;
      break;
  }
  
  // Save to sessionStorage after each state change
  saveStateToStorage(newState);
  return newState;
};

// Context
const DataQueryContext = createContext();

// Provider component
export const DataQueryProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dataQueryReducer, initialState);

  // Clean up stale extractions on mount (in case of page refresh during extraction)
  React.useEffect(() => {
    const cleanupStaleExtractions = () => {
      const now = Date.now();
      const staleThreshold = 30 * 60 * 1000; // 30 minutes
      
      // Check if any extractions are older than 30 minutes
      const staleProjects = Array.from(state.extractingProjects).filter(projectId => {
        const lastActivity = sessionStorage.getItem(`extraction_start_${projectId}`);
        return lastActivity && (now - parseInt(lastActivity)) > staleThreshold;
      });

      // Clear stale extractions
      staleProjects.forEach(projectId => {
        dispatch({
          type: DATA_QUERY_ACTIONS.STOP_EXTRACTING,
          projectId,
          status: 'Timed Out'
        });
      });
    };

    cleanupStaleExtractions();
  }, []);

  // Get current user info
  const getCurrentUser = useCallback(() => {
    try {
      const userdetails = JSON.parse(sessionStorage.getItem('userDetails') || 'null');
      return userdetails?.[0] || null;
    } catch (error) {
      console.error('Error parsing user details:', error);
      return null;
    }
  }, []);

  // Send notification
  const sendNotification = useCallback(async (title, message, type = 'info', projectId = null) => {
    try {
      const user = getCurrentUser();
      if (!user?.user_id) {
        console.warn('No user found for notification');
        return;
      }

      const notificationData = {
        user_id: user.user_id,
        project_id: projectId,
        notification_message: message,
        type,
        is_read: false,
      };
      
      await NotificationApiService.createNotification(notificationData);
    } catch (error) {
      console.error('Failed to send notification:', error);
      // Show fallback message
      message[type](title + ': ' + message);
    }
  }, [getCurrentUser]);

  // Start Data Extraction processing
  const startDataExtraction = useCallback((projectId, projectName) => {
    try {
      // Store timestamp for cleanup
      sessionStorage.setItem(`extraction_start_${projectId}`, Date.now().toString());
      
      dispatch({
        type: DATA_QUERY_ACTIONS.START_EXTRACTING,
        projectId,
      });

      // Send processing notification (fire and forget)
      /* sendNotification(
        'Data Extraction Started',
        `Data extraction is now running for project: ${projectName}`,
        'info',
        projectId
      ).catch(console.error); */

      // Show processing message
      message.loading({
        content: `Extracting data for ${projectName}...`,
        duration: 3,
        key: `data-extraction-${projectId}`,
      });

    } catch (error) {
      dispatch({
        type: DATA_QUERY_ACTIONS.SET_ERROR,
        error: error.message,
      });
      console.error('Error starting data extraction:', error);
    }
  }, [sendNotification]);

  // Stop Data Extraction processing
  const stopDataExtraction = useCallback((projectId, projectName, status = 'Completed', success = true) => {
    try {
      // Clean up timestamp
      sessionStorage.removeItem(`extraction_start_${projectId}`);
      
      // Clean up component-specific data if extraction failed
      if (!success) {
        sessionStorage.removeItem(`csvParameters_${projectId}`);
        sessionStorage.removeItem(`extractedParameters_${projectId}`);
        sessionStorage.removeItem(`showResults_${projectId}`);
      }
      
      dispatch({
        type: DATA_QUERY_ACTIONS.STOP_EXTRACTING,
        projectId,
        status,
      });

      // Send completion notification (fire and forget)
      const notificationTitle = success ? 'Data Extraction Completed' : 'Data Extraction Failed';
      const notificationType = success ? 'success' : 'error';
      
      /* sendNotification(
        notificationTitle,
        `Data extraction has been ${success ? 'completed' : 'failed'} for project: ${projectName}`,
        notificationType,
        projectId
      ).catch(console.error); */

      // Show completion message
      message[notificationType]({
        content: `Data extraction ${success ? 'completed' : 'failed'} for ${projectName}`,
        duration: 5,
        key: `data-extraction-${projectId}`,
      });

    } catch (error) {
      console.error('Error stopping data extraction:', error);
      // Still dispatch the stop action even if notification fails
      dispatch({
        type: DATA_QUERY_ACTIONS.STOP_EXTRACTING,
        projectId,
        status: 'Error',
      });
    }
  }, [sendNotification]);

  // Set extraction status
  const setExtractionStatus = useCallback((projectId, status) => {
    dispatch({
      type: DATA_QUERY_ACTIONS.SET_EXTRACTION_STATUS,
      projectId,
      status,
    });
  }, []);

  // Check if a project is being extracted
  const isProjectExtracting = useCallback((projectId) => {
    return state.extractingProjects.has(projectId);
  }, [state.extractingProjects]);

  // Get extraction status
  const getExtractionStatus = useCallback((projectId) => {
    return state.extractionStatuses[projectId] || 'Not Started';
  }, [state.extractionStatuses]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: DATA_QUERY_ACTIONS.CLEAR_ERROR });
  }, []);

  // Clear all extraction states (useful for cleanup)
  const clearAllExtractions = useCallback(() => {
    // Clear all timestamps
    Array.from(state.extractingProjects).forEach(projectId => {
      sessionStorage.removeItem(`extraction_start_${projectId}`);
    });
    
    // Clear sessionStorage state
    sessionStorage.removeItem('dataQueryState');
    
    // Reset to initial state
    dispatch({
      type: DATA_QUERY_ACTIONS.SET_ERROR,
      error: null
    });
  }, [state.extractingProjects]);

  // CSV Parameters management
  const setCsvParameters = useCallback((projectId, parameters) => {
    dispatch({
      type: DATA_QUERY_ACTIONS.SET_CSV_PARAMETERS,
      projectId,
      parameters
    });
  }, []);

  const getCsvParameters = useCallback((projectId) => {
    return (state.csvParameters && state.csvParameters[projectId]) || [];
  }, [state.csvParameters]);

  // Extracted Parameters management
  const setExtractedParameters = useCallback((projectId, data) => {
    dispatch({
      type: DATA_QUERY_ACTIONS.SET_EXTRACTED_PARAMETERS,
      projectId,
      data
    });
  }, []);

  const getExtractedParameters = useCallback((projectId) => {
    return (state.extractedParameters && state.extractedParameters[projectId]) || null;
  }, [state.extractedParameters]);

  // Show Results management
  const setShowResults = useCallback((projectId, show) => {
    dispatch({
      type: DATA_QUERY_ACTIONS.SET_SHOW_RESULTS,
      projectId,
      show
    });
  }, []);

  const getShowResults = useCallback((projectId) => {
    return (state.showResults && state.showResults[projectId]) || false;
  }, [state.showResults]);

  // Clear project data
  const clearProjectData = useCallback((projectId) => {
    dispatch({
      type: DATA_QUERY_ACTIONS.CLEAR_PROJECT_DATA,
      projectId
    });
  }, []);

  // Context value
  const value = {
    // State
    isExtracting: state.isExtracting,
    extractingProjects: state.extractingProjects,
    extractionStatuses: state.extractionStatuses,
    error: state.error,
    lastExtractedProject: state.lastExtractedProject,
    
    // Actions
    startDataExtraction,
    stopDataExtraction,
    setExtractionStatus,
    isProjectExtracting,
    getExtractionStatus,
    clearError,
    clearAllExtractions,
    
    // CSV Parameters
    setCsvParameters,
    getCsvParameters,
    
    // Extracted Parameters
    setExtractedParameters,
    getExtractedParameters,
    
    // Show Results
    setShowResults,
    getShowResults,
    
    // Project Data
    clearProjectData,
    
    // Utilities
    sendNotification,
  };

  return (
    <DataQueryContext.Provider value={value}>
      {children}
    </DataQueryContext.Provider>
  );
};

// Custom hook to use the Data Query context
export const useDataQuery = () => {
  const context = useContext(DataQueryContext);
  if (!context) {
    throw new Error('useDataQuery must be used within a DataQueryProvider');
  }
  return context;
};

export default DataQueryContext;
