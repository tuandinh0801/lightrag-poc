/**
 * Validation utility functions for frontend forms
 */

/**
 * Validate email format
 * @param email Email to validate
 * @returns True if valid, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param password Password to validate
 * @returns Object with validation result and message
 */
export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  return { isValid: true, message: 'Password is strong' };
};

/**
 * Validate that passwords match
 * @param password Password
 * @param confirmPassword Confirmation password
 * @returns True if matching, false otherwise
 */
export const passwordsMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};

/**
 * Validate phone number format
 * @param phone Phone number to validate
 * @returns True if valid, false otherwise
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate required field
 * @param value Field value
 * @returns True if not empty, false otherwise
 */
export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Validate minimum length
 * @param value Field value
 * @param minLength Minimum length
 * @returns True if valid, false otherwise
 */
export const hasMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength;
};

/**
 * Validate maximum length
 * @param value Field value
 * @param maxLength Maximum length
 * @returns True if valid, false otherwise
 */
export const hasMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};

/**
 * Validate numeric value
 * @param value Field value
 * @returns True if numeric, false otherwise
 */
export const isNumeric = (value: string): boolean => {
  return /^\d+$/.test(value);
};

/**
 * Validate decimal value
 * @param value Field value
 * @returns True if decimal, false otherwise
 */
export const isDecimal = (value: string): boolean => {
  return /^\d+(\.\d+)?$/.test(value);
};

/**
 * Validate URL format
 * @param url URL to validate
 * @returns True if valid, false otherwise
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Validate postal/zip code format
 * @param code Postal/zip code to validate
 * @param countryCode Country code (default: 'US')
 * @returns True if valid, false otherwise
 */
export const isValidPostalCode = (code: string, countryCode: string = 'US'): boolean => {
  // Basic validation for common country formats
  const postalRegexes: { [key: string]: RegExp } = {
    US: /^\d{5}(-\d{4})?$/,
    CA: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
    UK: /^[A-Za-z]{1,2}\d[A-Za-z\d]? \d[A-Za-z]{2}$/,
    AU: /^\d{4}$/,
    DE: /^\d{5}$/,
    FR: /^\d{5}$/,
    IT: /^\d{5}$/,
    ES: /^\d{5}$/,
    NL: /^\d{4}[ ]?[A-Za-z]{2}$/,
    BE: /^\d{4}$/,
  };
  
  const regex = postalRegexes[countryCode] || postalRegexes.US;
  return regex.test(code);
};

/**
 * Validate credit card number using Luhn algorithm
 * @param cardNumber Credit card number to validate
 * @returns True if valid, false otherwise
 */
export const isValidCreditCard = (cardNumber: string): boolean => {
  // Remove spaces and dashes
  const sanitized = cardNumber.replace(/[\s-]/g, '');
  
  // Check if contains only digits
  if (!/^\d+$/.test(sanitized)) {
    return false;
  }
  
  // Check length (most cards are 13-19 digits)
  if (sanitized.length < 13 || sanitized.length > 19) {
    return false;
  }
  
  // Luhn algorithm
  let sum = 0;
  let double = false;
  
  // Loop from right to left
  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i), 10);
    
    if (double) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    double = !double;
  }
  
  return sum % 10 === 0;
};

/**
 * Validate credit card expiration date
 * @param month Expiration month (1-12)
 * @param year Expiration year (4 digits)
 * @returns True if valid and not expired, false otherwise
 */
export const isValidExpirationDate = (month: number, year: number): boolean => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11
  const currentYear = now.getFullYear();
  
  // Check if month is valid
  if (month < 1 || month > 12) {
    return false;
  }
  
  // Check if expired
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return false;
  }
  
  return true;
};

/**
 * Validate CVV code
 * @param cvv CVV code
 * @param cardType Card type (default: 'visa')
 * @returns True if valid, false otherwise
 */
export const isValidCVV = (cvv: string, cardType: string = 'visa'): boolean => {
  // Remove spaces
  const sanitized = cvv.replace(/\s/g, '');
  
  // Check if contains only digits
  if (!/^\d+$/.test(sanitized)) {
    return false;
  }
  
  // American Express uses 4-digit CVV, others use 3-digit
  const expectedLength = cardType.toLowerCase() === 'amex' ? 4 : 3;
  
  return sanitized.length === expectedLength;
};
