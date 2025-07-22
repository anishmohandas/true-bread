import { Pool } from 'pg';
import { Article, ArticleImage, ArticleTag } from '../interfaces/article.interface';

export class ArticleRepository {
    constructor(private pool: Pool) {}

    async getAllArticles(language?: 'en' | 'ml'): Promise<Article[]> {
        const query = `
            SELECT
                a.*,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'url', ai.url,
                            'alt', ai.alt,
                            'caption', ai.caption,
                            'altMl', ai.alt_ml,
                            'captionMl', ai.caption_ml
                        )
                    ) FILTER (WHERE ai.id IS NOT NULL),
                    '[]'
                ) as images,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'tag', at.tag,
                            'tagMl', at.tag_ml
                        )
                    ) FILTER (WHERE at.id IS NOT NULL),
                    '[]'
                ) as tags
            FROM articles a
            LEFT JOIN article_images ai ON a.id = ai.article_id
            LEFT JOIN article_tags at ON a.id = at.article_id
            ${language ? 'WHERE a.language = $1' : ''}
            GROUP BY a.id
            ORDER BY a.publish_date DESC
        `;

        const values = language ? [language] : [];
        const result = await this.pool.query(query, values);
        return this.transformArticles(result.rows);
    }

    async getFeaturedArticles(language?: 'en' | 'ml'): Promise<Article[]> {
        const query = `
            SELECT
                a.*
            FROM articles a
            WHERE a.is_featured = true
            ${language ? 'AND a.language = $1' : ''}
            ORDER BY a.publish_date DESC;
        `;

        const values = language ? [language] : [];
        const result = await this.pool.query(query, values);
        return this.transformArticles(result.rows);
    }

    async getArticleById(id: string): Promise<Article> {
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
            WHERE a.id = $1
        `;

        const result = await this.pool.query(query, [id]);
        if (result.rows.length === 0) {
            throw new Error('Article not found');
        }

        console.log('Database result:', result.rows[0]); // Debug log
        return this.transformArticle(result.rows[0]);
    }

    private transformArticles(rows: any[]): Article[] {
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

    private transformArticle(row: any): Article {
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

    private cleanMalayalamText(text: string | null): string | undefined {
        if (!text) return undefined;

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

    private decodeMalayalamText(text: string | null): string | undefined {
        if (!text) return undefined;

        try {
            // Convert legacy encoding to proper Unicode
            const malayalamMap: { [key: string]: string } = {
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
        } catch (e) {
            console.error('Error decoding Malayalam text:', e);
            return text;
        }
    }
}








