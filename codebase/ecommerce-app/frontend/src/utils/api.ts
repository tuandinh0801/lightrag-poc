import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// API base URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Default request timeout in milliseconds
const REQUEST_TIMEOUT = 30000;

// Create axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle token expiration
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Handle server errors
    if (error.response?.status === 500) {
      console.error('Server error:', error);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Generic API request function
 * @param method HTTP method
 * @param url API endpoint
 * @param data Request data
 * @param config Additional axios config
 * @returns Promise with response data
 */
const apiRequest = async <T = any>(
  method: string,
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await axiosInstance({
      method,
      url,
      data,
      ...config,
    });
    
    return response.data;
  } catch (error: any) {
    // Format error message
    let errorMessage = 'An unexpected error occurred';
    
    if (error.response) {
      // Server responded with an error status
      errorMessage = error.response.data?.message || `Error: ${error.response.status}`;
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = 'No response from server. Please check your internet connection.';
    } else {
      // Error in setting up the request
      errorMessage = error.message;
    }
    
    // Create a custom error object
    const customError = new Error(errorMessage);
    (customError as any).originalError = error;
    (customError as any).status = error.response?.status;
    
    throw customError;
  }
};

// API methods
export const api = {
  /**
   * GET request
   * @param url API endpoint
   * @param config Additional axios config
   * @returns Promise with response data
   */
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return apiRequest<T>('get', url, undefined, config);
  },
  
  /**
   * POST request
   * @param url API endpoint
   * @param data Request data
   * @param config Additional axios config
   * @returns Promise with response data
   */
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiRequest<T>('post', url, data, config);
  },
  
  /**
   * PUT request
   * @param url API endpoint
   * @param data Request data
   * @param config Additional axios config
   * @returns Promise with response data
   */
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiRequest<T>('put', url, data, config);
  },
  
  /**
   * PATCH request
   * @param url API endpoint
   * @param data Request data
   * @param config Additional axios config
   * @returns Promise with response data
   */
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiRequest<T>('patch', url, data, config);
  },
  
  /**
   * DELETE request
   * @param url API endpoint
   * @param config Additional axios config
   * @returns Promise with response data
   */
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return apiRequest<T>('delete', url, undefined, config);
  },
  
  /**
   * Upload file(s)
   * @param url API endpoint
   * @param formData FormData with files
   * @param onProgress Progress callback
   * @returns Promise with response data
   */
  upload: <T = any>(
    url: string,
    formData: FormData,
    onProgress?: (progressEvent: any) => void
  ): Promise<T> => {
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    
    if (onProgress) {
      config.onUploadProgress = onProgress;
    }
    
    return apiRequest<T>('post', url, formData, config);
  },
};

export default api;
