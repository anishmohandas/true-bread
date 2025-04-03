import { Router } from 'express';
import { Pool } from 'pg';
import { config } from '../config';
import { ArticleRepository } from '../repositories/article.repository';

const router = Router();
const pool = new Pool(config.database);
const articleRepo = new ArticleRepository(pool);

// Get all articles
router.get('/', async (req, res) => {
    try {
        const articles = await articleRepo.getAllArticles();
        if (!articles || articles.length === 0) {
            return res.status(404).json({
                status: 'error',
                code: 'ARTICLES_NOT_FOUND',
                message: 'No articles found'
            });
        }
        res.json({
            status: 'success',
            data: articles
        });
    } catch (error: any) {
        console.error('Error fetching articles:', error);
        res.status(500).json({
            status: 'error',
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch articles',
            details: error?.message || 'Unknown error occurred'
        });
    }
});

// Get featured articles
router.get('/featured', async (req, res) => {
    try {
        const articles = await articleRepo.getFeaturedArticles();
        if (!articles || !Array.isArray(articles)) {
            return res.status(404).json({
                status: 'error',
                code: 'FEATURED_ARTICLES_NOT_FOUND',
                message: 'No featured articles found'
            });
        }
        
        res.json({
            status: 'success',
            data: articles
        });
    } catch (error: any) {
        console.error('Error fetching featured articles:', error);
        res.status(500).json({
            status: 'error',
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch featured articles',
            details: error?.message || 'Unknown error occurred'
        });
    }
});

// Get article by ID
router.get('/:id', async (req, res) => {
    try {
        const article = await articleRepo.getArticleById(req.params.id);
        if (!article) {
            return res.status(404).json({
                status: 'error',
                code: 'ARTICLE_NOT_FOUND',
                message: 'Article not found'
            });
        }
        res.json({
            status: 'success',
            data: article
        });
    } catch (error: any) {
        console.error('Error fetching article:', error);
        res.status(500).json({
            status: 'error',
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch article',
            details: error?.message || 'Unknown error occurred'
        });
    }
});

export const articleController = router;


