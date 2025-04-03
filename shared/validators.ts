export const EMAIL_REGEX = /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/;

export const EMAIL_BLOCKED_DOMAINS = [
  'tempmail.com',
  'throwawaymail.com',
  // Add more disposable email domains as needed
];

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateEmail(email: string): EmailValidationResult {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' };
  }

  if (email.length > 254) {
    return { isValid: false, error: 'Email is too long' };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  const domain = email.toLowerCase().split('@')[1];
  if (EMAIL_BLOCKED_DOMAINS.includes(domain)) {
    return { isValid: false, error: 'This email domain is not allowed' };
  }

  return { isValid: true };
}