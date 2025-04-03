"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pg_1 = require("pg");
const config_1 = require("../config");
const publication_repository_1 = require("../repositories/publication.repository");
const router = (0, express_1.Router)();
const pool = new pg_1.Pool(config_1.config.database);
const publicationRepo = new publication_repository_1.PublicationRepository(pool);
// Get all publications
router.get('/', async (req, res) => {
    try {
        const publications = await publicationRepo.getAllPublications();
        res.json(publications);
    }
    catch (error) {
        console.error('Error fetching publications:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch publications',
            details: error?.message || 'Unknown error occurred'
        });
    }
});
// Get publication by ID
router.get('/:id', async (req, res) => {
    try {
        const publication = await publicationRepo.getPublicationById(parseInt(req.params.id));
        if (!publication) {
            return res.status(404).json({ message: 'Publication not found' });
        }
        res.json(publication);
    }
    catch (error) {
        console.error('Error fetching publication:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch publication',
            details: error?.message || 'Unknown error occurred'
        });
    }
});
// Create new publication
router.post('/', async (req, res) => {
    try {
        const publication = await publicationRepo.createPublication(req.body);
        res.status(201).json(publication);
    }
    catch (error) {
        console.error('Error creating publication:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create publication',
            details: error?.message || 'Unknown error occurred'
        });
    }
});
// Update publication
router.put('/:id', async (req, res) => {
    try {
        const publication = await publicationRepo.updatePublication(parseInt(req.params.id), req.body);
        if (!publication) {
            return res.status(404).json({ message: 'Publication not found' });
        }
        res.json(publication);
    }
    catch (error) {
        console.error('Error updating publication:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update publication',
            details: error?.message || 'Unknown error occurred'
        });
    }
});
// Test database connection
router.get('/test-connection', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({
            status: 'Connected',
            timestamp: result.rows[0].now
        });
    }
    catch (error) {
        console.error('Database connection test failed:', error);
        res.status(500).json({
            error: 'Database connection failed',
            details: error.message
        });
    }
});
