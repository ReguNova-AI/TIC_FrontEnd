import BaseApiService from "./BaseApiService";

const _openGoogleDrivePicker = (payload = null) => {
  return BaseApiService.post(`/api/v1/google/authorize`, null, payload);
};

// Accept userId so the backend can return an access token for that user
const _getGoogleAccessToken = (userId = null) => {
  const params = userId ? { user_id: userId } : null;
  return BaseApiService.get(`/api/v1/google/token`, params, null, true);
};

// Enhanced method with better error handling and caching
const _getGoogleAccessTokenWithCache = async (userId = null) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    return await _getGoogleAccessToken(userId);
  } catch (error) {
    // Handle specific error cases
    const status = error?.response?.status;
    
    if (status === 404) {
      // No token found - this is not an error, just means user hasn't connected Google
      return null;
    } else if (status === 401) {
      // Unauthorized - token might be expired
      return null;
    } else {
      // Re-throw other errors
      throw error;
    }
  }
};

// Check if user has Google connected (without throwing errors)
const _hasGoogleConnection = async (userId = null) => {
  try {
    const token = await _getGoogleAccessTokenWithCache(userId);
    return token && (token.access_token || token.accessToken);
  } catch (error) {
    console.warn('Error checking Google connection:', error);
    return false;
  }
};

export const GoogleDrivePickerService = {
  openGoogleDrivePicker: _openGoogleDrivePicker,
  getGoogleAccessToken: _getGoogleAccessToken,
  getGoogleAccessTokenWithCache: _getGoogleAccessTokenWithCache,
  hasGoogleConnection: _hasGoogleConnection,
};