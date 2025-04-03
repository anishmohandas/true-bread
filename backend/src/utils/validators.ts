export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const getEmailValidationError = (email: string): string | null => {
    if (!email) {
        return 'Email is required';
    }
    if (!validateEmail(email)) {
        return 'Invalid email format';
    }
    return null;
};
