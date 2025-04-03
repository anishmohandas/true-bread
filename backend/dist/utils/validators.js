"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmailValidationError = exports.validateEmail = void 0;
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
const getEmailValidationError = (email) => {
    if (!email) {
        return 'Email is required';
    }
    if (!(0, exports.validateEmail)(email)) {
        return 'Invalid email format';
    }
    return null;
};
exports.getEmailValidationError = getEmailValidationError;
