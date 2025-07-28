import { Pool } from 'mysql2/promise';
import { Publication } from '../interfaces/publication.interface';

export class PublicationsRepository {
    constructor(private pool: Pool) {}

    async getAllPublications(): Promise<Publication[]> {
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
            return (rows as any[]).map(row => ({
                ...row,
                highlights: row.highlights ? JSON.parse(row.highlights) : []
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
            if ((rows as any[]).length === 0) {
                return null;
            }
            const row = (rows as any[])[0];
            return {
                ...row,
                highlights: row.highlights ? JSON.parse(row.highlights) : []
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
            if ((rows as any[]).length === 0) {
                return null;
            }
            const row = (rows as any[])[0];
            return {
                ...row,
                highlights: row.highlights ? JSON.parse(row.highlights) : []
            };
        } catch (error) {
            console.error('Database error:', error);
            throw error;
        }
    }
}
