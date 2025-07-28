import { createConnection } from 'mysql2/promise';

import { config } from './src/config';

async function testConnection() {
  try {
    const connection = await createConnection({

      host: config.database.host,
      port: config.database.port,
      database: config.database.database,
      user: config.database.user,
      password: config.database.password
    });

    const result = await connection.query('SELECT NOW() AS `current_time`');

    const rows = result[0] as any[];
    console.log('MySQL connection successful! Current time:', rows[0].current_time);



    await connection.end();
  } catch (error) {
    console.error('MySQL connection failed:', error);
  }
}

testConnection();
