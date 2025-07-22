/**
 * MySQL database connection for True Bread
 * Replace the PostgreSQL connection with this MySQL connection
 */

const mysql = require('mysql2/promise');
const config = require('../config');

// Create a connection pool
const pool = mysql.createPool({
  host: config.database.host || 'localhost',
  port: config.database.port || 3306,
  database: config.database.name || 'truebread_prod',
  user: config.database.user || 'truebread_user',
  password: config.database.password || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

/**
 * Execute a query with parameters
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise} - Query result
 */
const query = async (text, params) => {
  try {
    const [rows, fields] = await pool.query(text, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

/**
 * Get a client from the pool
 * @returns {Promise} - Client connection
 */
const getClient = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Wrap the connection to match PostgreSQL client interface
    const client = {
      connection,
      
      query: async (text, params) => {
        try {
          const [rows, fields] = await connection.query(text, params);
          return { rows };
        } catch (error) {
          console.error('Database query error:', error);
          throw error;
        }
      },
      
      release: () => {
        connection.release();
      }
    };
    
    return client;
  } catch (error) {
    console.error('Error getting database client:', error);
    throw error;
  }
};

module.exports = {
  query,
  getClient,
  pool
};
