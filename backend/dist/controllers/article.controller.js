"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.articleController = void 0;
const express_1 = require("express");
const db_1 = require("../db");
const article_repository_1 = require("../repositories/article.repository");
const router = (0, express_1.Router)();
const articleRepo = new article_repository_1.ArticleRepository(db_1.pool);
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
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
        console.error('Error fetching article:', error);
        res.status(500).json({
            status: 'error',
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch article',
            details: error?.message || 'Unknown error occurred'
        });
    }
});
exports.articleController = router;
