import { Pool } from 'pg';
import { config } from '../config';

async function testDatabaseConnection() {
    const pool = new Pool(config.database);

    try {
        const client = await pool.connect();
        
        // Test Malayalam Unicode support with a more complex text
        const testMalayalam = await client.query(`
            SELECT 'സ്വാഗതം'::text as test_text;
            SELECT 'അക്ഷരങ്ങൾ'::text as test_complex;
        `);
        
        console.log('Malayalam text tests:', {
            simple: testMalayalam.rows[0].test_text,
            complex: testMalayalam.rows[1].test_complex
        });

        client.release();
    } catch (error) {
        console.error('Database connection or Unicode test failed:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

testDatabaseConnection();


