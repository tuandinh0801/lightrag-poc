import api from './api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

/**
 * Login user with email and password
 * @param credentials Login credentials
 * @returns Authentication response
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  
  if (response.success && response.data.token) {
    // Store token in localStorage
    localStorage.setItem('token', response.data.token);
    // Store user data in localStorage
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  
  return response;
};

/**
 * Register a new user
 * @param userData User registration data
 * @returns Authentication response
 */
export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', userData);
  
  if (response.success && response.data.token) {
    // Store token in localStorage
    localStorage.setItem('token', response.data.token);
    // Store user data in localStorage
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  
  return response;
};

/**
 * Logout user
 */
export const logout = (): void => {
  // Remove token from localStorage
  localStorage.removeItem('token');
  // Remove user data from localStorage
  localStorage.removeItem('user');
  // Redirect to login page
  window.location.href = '/login';
};

/**
 * Get current authenticated user
 * @returns User object or null
 */
export const getCurrentUser = (): User | null => {
  const userString = localStorage.getItem('user');
  if (!userString) {
    return null;
  }
  
  try {
    return JSON.parse(userString) as User;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns Boolean indicating if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

/**
 * Check if user is an admin
 * @returns Boolean indicating if user is an admin
 */
export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'admin';
};

/**
 * Update user profile
 * @param userData User data to update
 * @returns Updated user data
 */
export const updateProfile = async (userData: Partial<User>): Promise<User> => {
  const response = await api.put<{ success: boolean; data: User }>('/auth/profile', userData);
  
  if (response.success) {
    // Update user data in localStorage
    const currentUser = getCurrentUser();
    const updatedUser = { ...currentUser, ...response.data };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    return updatedUser;
  }
  
  throw new Error('Failed to update profile');
};

/**
 * Change user password
 * @param currentPassword Current password
 * @param newPassword New password
 * @returns Success message
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<string> => {
  const response = await api.put<{ success: boolean; message: string }>(
    '/auth/change-password',
    { currentPassword, newPassword }
  );
  
  if (response.success) {
    return response.message;
  }
  
  throw new Error('Failed to change password');
};

/**
 * Request password reset
 * @param email User email
 * @returns Success message
 */
export const requestPasswordReset = async (email: string): Promise<string> => {
  const response = await api.post<{ success: boolean; message: string }>(
    '/auth/forgot-password',
    { email }
  );
  
  if (response.success) {
    return response.message;
  }
  
  throw new Error('Failed to request password reset');
};

/**
 * Reset password with token
 * @param token Reset token
 * @param newPassword New password
 * @returns Success message
 */
export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<string> => {
  const response = await api.post<{ success: boolean; message: string }>(
    '/auth/reset-password',
    { token, newPassword }
  );
  
  if (response.success) {
    return response.message;
  }
  
  throw new Error('Failed to reset password');
};
