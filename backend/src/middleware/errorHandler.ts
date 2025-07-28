import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}

export const errorHandler = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' 
        ? (statusCode === 500 ? 'Internal Server Error' : err.message)
        : err.message;

    // Log error in production
    if (process.env.NODE_ENV === 'production') {
        console.error(`[${new Date().toISOString()}] ERROR ${statusCode}: ${err.message}`);
        console.error(`Stack: ${err.stack}`);
        console.error(`Request: ${req.method} ${req.path}`);
        console.error(`Body:`, req.body);
    }

    res.status(statusCode).json({
        success: false,
        error: {
            message,
            ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
        }
    });
};

export const notFoundHandler = (req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        error: {
            message: `Route ${req.method} ${req.path} not found`
        }
    });
};

export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
