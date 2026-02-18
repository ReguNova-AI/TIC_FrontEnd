import { useState, useEffect, useCallback } from 'react';
import { GoogleDrivePickerService } from '../../services/api/googleDrivePickerService';

/**
 * Custom hook for managing Google token state with caching
 * @param {Object} options - Configuration options
 * @param {number} options.cacheDuration - Cache duration in milliseconds (default: 5 minutes)
 * @param {number} options.negativeCacheDuration - Negative cache duration in milliseconds (default: 1 minute)
 * @param {boolean} options.autoCheck - Whether to automatically check token on mount (default: true)
 * @returns {Object} - { hasGoogleToken, isLoading, checkToken, clearCache }
 */
export const useGoogleToken = (options = {}) => {
  const {
    cacheDuration = 5 * 60 * 1000, // 5 minutes
    negativeCacheDuration = 1 * 60 * 1000, // 1 minute
    autoCheck = true
  } = options;

  const [hasGoogleToken, setHasGoogleToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getUserId = useCallback(() => {
    try {
      const userdetails = JSON.parse(sessionStorage.getItem('userDetails') || 'null');
      return userdetails?.[0]?.user_id || null;
    } catch (error) {
      console.error('Error parsing user details:', error);
      return null;
    }
  }, []);

  const getCacheKey = useCallback((userId, isNegative = false) => {
    const baseKey = `google_token_${userId}`;
    return isNegative ? `${baseKey}_negative` : baseKey;
  }, []);

  const getCachedResult = useCallback((userId, isNegative = false) => {
    const cacheKey = getCacheKey(userId, isNegative);
    const timestampKey = `${cacheKey}_timestamp`;
    
    const cachedResult = sessionStorage.getItem(cacheKey);
    const cacheTimestamp = sessionStorage.getItem(timestampKey);
    
    if (!cachedResult || !cacheTimestamp) {
      return null;
    }
    
    const now = Date.now();
    const cacheAge = now - parseInt(cacheTimestamp);
    const duration = isNegative ? negativeCacheDuration : cacheDuration;
    
    if (cacheAge < duration) {
      return cachedResult === 'true';
    }
    
    // Clear expired cache
    sessionStorage.removeItem(cacheKey);
    sessionStorage.removeItem(timestampKey);
    return null;
  }, [cacheDuration, negativeCacheDuration, getCacheKey]);

  const setCachedResult = useCallback((userId, result, isNegative = false) => {
    const cacheKey = getCacheKey(userId, isNegative);
    const timestampKey = `${cacheKey}_timestamp`;
    
    sessionStorage.setItem(cacheKey, result.toString());
    sessionStorage.setItem(timestampKey, Date.now().toString());
  }, [getCacheKey]);

  const checkToken = useCallback(async (forceRefresh = false) => {
    const userId = getUserId();
    
    if (!userId) {
      setHasGoogleToken(false);
      setIsLoading(false);
      return;
    }

    // Check cache first unless force refresh
    if (!forceRefresh) {
      // Check positive cache first
      const cachedResult = getCachedResult(userId, false);
      if (cachedResult !== null) {
        setHasGoogleToken(cachedResult);
        setIsLoading(false);
        return;
      }
      
      // Check negative cache
      const negativeCachedResult = getCachedResult(userId, true);
      if (negativeCachedResult !== null) {
        setHasGoogleToken(false);
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(true);
    
    try {
      const data = await GoogleDrivePickerService.getGoogleAccessTokenWithCache(userId);
      const hasToken = data && (data.access_token || data.accessToken);
      
      setHasGoogleToken(hasToken);
      setCachedResult(userId, hasToken, false);
    } catch (error) {
      setHasGoogleToken(false);
    } finally {
      setIsLoading(false);
    }
  }, [getUserId, getCachedResult, setCachedResult]);

  const clearCache = useCallback(() => {
    const userId = getUserId();
    if (userId) {
      const positiveKey = getCacheKey(userId, false);
      const negativeKey = getCacheKey(userId, true);
      
      sessionStorage.removeItem(positiveKey);
      sessionStorage.removeItem(`${positiveKey}_timestamp`);
      sessionStorage.removeItem(negativeKey);
      sessionStorage.removeItem(`${negativeKey}_timestamp`);
    }
  }, [getUserId, getCacheKey]);

  // Auto-check on mount if enabled
  useEffect(() => {
    if (autoCheck) {
      checkToken();
    }
  }, [autoCheck, checkToken]);

  return {
    hasGoogleToken,
    isLoading,
    checkToken,
    clearCache
  };
};
