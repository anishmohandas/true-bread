import rateLimit from 'express-rate-limit';

export const subscriptionLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many subscription attempts from this IP, please try again after an hour'
});

export const unsubscribeLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours window
    max: 3, // limit each IP to 3 requests per windowMs
    message: 'Too many unsubscribe attempts from this IP, please try again after 24 hours'
});