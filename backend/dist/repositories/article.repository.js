"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleRepository = void 0;
class ArticleRepository {
    constructor(pool) {
        this.pool = pool;
    }
    async getAllArticles(language) {
        const query = `
            SELECT
                a.*,
                COALESCE(
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'url', ai.url,
                            'alt', ai.alt,
                            'caption', ai.caption,
                            'altMl', ai.alt_ml,
                            'captionMl', ai.caption_ml
                        )
                    ),
                    '[]'
                ) as images,
                COALESCE(
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'tag', at.tag,
                            'tagMl', at.tag_ml
                        )
                    ),
                    '[]'
                ) as tags
            FROM articles a
            LEFT JOIN article_images ai ON a.id = ai.article_id
            LEFT JOIN article_tags at ON a.id = at.article_id
            ${language ? 'WHERE a.language = ?' : ''}
            GROUP BY a.id
            ORDER BY a.publish_date DESC
        `;
        const values = language ? [language] : [];
        const [rows] = await this.pool.query(query, values);
        return this.transformArticles(rows);
    }
    async getFeaturedArticles(language) {
        const query = `
            SELECT
                a.*
            FROM articles a
            WHERE a.is_featured = true
            ${language ? 'AND a.language = ?' : ''}
            ORDER BY a.publish_date DESC;
        `;
        const values = language ? [language] : [];
        const [rows] = await this.pool.query(query, values);
        return this.transformArticles(rows);
    }
    async getArticleById(id) {
        const query = `
            SELECT
                a.*,
                a.title_ml,
                a.author_ml,
                a.job_title_ml,
                a.works_at_ml,
                a.category_ml,
                a.content_ml,
                a.excerpt_ml,
                a.alt_text_ml,
                a.language
            FROM articles a
            WHERE a.id = ?
        `;
        const [rows] = await this.pool.query(query, [id]);
        const rowsArray = rows;
        if (rowsArray.length === 0) {
            throw new Error('Article not found');
        }
        console.log('Database result:', rowsArray[0]); // Debug log
        return this.transformArticle(rowsArray[0]);
    }
    transformArticles(rows) {
        return rows.map(row => ({
            id: row.id,
            title: row.title,
            author: row.author,
            jobTitle: row.job_title,
            worksAt: row.works_at,
            category: row.category,
            imageUrl: row.image_url,
            altText: row.alt_text,
            content: row.content,
            excerpt: row.excerpt,
            publishDate: row.publish_date,
            readTime: row.read_time,
            isFeatured: row.is_featured,
            language: row.language,
            // Clean Malayalam fields before sending
            titleMl: this.cleanMalayalamText(row.title_ml) || undefined,
            authorMl: this.cleanMalayalamText(row.author_ml) || undefined,
            jobTitleMl: this.cleanMalayalamText(row.job_title_ml) || undefined,
            worksAtMl: this.cleanMalayalamText(row.works_at_ml) || undefined,
            categoryMl: this.cleanMalayalamText(row.category_ml) || undefined,
            altTextMl: this.cleanMalayalamText(row.alt_text_ml) || undefined,
            contentMl: this.cleanMalayalamText(row.content_ml) || undefined,
            excerptMl: this.cleanMalayalamText(row.excerpt_ml) || undefined,
            images: row.images,
            tags: row.tags
        }));
    }
    transformArticle(row) {
        return {
            id: row.id,
            title: row.title,
            author: row.author,
            jobTitle: row.job_title,
            worksAt: row.works_at,
            category: row.category,
            imageUrl: row.image_url,
            altText: row.alt_text,
            content: row.content,
            excerpt: row.excerpt,
            publishDate: row.publish_date,
            readTime: row.read_time,
            isFeatured: row.is_featured,
            language: row.language,
            // Properly decode Malayalam fields
            titleMl: this.decodeMalayalamText(row.title_ml) || undefined,
            authorMl: this.decodeMalayalamText(row.author_ml) || undefined,
            jobTitleMl: this.decodeMalayalamText(row.job_title_ml) || undefined,
            worksAtMl: this.decodeMalayalamText(row.works_at_ml) || undefined,
            categoryMl: this.decodeMalayalamText(row.category_ml) || undefined,
            altTextMl: this.decodeMalayalamText(row.alt_text_ml) || undefined,
            contentMl: this.decodeMalayalamText(row.content_ml) || undefined,
            excerptMl: this.decodeMalayalamText(row.excerpt_ml) || undefined,
            images: row.images || [],
            tags: row.tags || []
        };
    }
    cleanMalayalamText(text) {
        if (!text)
            return undefined;
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
    decodeMalayalamText(text) {
        if (!text)
            return undefined;
        try {
            // Convert legacy encoding to proper Unicode
            const malayalamMap = {
                'B': 'അ',
                '[': 'ധി',
                ']': 'കാ',
                'À': 'ർ',
                'Æ': 'വ',
                '­': 'ണ്',
                '¡': 'ക്ക',
                '¨': 'ച്ച',
                'ä': 'റ്റ',
                'Ì': 'സ്റ്റ',
                // Add more mappings as needed
            };
            return text.replace(/[B\[\]À­¡¨äÌ]/g, match => malayalamMap[match] || match);
        }
        catch (e) {
            console.error('Error decoding Malayalam text:', e);
            return text;
        }
    }
}
exports.ArticleRepository = ArticleRepository;
