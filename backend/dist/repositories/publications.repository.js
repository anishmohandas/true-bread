"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicationsRepository = void 0;
class PublicationsRepository {
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
                JSON_ARRAYAGG(ph.title) as highlights
            FROM publications p
            LEFT JOIN publication_highlights ph ON p.id = ph.publication_id
            GROUP BY p.id, p.title, p.description, p.cover_image, p.pdf_url, p.publish_date, 
                     p.publication_month, p.publication_year
            ORDER BY p.publish_date DESC
        `;
        try {
            const [rows] = await this.pool.query(query);
            return rows.map(row => ({
                ...row,
                highlights: row.highlights ? JSON.parse(row.highlights) : []
            }));
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
                JSON_ARRAYAGG(ph.title) as highlights
            FROM publications p
            LEFT JOIN publication_highlights ph ON p.id = ph.publication_id
            GROUP BY p.id, p.title, p.description, p.cover_image, p.pdf_url, p.publish_date, 
                     p.publication_month, p.publication_year
            ORDER BY p.publish_date DESC
            LIMIT 1
        `;
        try {
            const [rows] = await this.pool.query(query);
            if (rows.length === 0) {
                return null;
            }
            const row = rows[0];
            return {
                ...row,
                highlights: row.highlights ? JSON.parse(row.highlights) : []
            };
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
                JSON_ARRAYAGG(ph.title) as highlights
            FROM publications p
            LEFT JOIN publication_highlights ph ON p.id = ph.publication_id
            WHERE p.id = ?
            GROUP BY p.id, p.title, p.description, p.cover_image, p.pdf_url, p.publish_date, 
                     p.publication_month, p.publication_year
        `;
        try {
            const [rows] = await this.pool.query(query, [id]);
            if (rows.length === 0) {
                return null;
            }
            const row = rows[0];
            return {
                ...row,
                highlights: row.highlights ? JSON.parse(row.highlights) : []
            };
        }
        catch (error) {
            console.error('Database error:', error);
            throw error;
        }
    }
}
exports.PublicationsRepository = PublicationsRepository;
