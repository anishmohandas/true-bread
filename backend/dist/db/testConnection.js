"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const config_1 = require("../config");
async function testConnection() {
    console.log('Attempting to connect with user:', config_1.config.database.user); // Add this for debugging
    const pool = new pg_1.Pool({
        host: config_1.config.database.host,
        port: config_1.config.database.port,
        database: config_1.config.database.database,
        user: config_1.config.database.user || 'postgres', // Ensure user is explicitly set
        password: String(config_1.config.database.password),
        ssl: false
    });
    try {
        const client = await pool.connect();
        console.log('Successfully connected to the database');
        // Test if table exists
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'Subscribers'
            );
        `);
        if (!tableCheck.rows[0].exists) {
            console.log('Creating Subscribers table...');
            await client.query(`
                CREATE TABLE IF NOT EXISTS "Subscribers" (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    is_active BOOLEAN DEFAULT true,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            `);
            console.log('Table created successfully');
        }
        else {
            console.log('Subscribers table already exists');
        }
        client.release();
    }
    catch (err) {
        console.error('Database connection error:', err);
        throw err; // Re-throw to see full error details
    }
    finally {
        await pool.end();
    }
}
testConnection().catch(console.error);
