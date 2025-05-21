/**
 * Format a price with currency symbol
 * @param price Price to format
 * @param currency Currency code (default: USD)
 * @returns Formatted price string
 */
export const formatPrice = (price: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

/**
 * Format a date to a readable string
 * @param date Date to format
 * @param options Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
};

/**
 * Format a date to a relative time string (e.g., "2 days ago")
 * @param date Date to format
 * @returns Relative time string
 */
export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  // Less than a minute
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  // Less than an hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  
  // Less than a day
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  
  // Less than a week
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  
  // Less than a month
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }
  
  // Less than a year
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
  
  // More than a year
  const years = Math.floor(diffInSeconds / 31536000);
  return `${years} year${years > 1 ? 's' : ''} ago`;
};

/**
 * Truncate a string to a specified length
 * @param str String to truncate
 * @param maxLength Maximum length
 * @param suffix Suffix to add if truncated (default: "...")
 * @returns Truncated string
 */
export const truncateString = (
  str: string,
  maxLength: number,
  suffix: string = '...'
): string => {
  if (str.length <= maxLength) {
    return str;
  }
  
  return str.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Format a phone number to a readable format
 * @param phone Phone number to format
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if the input is valid
  if (cleaned.length < 10) {
    return phone;
  }
  
  // Format the phone number
  if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
  }
  
  // Handle international numbers
  return `+${cleaned.substring(0, cleaned.length - 10)} (${cleaned.substring(cleaned.length - 10, cleaned.length - 7)}) ${cleaned.substring(cleaned.length - 7, cleaned.length - 4)}-${cleaned.substring(cleaned.length - 4)}`;
};

/**
 * Format a file size to a readable string
 * @param bytes Size in bytes
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted size string
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) {
    return '0 Bytes';
  }
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

/**
 * Format a number with commas
 * @param num Number to format
 * @returns Formatted number string
 */
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
