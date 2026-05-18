import { authApi } from '@/services/api';

/**
 * Saves the JWT token to browser localStorage
 */
export const setToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

/**
 * Retrieves the JWT token from browser localStorage
 */
export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

/**
 * Removes the JWT token from browser localStorage
 */
export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

/**
 * Logs the user out by clearing the token and redirecting to login
 */
export const logout = () => {
  removeToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

/**
 * Fetches the current user profile using the stored token.
 * Returns null if the token is missing or invalid.
 */
export const getCurrentUser = async () => {
  const token = getToken();
  if (!token) return null;

  const response = await authApi.getProfile();
  if (response.success) {
    return response.data;
  }

  // If the profile fetch fails, the token is likely invalid or expired
  removeToken();
  return null;
};
