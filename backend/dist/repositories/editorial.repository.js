"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditorialRepository = void 0;
class EditorialRepository {
    constructor(pool) {
        this.pool = pool;
    }
    transformEditorial(row) {
        console.log('Row received:', row);
        return {
            id: row.id,
            title: row.title,
            content: row.content,
            excerpt: row.excerpt,
            publishDate: row.publish_date,
            editorId: row.editor_id,
            imageUrl: row.image_url,
            month: row.month,
            year: row.year,
            language: row.language,
            // Clean Malayalam fields before sending
            titleMl: this.cleanMalayalamText(row.title_ml),
            contentMl: this.cleanMalayalamText(row.content_ml),
            excerptMl: this.cleanMalayalamText(row.excerpt_ml),
            monthMl: this.cleanMalayalamText(row.month_ml),
            // Bind editor details directly
            editor: {
                id: row.editor_id,
                name: row.editor_name,
                role: row.editor_role,
                imageUrl: row.editor_image_url,
                bio: row.editor_bio,
                nameMl: this.cleanMalayalamText(row.editor_name_ml),
                roleMl: this.cleanMalayalamText(row.editor_role_ml),
                bioMl: this.cleanMalayalamText(row.editor_bio_ml)
            }
        };
    }
    cleanMalayalamText(text) {
        if (!text)
            return null;
        try {
            return text
                // Handle double escaped characters first
                .replace(/\\\\/g, '\\')
                // Handle escaped Malayalam characters
                .replace(/\\([^\x00-\x7F])/g, '$1')
                // Handle escaped brackets
                .replace(/\\\[/g, '[')
                .replace(/\\\]/g, ']')
                // Handle other common escaped characters
                .replace(/\\n/g, '\n')
                .replace(/\\t/g, '\t')
                // Remove any remaining unnecessary escapes
                .replace(/\\(?=[a-zA-Z])/g, '');
        }
        catch (e) {
            console.error('Error cleaning Malayalam text:', e);
            return text;
        }
    }
    async getAllEditorials() {
        try {
            const result = await this.pool.query(`
                SELECT e.*, ed.name as editor_name, ed.role as editor_role, 
                       ed.image_url as editor_image_url, ed.bio as editor_bio
                FROM editorials e
                JOIN editors ed ON e.editor_id = ed.id
                ORDER BY publish_date DESC
            `);
            return result.rows;
        }
        catch (error) {
            console.error('Database error:', error);
            throw error;
        }
    }
    async getLatestEditorial() {
        const query = `
            SELECT e.*, 
                   ed.name as editor_name, ed.role as editor_role, 
                   ed.image_url as editor_image_url, ed.bio as editor_bio,
                   ed.name_ml as editor_name_ml, ed.role_ml as editor_role_ml,
                   ed.bio_ml as editor_bio_ml
            FROM editorials e
            LEFT JOIN editors ed ON e.editor_id = ed.id
            ORDER BY e.publish_date DESC
            LIMIT 1
        `;
        const result = await this.pool.query(query);
        return result.rows.length ? this.transformEditorial(result.rows[0]) : null;
    }
    async getEditorialById(id) {
        try {
            const result = await this.pool.query(`
                SELECT e.*, ed.name as editor_name, ed.role as editor_role, 
                       ed.image_url as editor_image_url, ed.bio as editor_bio
                FROM editorials e
                JOIN editors ed ON e.editor_id = ed.id
                WHERE e.id = $1
            `, [id]);
            return result.rows.length ? this.transformEditorial(result.rows[0]) : null;
        }
        catch (error) {
            console.error('Database error:', error);
            throw error;
        }
    }
    async createEditorial(editorial) {
        const query = `
            INSERT INTO editorials (
                id, title, content, excerpt, publish_date, editor_id, 
                image_url, month, year, language,
                title_ml, content_ml, excerpt_ml, month_ml
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
            ) RETURNING *
        `;
        const values = [
            editorial.id,
            editorial.title,
            editorial.content,
            editorial.excerpt,
            editorial.publishDate,
            editorial.editorId,
            editorial.imageUrl,
            editorial.month,
            editorial.year,
            editorial.language,
            editorial.titleMl,
            editorial.contentMl,
            editorial.excerptMl,
            editorial.monthMl
        ];
        const result = await this.pool.query(query, values);
        return this.transformEditorial(result.rows[0]);
    }
    async createEditor(editor) {
        const query = `
            INSERT INTO editors (
                name, role, image_url, bio,
                name_ml, role_ml, bio_ml
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const values = [
            editor.name,
            editor.role,
            editor.imageUrl,
            editor.bio,
            editor.nameMl,
            editor.roleMl,
            editor.bioMl
        ];
        const result = await this.pool.query(query, values);
        return result.rows[0];
    }
}
exports.EditorialRepository = EditorialRepository;
