"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicationController = void 0;
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
            details: error instanceof Error ? error.message : 'Unknown error occurred'
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
            details: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});
exports.publicationController = router;
