"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditorialRepository = void 0;
class EditorialRepository {
    constructor(pool) {
        this.pool = pool;
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
        console.log('Attempting to fetch latest editorial from database...');
        try {
            const result = await this.pool.query(`
                SELECT e.*, ed.name as editor_name, ed.role as editor_role, 
                       ed.image_url as editor_image_url, ed.bio as editor_bio
                FROM editorials e
                JOIN editors ed ON e.editor_id = ed.id
                ORDER BY publish_date DESC 
                LIMIT 1
            `);
            console.log('Query result:', result.rows);
            return result.rows[0] || null;
        }
        catch (error) {
            console.error('Database error:', error);
            throw error;
        }
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
            return result.rows[0] || null;
        }
        catch (error) {
            console.error('Database error:', error);
            throw error;
        }
    }
}
exports.EditorialRepository = EditorialRepository;
