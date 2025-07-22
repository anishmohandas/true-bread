/**
 * MySQL version of the Article Repository
 * This shows how to convert PostgreSQL queries to MySQL syntax
 */

const db = require('../db/mysql-connection');

class ArticleRepository {
  /**
   * Get all articles
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - List of articles
   */
  async getAllArticles(options = {}) {
    const { limit = 10, offset = 0, featured = false, category = null } = options;
    
    let query = `
      SELECT * FROM articles
      WHERE 1=1
    `;
    
    const params = [];
    
    // Add filters
    if (featured) {
      query += ` AND is_featured = ?`;
      params.push(1); // MySQL uses 1/0 instead of true/false
    }
    
    if (category) {
      query += ` AND category = ?`;
      params.push(category);
    }
    
    // Add sorting and pagination
    query += ` ORDER BY published_date DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    return await db.query(query, params);
  }
  
  /**
   * Get article by ID
   * @param {string} id - Article ID
   * @returns {Promise<Object>} - Article data
   */
  async getArticleById(id) {
    const query = `SELECT * FROM articles WHERE id = ?`;
    const articles = await db.query(query, [id]);
    return articles[0]; // Return first result or undefined
  }
  
  /**
   * Create a new article
   * @param {Object} articleData - Article data
   * @returns {Promise<Object>} - Created article
   */
  async createArticle(articleData) {
    const {
      id,
      title,
      author,
      job_title,
      works_at,
      category,
      image_url,
      alt_text,
      content,
      excerpt,
      published_date,
      is_featured,
      title_ml,
      author_ml,
      job_title_ml,
      works_at_ml,
      category_ml,
      alt_text_ml,
      content_ml,
      excerpt_ml
    } = articleData;
    
    // In PostgreSQL, this would use RETURNING id
    // In MySQL, we need to use the insertId property
    const query = `
      INSERT INTO articles (
        id, title, author, job_title, works_at, category, image_url, alt_text,
        content, excerpt, published_date, is_featured, title_ml, author_ml,
        job_title_ml, works_at_ml, category_ml, alt_text_ml, content_ml, excerpt_ml
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `;
    
    const params = [
      id,
      title,
      author,
      job_title,
      works_at,
      category,
      image_url,
      alt_text,
      content,
      excerpt,
      published_date,
      is_featured ? 1 : 0, // Convert boolean to 1/0
      title_ml,
      author_ml,
      job_title_ml,
      works_at_ml,
      category_ml,
      alt_text_ml,
      content_ml,
      excerpt_ml
    ];
    
    await db.query(query, params);
    
    // Return the created article
    return this.getArticleById(id);
  }
  
  /**
   * Update an article
   * @param {string} id - Article ID
   * @param {Object} articleData - Article data to update
   * @returns {Promise<Object>} - Updated article
   */
  async updateArticle(id, articleData) {
    // Build dynamic update query
    const fields = [];
    const params = [];
    
    // Add each field to the update query
    Object.entries(articleData).forEach(([key, value]) => {
      // Skip id field
      if (key === 'id') return;
      
      fields.push(`${key} = ?`);
      
      // Convert boolean to 1/0 for MySQL
      if (key === 'is_featured') {
        params.push(value ? 1 : 0);
      } else {
        params.push(value);
      }
    });
    
    // Add id as the last parameter
    params.push(id);
    
    const query = `
      UPDATE articles
      SET ${fields.join(', ')}
      WHERE id = ?
    `;
    
    await db.query(query, params);
    
    // Return the updated article
    return this.getArticleById(id);
  }
  
  /**
   * Delete an article
   * @param {string} id - Article ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteArticle(id) {
    const query = `DELETE FROM articles WHERE id = ?`;
    const result = await db.query(query, [id]);
    
    // In MySQL, check affectedRows instead of rowCount
    return result.affectedRows > 0;
  }
  
  /**
   * Search articles
   * @param {string} searchTerm - Search term
   * @param {Object} options - Search options
   * @returns {Promise<Array>} - Search results
   */
  async searchArticles(searchTerm, options = {}) {
    const { limit = 10, offset = 0 } = options;
    
    // MySQL doesn't have to_tsvector/to_tsquery, so we use LIKE instead
    const query = `
      SELECT * FROM articles
      WHERE 
        title LIKE ? OR
        content LIKE ? OR
        excerpt LIKE ? OR
        title_ml LIKE ? OR
        content_ml LIKE ? OR
        excerpt_ml LIKE ?
      ORDER BY published_date DESC
      LIMIT ? OFFSET ?
    `;
    
    const searchPattern = `%${searchTerm}%`;
    const params = [
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      limit,
      offset
    ];
    
    return await db.query(query, params);
  }
}

module.exports = new ArticleRepository();
