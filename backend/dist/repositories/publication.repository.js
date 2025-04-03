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
                ARRAY_AGG(ph.title) as highlights
            FROM publications p
            LEFT JOIN publication_highlights ph ON p.id = ph.publication_id
            GROUP BY p.id, p.title, p.description, p.cover_image, p.pdf_url, p.publish_date, 
                     p.publication_month, p.publication_year
            ORDER BY p.publish_date DESC
        `;
        const result = await this.pool.query(query);
        return result.rows;
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
                ARRAY_AGG(ph.title) as highlights
            FROM publications p
            LEFT JOIN publication_highlights ph ON p.id = ph.publication_id
            WHERE p.id = $1
            GROUP BY p.id, p.title, p.description, p.cover_image, p.pdf_url, p.publish_date,
                     p.publication_month, p.publication_year
        `;
        const result = await this.pool.query(query, [id]);
        return result.rows[0] || null;
    }
    async createPublication(publication) {
        const query = `
            INSERT INTO publications (
                title, description, cover_image, pdf_url, publish_date, 
                publication_month, publication_year
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const result = await this.pool.query(query, [
            publication.title,
            publication.description,
            publication.coverImage,
            publication.pdfUrl,
            publication.publishDate,
            publication.month,
            publication.year
        ]);
        return result.rows[0];
    }
    async updatePublication(id, publication) {
        const query = `
            UPDATE publications
            SET 
                title = COALESCE($1, title),
                description = COALESCE($2, description),
                cover_image = COALESCE($3, cover_image),
                pdf_url = COALESCE($4, pdf_url),
                publish_date = COALESCE($5, publish_date),
                publication_month = COALESCE($6, publication_month),
                publication_year = COALESCE($7, publication_year)
            WHERE id = $8
            RETURNING *
        `;
        const result = await this.pool.query(query, [
            publication.title,
            publication.description,
            publication.coverImage,
            publication.pdfUrl,
            publication.publishDate,
            publication.month,
            publication.year,
            id
        ]);
        return result.rows[0] || null;
    }
}
exports.PublicationRepository = PublicationRepository;
