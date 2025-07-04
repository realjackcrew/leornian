/**
 * Utility functions for handling API errors and providing user-friendly messages
 */

/**
 * Detects if an error is a network error (server not reachable)
 * @param {Error} err - The error object from axios/fetch
 * @returns {boolean} - True if it's a network error
 */
export const isNetworkError = (err) => {
  return (
    err?.code === 'ERR_NETWORK' ||
    err?.name === 'NetworkError' ||
    (err?.message && err.message.includes('Network')) ||
    (err?.message && err.message.includes('fetch')) ||
    err?.response === undefined
  );
};

/**
 * Gets a user-friendly error message based on the error type
 * @param {Error} err - The error object from axios/fetch
 * @param {string} defaultMessage - Default message if error type is unknown
 * @returns {string} - User-friendly error message
 */
export const getErrorMessage = (err, defaultMessage = 'An error occurred. Please try again.') => {
  // Network errors (server not reachable)
  if (isNetworkError(err)) {
    return 'Server is starting up. Please wait a moment and try again.';
  }

  // Server errors (5xx)
  if (err?.response?.status >= 500) {
    return 'Server is temporarily unavailable. Please try again in a moment.';
  }

  // Client errors (4xx) - show the specific error message
  if (err?.response?.data?.error) {
    return err.response.data.error;
  }

  // Generic error with message
  if (err?.message) {
    return err.message;
  }

  return defaultMessage;
};

/**
 * Determines if an error should trigger a retry with delay
 * @param {Error} err - The error object from axios/fetch
 * @returns {boolean} - True if the error suggests retrying might help
 */
export const shouldRetry = (err) => {
  return isNetworkError(err) || err?.response?.status >= 500;
};

/**
 * Creates a retry function that waits before retrying
 * @param {Function} fn - The function to retry
 * @param {number} delayMs - Delay in milliseconds before retry
 * @returns {Function} - Function that will retry the original function
 */
export const createRetryFunction = (fn, delayMs = 2000) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (err) {
      if (shouldRetry(err)) {
        console.log(`Retrying after ${delayMs}ms due to:`, err.message);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        return await fn(...args);
      }
      throw err;
    }
  };
}; 