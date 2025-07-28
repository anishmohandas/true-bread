import { Router } from 'express';
import { pool } from '../db';
import { PublicationRepository } from '../repositories/publication.repository';

const router = Router();
const publicationRepo = new PublicationRepository(pool);

// Get all publications
router.get('/', async (req, res) => {
    try {
        const publications = await publicationRepo.getAllPublications();
        res.json(publications);
    } catch (error: unknown) {
        console.error('Error fetching publications:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch publications',
            details: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});

// Get latest publication
router.get('/latest', async (req, res) => {
    try {
        const publication = await publicationRepo.getLatestPublication();
        if (!publication) {
            return res.status(404).json({
                status: 'error',
                message: 'No publications found'
            });
        }
        res.json(publication);
    } catch (error: unknown) {
        console.error('Error fetching latest publication:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch latest publication',
            details: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});

// Get publication by ID
router.get('/:id', async (req, res) => {
    try {
        const publication = await publicationRepo.getPublicationById(req.params.id);
        if (!publication) {
            return res.status(404).json({
                status: 'error',
                message: 'Publication not found'
            });
        }
        res.json(publication);
    } catch (error: unknown) {
        console.error('Error fetching publication:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch publication',
            details: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});

export const publicationController = router;
