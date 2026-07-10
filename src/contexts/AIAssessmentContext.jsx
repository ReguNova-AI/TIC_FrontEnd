import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { NotificationApiService } from '../services/api/NotificationAPIService';
import { message } from 'antd';

// Action types
const AI_ASSESSMENT_ACTIONS = {
  START_PROCESSING: 'START_PROCESSING',
  STOP_PROCESSING: 'STOP_PROCESSING',
  SET_PROJECT_STATUS: 'SET_PROJECT_STATUS',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  // Risk Summary actions
  START_RISK_SUMMARY_PROCESSING: 'START_RISK_SUMMARY_PROCESSING',
  STOP_RISK_SUMMARY_PROCESSING: 'STOP_RISK_SUMMARY_PROCESSING',
  SET_RISK_SUMMARY_STATUS: 'SET_RISK_SUMMARY_STATUS',
};

// Initial state
const initialState = {
  isProcessing: false,
  processingProjects: new Set(), // Track which projects are being processed
  projectStatuses: {}, // Track status of each project
  error: null,
  lastProcessedProject: null,
  // Risk Summary state
  riskSummaryProcessingProjects: new Set(), // Track which projects are regenerating risk summary
  riskSummaryStatuses: {}, // Track risk summary status of each project
};

// Reducer
const aiAssessmentReducer = (state, action) => {
  switch (action.type) {
    case AI_ASSESSMENT_ACTIONS.START_PROCESSING:
      return {
        ...state,
        isProcessing: true,
        processingProjects: new Set([...state.processingProjects, action.projectId]),
        projectStatuses: {
          ...state.projectStatuses,
          [action.projectId]: 'Processing'
        },
        error: null,
        lastProcessedProject: action.projectId,
      };

    case AI_ASSESSMENT_ACTIONS.STOP_PROCESSING:
      const newProcessingProjects = new Set(state.processingProjects);
      newProcessingProjects.delete(action.projectId);
      
      return {
        ...state,
        isProcessing: newProcessingProjects.size > 0,
        processingProjects: newProcessingProjects,
        projectStatuses: {
          ...state.projectStatuses,
          [action.projectId]: action.status || 'Completed'
        },
      };

    case AI_ASSESSMENT_ACTIONS.SET_PROJECT_STATUS:
      return {
        ...state,
        projectStatuses: {
          ...state.projectStatuses,
          [action.projectId]: action.status
        },
      };

    case AI_ASSESSMENT_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.error,
        isProcessing: false,
        processingProjects: new Set(),
      };

           case AI_ASSESSMENT_ACTIONS.CLEAR_ERROR:
             return {
               ...state,
               error: null,
             };

           // Risk Summary actions
           case AI_ASSESSMENT_ACTIONS.START_RISK_SUMMARY_PROCESSING:
             return {
               ...state,
               riskSummaryProcessingProjects: new Set([...state.riskSummaryProcessingProjects, action.projectId]),
               riskSummaryStatuses: {
                 ...state.riskSummaryStatuses,
                 [action.projectId]: 'Processing'
               },
             };

           case AI_ASSESSMENT_ACTIONS.STOP_RISK_SUMMARY_PROCESSING:
             const newRiskSummaryProcessingProjects = new Set(state.riskSummaryProcessingProjects);
             newRiskSummaryProcessingProjects.delete(action.projectId);
             
             return {
               ...state,
               riskSummaryProcessingProjects: newRiskSummaryProcessingProjects,
               riskSummaryStatuses: {
                 ...state.riskSummaryStatuses,
                 [action.projectId]: action.status || 'Completed'
               },
             };

           case AI_ASSESSMENT_ACTIONS.SET_RISK_SUMMARY_STATUS:
             return {
               ...state,
               riskSummaryStatuses: {
                 ...state.riskSummaryStatuses,
                 [action.projectId]: action.status
               },
             };

           default:
             return state;
         }
};

// Context
const AIAssessmentContext = createContext();

