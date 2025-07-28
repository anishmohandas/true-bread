import { Pool } from 'mysql2/promise';
import { Editorial, Editor } from '../interfaces/editorial.interface';

export class EditorialRepository {
    constructor(private pool: Pool) {}

    private transformEditorial(row: any): Editorial {
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

    private cleanMalayalamText(text: string | null): string | null {
        if (!text) return null;
        
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
        } catch (e) {
            console.error('Error cleaning Malayalam text:', e);
            return text;
        }
    }

    async getAllEditorials() {
        try {
            const [rows] = await this.pool.query(`
                SELECT e.*, ed.name as editor_name, ed.role as editor_role, 
                       ed.image_url as editor_image_url, ed.bio as editor_bio
                FROM editorials e
                JOIN editors ed ON e.editor_id = ed.id
                ORDER BY publish_date DESC
            `);
            return rows;
        } catch (error) {
            console.error('Database error:', error);
            throw error;
        }
    }

    async getLatestEditorial(): Promise<Editorial | null> {
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
        
        const [rows] = await this.pool.query(query);
        return (rows as any[]).length ? this.transformEditorial((rows as any[])[0]) : null;
    }

    async getEditorialById(id: string) {
        try {
            const [rows] = await this.pool.query(`
                SELECT e.*, ed.name as editor_name, ed.role as editor_role, 
                       ed.image_url as editor_image_url, ed.bio as editor_bio
                FROM editorials e
                JOIN editors ed ON e.editor_id = ed.id
                WHERE e.id = ?
            `, [id]);
            return (rows as any[]).length ? this.transformEditorial((rows as any[])[0]) : null;
        } catch (error) {
            console.error('Database error:', error);
            throw error;
        }
    }

    async createEditorial(editorial: Editorial): Promise<Editorial> {
        const query = `
            INSERT INTO editorials (
                id, title, content, excerpt, publish_date, editor_id, 
                image_url, month, year, language,
                title_ml, content_ml, excerpt_ml, month_ml
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
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

        await this.pool.query(query, values);
        
        // Get the created editorial
        const [rows] = await this.pool.query(`
            SELECT e.*, 
                   ed.name as editor_name, ed.role as editor_role, 
                   ed.image_url as editor_image_url, ed.bio as editor_bio,
                   ed.name_ml as editor_name_ml, ed.role_ml as editor_role_ml,
                   ed.bio_ml as editor_bio_ml
            FROM editorials e
            LEFT JOIN editors ed ON e.editor_id = ed.id
            WHERE e.id = ?
        `, [editorial.id]);
        
        return this.transformEditorial((rows as any[])[0]);
    }

    async createEditor(editor: Editor): Promise<Editor> {
        const query = `
            INSERT INTO editors (
                name, role, image_url, bio,
                name_ml, role_ml, bio_ml
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
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

        const [result] = await this.pool.query(query, values);
        
        // Get the created editor
        const [rows] = await this.pool.query(`
            SELECT * FROM editors WHERE id = ?
        `, [(result as any).insertId]);
        
        return (rows as any[])[0];
    }
}


