"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editorialController = void 0;
const express_1 = require("express");
const pg_1 = require("pg");
const config_1 = require("../config");
const editorial_repository_1 = require("../repositories/editorial.repository");
const router = (0, express_1.Router)();
const pool = new pg_1.Pool(config_1.config.database);
const editorialRepo = new editorial_repository_1.EditorialRepository(pool);
// Test database connection route
router.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({
            status: 'success',
            message: 'Database connection successful',
            timestamp: result.rows[0].now
        });
    }
    catch (error) {
        console.error('Database connection test failed:', error);
        res.status(500).json({
            status: 'error',
            message: 'Database connection failed',
            details: error?.message || 'Unknown error occurred'
        });
    }
});
// Get all editorials
router.get('/', async (req, res) => {
    try {
        const editorials = await editorialRepo.getAllEditorials();
        if (!editorials || editorials.length === 0) {
            return res.status(404).json({
                status: 'error',
                code: 'EDITORIALS_NOT_FOUND',
                message: 'No editorials found'
            });
        }
        res.json({
            status: 'success',
            data: editorials
        });
    }
    catch (error) {
        console.error('Error fetching editorials:', error);
        res.status(500).json({
            status: 'error',
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch editorials',
            details: error?.message || 'Unknown error occurred'
        });
    }
});
// Get latest editorial
router.get('/latest', async (req, res) => {
    console.log('Received request for latest editorial');
    try {
        const editorial = await editorialRepo.getLatestEditorial();
        if (!editorial) {
            return res.status(404).json({
                status: 'error',
                code: 'EDITORIAL_NOT_FOUND',
                message: 'No published editorials found'
            });
        }
        res.json({
            status: 'success',
            data: editorial
        });
    }
    catch (error) {
        console.error('Error fetching latest editorial:', error);
        res.status(500).json({
            status: 'error',
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch latest editorial',
            details: error?.message || 'Unknown error occurred'
        });
    }
});
// Get editorial by ID
router.get('/:id', async (req, res) => {
    try {
        const editorial = await editorialRepo.getEditorialById(req.params.id);
        if (!editorial) {
            return res.status(404).json({
                status: 'error',
                code: 'EDITORIAL_NOT_FOUND',
                message: 'Editorial not found'
            });
        }
        res.json({
            status: 'success',
            data: editorial
        });
    }
    catch (error) {
        console.error('Error fetching editorial:', error);
        res.status(500).json({
            status: 'error',
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch editorial',
            details: error?.message || 'Unknown error occurred'
        });
    }
});
exports.editorialController = router;
