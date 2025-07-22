# MySQL Import Instructions for cPanel

Follow these steps to import the MySQL-compatible database schema into your cPanel hosting:

## 1. Prepare Your Database in cPanel

1. Log in to your cPanel account at https://thetruebread.com:2083/
2. Navigate to **MySQL Databases**
3. Create a new database (e.g., `truebread_prod`)
4. Create a new database user with a strong password
5. Add the user to the database with "All Privileges"

## 2. Import the Schema Using phpMyAdmin

1. In cPanel, click on **phpMyAdmin**
2. From the left sidebar, select the database you created
3. Click on the **Import** tab
4. Click **Choose File** and select the `truebread_mysql.sql` file
5. Make sure the character set is set to `utf8mb4`
6. Click **Go** to start the import

## 3. Update Your Backend Configuration

Update your backend database configuration to use MySQL instead of PostgreSQL:

```javascript
// In your config file (e.g., config.js or .env)

// Old PostgreSQL configuration
// DB_HOST=localhost
// DB_PORT=5432
// DB_NAME=truebread_dev
// DB_USER=postgres
// DB_PASSWORD=your_password

// New MySQL configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=truebread_prod
DB_USER=your_cpanel_db_user
DB_PASSWORD=your_cpanel_db_password
```

## 4. Update Your Database Connection Code

Replace your PostgreSQL connection code with MySQL:

```javascript
// Install MySQL driver
// npm install mysql2

// Old PostgreSQL connection
// const { Pool } = require('pg');
// const pool = new Pool({
//   host: process.env.DB_HOST || 'localhost',
//   port: process.env.DB_PORT || 5432,
//   database: process.env.DB_NAME || 'truebread_dev',
//   user: process.env.DB_USER || 'postgres',
//   password: process.env.DB_PASSWORD || 'your_password'
// });

// New MySQL connection
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'truebread_prod',
  user: process.env.DB_USER || 'your_cpanel_db_user',
  password: process.env.DB_PASSWORD || 'your_cpanel_db_password',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

## 5. Update Your Queries

Update your SQL queries to use MySQL syntax:

1. Replace parameter placeholders:
   - PostgreSQL: `$1, $2, $3`
   - MySQL: `?, ?, ?`

2. Replace RETURNING clauses:
   - PostgreSQL: `INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id`
   - MySQL: 
     ```javascript
     const [result] = await pool.query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);
     const insertId = result.insertId;
     ```

3. Replace boolean values:
   - PostgreSQL: `true/false`
   - MySQL: `1/0`

## 6. Test Your Application

After making these changes, thoroughly test your application to ensure all database operations work correctly with MySQL.

## Troubleshooting

If you encounter issues:

1. **Connection errors**: Verify your database credentials and that the user has proper permissions
2. **Query errors**: Check for PostgreSQL-specific syntax in your queries
3. **Character encoding issues**: Ensure your database and tables use utf8mb4 character set
4. **Missing data**: If you need to import data, you'll need to export it from PostgreSQL and import it to MySQL
