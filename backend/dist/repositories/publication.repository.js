"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicationRepository = void 0;
class PublicationRepository {
    constructor(pool) {
        this.pool = pool;
    }
    async getAllPublications() {
        const query = `
            SELECT 
                p.id,
                p.title,
                p.description,
                p.cover_image as "coverImage",
                p.pdf_url as "pdfUrl",
                p.publish_date as "publishDate",
                p.publication_month as "month",
                p.publication_year as "year",
                p.issue_number as "issueNumber",
                ARRAY_AGG(ph.title) as highlights
            FROM publications p
            LEFT JOIN publication_highlights ph ON p.id = ph.publication_id
            GROUP BY p.id, p.title, p.description, p.cover_image, p.pdf_url, p.publish_date, 
                     p.publication_month, p.publication_year, p.issue_number
            ORDER BY p.publish_date DESC
        `;
        try {
            const result = await this.pool.query(query);
            return result.rows;
        }
        catch (error) {
            console.error('Database error:', error);
            throw error;
        }
    }
    async getLatestPublication() {
        const query = `
            SELECT 
                p.id,
                p.title,
                p.description,
                p.cover_image as "coverImage",
                p.pdf_url as "pdfUrl",
                p.publish_date as "publishDate",
                p.publication_month as "month",
                p.publication_year as "year",
                p.issue_number as "issueNumber",
                ARRAY_AGG(ph.title) as highlights
            FROM publications p
            LEFT JOIN publication_highlights ph ON p.id = ph.publication_id
            GROUP BY p.id, p.title, p.description, p.cover_image, p.pdf_url, p.publish_date, 
                     p.publication_month, p.publication_year, p.issue_number
            ORDER BY p.publish_date DESC
            LIMIT 1
        `;
        try {
            const result = await this.pool.query(query);
            return result.rows[0] || null;
        }
        catch (error) {
            console.error('Database error:', error);
            throw error;
        }
    }
    async getPublicationById(id) {
        const query = `
            SELECT 
                p.id,
                p.title,
                p.description,
                p.cover_image as "coverImage",
                p.pdf_url as "pdfUrl",
                p.publish_date as "publishDate",
                p.publication_month as "month",
                p.publication_year as "year",
                p.issue_number as "issueNumber",
                ARRAY_AGG(ph.title) as highlights
            FROM publications p
            LEFT JOIN publication_highlights ph ON p.id = ph.publication_id
            WHERE p.id = $1
            GROUP BY p.id, p.title, p.description, p.cover_image, p.pdf_url, p.publish_date, 
                     p.publication_month, p.publication_year, p.issue_number
        `;
        try {
            const result = await this.pool.query(query, [id]);
            return result.rows[0] || null;
        }
        catch (error) {
            console.error('Database error:', error);
            throw error;
        }
    }
}
exports.PublicationRepository = PublicationRepository;