// Provider component
export const AIAssessmentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(aiAssessmentReducer, initialState);

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

         // Start AI Assessment processing
         const startAIAssessment = useCallback(async (projectId, projectName) => {
    try {
      dispatch({
        type: AI_ASSESSMENT_ACTIONS.START_PROCESSING,
        projectId,
      });

      // Send processing notification
      /* await sendNotification(
        'AI Assessment Started',
        `AI Assessment is now running for project: ${projectName}`,
        'info',
        projectId
      ); */

      // Show processing message
      message.loading({
        content: `AI Assessment started for ${projectName}...`,
        duration: 3,
        key: `ai-assessment-${projectId}`,
      });

    } catch (error) {
      dispatch({
        type: AI_ASSESSMENT_ACTIONS.SET_ERROR,
        error: error.message,
      });
      throw error;
    }
  }, [sendNotification]);

  // Stop AI Assessment processing
  const stopAIAssessment = useCallback(async (projectId, projectName, status = 'Completed', success = true, errorMessage = null) => {
    try {
      dispatch({
        type: AI_ASSESSMENT_ACTIONS.STOP_PROCESSING,
        projectId,
        status,
      });

      // Send completion notification
      const notificationTitle = success ? 'AI Assessment Completed' : 'AI Assessment Failed';
      const notificationType = success ? 'success' : 'error';
      
      /* await sendNotification(
        notificationTitle,
        `AI Assessment has been ${success ? 'completed' : 'failed'} for project: ${projectName}`,
        notificationType,
        projectId
      ); */

      // Show completion message
      message[notificationType]({
        content: success 
          ? `AI Assessment completed for ${projectName}` 
          : (errorMessage || `AI Assessment failed for ${projectName}`),
        duration: 5,
        key: `ai-assessment-${projectId}`,
      });

    } catch (error) {
      console.error('Error stopping AI assessment:', error);
      // Still dispatch the stop action even if notification fails
      dispatch({
        type: AI_ASSESSMENT_ACTIONS.STOP_PROCESSING,
        projectId,
        status: 'Error',
      });
    }
  }, [sendNotification]);

  // Set project status
  const setProjectStatus = useCallback((projectId, status) => {
    dispatch({
      type: AI_ASSESSMENT_ACTIONS.SET_PROJECT_STATUS,
      projectId,
      status,
    });
  }, []);

  // Check if a project is being processed
  const isProjectProcessing = useCallback((projectId) => {
    return state.processingProjects.has(projectId);
  }, [state.processingProjects]);

  // Get project status
  const getProjectStatus = useCallback((projectId) => {
    return state.projectStatuses[projectId] || 'Not Started';
  }, [state.projectStatuses]);

         // Clear error
         const clearError = useCallback(() => {
           dispatch({ type: AI_ASSESSMENT_ACTIONS.CLEAR_ERROR });
         }, []);

         // Risk Summary operations
         const startRiskSummaryProcessing = useCallback(async (projectId, projectName) => {
           try {
             dispatch({
               type: AI_ASSESSMENT_ACTIONS.START_RISK_SUMMARY_PROCESSING,
               projectId,
             });

             // Send processing notification
             /* await sendNotification(
               'Risk Assessment Started',
               `Risk assessment is now being regenerated for project: ${projectName}`,
               'info',
               projectId
             ); */

             // Show processing message
             message.loading({
               content: `Risk assessment regenerating for ${projectName}...`,
               duration: 3,
               key: `risk-assessment-${projectId}`,
             });

           } catch (error) {
             dispatch({
               type: AI_ASSESSMENT_ACTIONS.SET_ERROR,
               error: error.message,
             });
             console.error('Failed to start Risk Assessment:', error);
             message.error(`Failed to start Risk Assessment for ${projectName}`);
           }
         }, [sendNotification]);

         const stopRiskSummaryProcessing = useCallback(async (projectId, projectName, status, success, errorMessage = null) => {
           dispatch({
             type: AI_ASSESSMENT_ACTIONS.STOP_RISK_SUMMARY_PROCESSING,
             projectId,
             status,
           });

           // Send completion notification
           const notificationTitle = success ? 'Risk Assessment Completed' : 'Risk Assessment Failed';
           const notificationType = success ? 'success' : 'error';
           
// await sendNotification(
// notificationTitle,
// `Risk assessment has been ${success ? 'completed' : 'failed'} for project: ${projectName}`,
// notificationType,
// projectId
// );

           // Show completion message
           message[notificationType]({
             content: success 
               ? `Risk assessment completed for ${projectName}` 
               : (errorMessage || `Risk assessment failed for ${projectName}`),
             duration: 5,
             key: `risk-assessment-${projectId}`,
           });
         }, [sendNotification]);

         const setRiskSummaryStatus = useCallback((projectId, status) => {
           dispatch({
             type: AI_ASSESSMENT_ACTIONS.SET_RISK_SUMMARY_STATUS,
             projectId,
             status,
           });
         }, []);

         const isRiskSummaryProcessing = useCallback((projectId) => {
           return state.riskSummaryProcessingProjects.has(projectId);
         }, [state.riskSummaryProcessingProjects]);

         const getRiskSummaryStatus = useCallback((projectId) => {
           return state.riskSummaryStatuses[projectId] || 'Not Started';
         }, [state.riskSummaryStatuses]);

         // Context value
         const value = {
           // State
           isProcessing: state.isProcessing,
           processingProjects: state.processingProjects,
           projectStatuses: state.projectStatuses,
           error: state.error,
           lastProcessedProject: state.lastProcessedProject,
           
           // Risk Summary State
           riskSummaryProcessingProjects: state.riskSummaryProcessingProjects,
           riskSummaryStatuses: state.riskSummaryStatuses,
           
           // Actions
           startAIAssessment,
           stopAIAssessment,
           setProjectStatus,
           isProjectProcessing,
           getProjectStatus,
           clearError,
           
           // Risk Summary Actions
           startRiskSummaryProcessing,
           stopRiskSummaryProcessing,
           setRiskSummaryStatus,
           isRiskSummaryProcessing,
           getRiskSummaryStatus,
           
           // Utilities
           sendNotification,
         };

  return (
    <AIAssessmentContext.Provider value={value}>
      {children}
    </AIAssessmentContext.Provider>
  );
};

// Custom hook to use the AI Assessment context
export const useAIAssessment = () => {
  const context = useContext(AIAssessmentContext);
  if (!context) {
    throw new Error('useAIAssessment must be used within an AIAssessmentProvider');
  }
  return context;
};

export default AIAssessmentContext;
