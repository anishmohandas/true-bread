import { Pool } from 'mysql2/promise';
import { Publication } from '../interfaces/publication.interface';

export class PublicationRepository {
    constructor(private pool: Pool) {}

    async getAllPublications(): Promise<Publication[]> {
        const query = `
            SELECT 
                p.id,
                p.title,
                p.description,
                p.cover_image AS coverImage,
                p.pdf_url AS pdfUrl,
                p.publish_date AS publishDate,
                p.publication_month AS month,
                p.publication_year AS year,
                p.issue_number AS issueNumber,
                GROUP_CONCAT(ph.title) AS highlights
            FROM publications p
            LEFT JOIN publication_highlights ph ON p.id = ph.publication_id COLLATE utf8mb4_unicode_ci
            GROUP BY p.id, p.title, p.description, p.cover_image, p.pdf_url, p.publish_date, 
                     p.publication_month, p.publication_year, p.issue_number
            ORDER BY p.publish_date DESC
        `;

        try {
            const [rows] = await this.pool.query<any[]>(query);
            return rows.map(row => ({
                ...row,
                highlights: row.highlights ? (row.highlights as string).split(',') : []
            }));
        } catch (error) {
            console.error('Database error:', error);
            throw error;
        }
    }

    async getLatestPublication(): Promise<Publication | null> {
        const query = `
            SELECT 
                p.id,
                p.title,
                p.description,
                p.cover_image AS coverImage,
                p.pdf_url AS pdfUrl,
                p.publish_date AS publishDate,
                p.publication_month AS month,
                p.publication_year AS year,
                p.issue_number AS issueNumber,
                GROUP_CONCAT(ph.title) AS highlights
            FROM publications p
            LEFT JOIN publication_highlights ph ON p.id = ph.publication_id COLLATE utf8mb4_unicode_ci
            GROUP BY p.id, p.title, p.description, p.cover_image, p.pdf_url, p.publish_date, 
                     p.publication_month, p.publication_year, p.issue_number
            ORDER BY p.publish_date DESC
            LIMIT 1
        `;

        try {
            const [rows] = await this.pool.query<any[]>(query);
            if (rows.length === 0) {
                return null;
            }
            const row = rows[0];
            return {
                ...row,
                highlights: row.highlights ? (row.highlights as string).split(',') : []
            };
        } catch (error) {
            console.error('Database error:', error);
            throw error;
        }
    }

    async getPublicationById(id: string): Promise<Publication | null> {
        const query = `
            SELECT 
                p.id,
                p.title,
                p.description,
                p.cover_image AS coverImage,
                p.pdf_url AS pdfUrl,
                p.publish_date AS publishDate,
                p.publication_month AS month,
                p.publication_year AS year,
                p.issue_number AS issueNumber,
                GROUP_CONCAT(ph.title) AS highlights
            FROM publications p
            LEFT JOIN publication_highlights ph ON p.id = ph.publication_id COLLATE utf8mb4_unicode_ci
            WHERE p.id = ?
            GROUP BY p.id, p.title, p.description, p.cover_image, p.pdf_url, p.publish_date, 
                     p.publication_month, p.publication_year, p.issue_number
        `;

        try {
            const [rows] = await this.pool.query<any[]>(query, [id]);
            if (rows.length === 0) {
                return null;
            }
            const row = rows[0];
            return {
                ...row,
                highlights: row.highlights ? (row.highlights as string).split(',') : []
            };
        } catch (error) {
            console.error('Database error:', error);
            throw error;
        }
    }
}
