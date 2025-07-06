require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

// connection testing
pool.on('connect', () => {
    console.log('Connected to PostgreSQL DB');
});

pool.on('error', (err) => {
    console.error('DB connection error: ', err);
});

const query = (text, params) => {
    return pool.query(text, params);
};

module.exports = { query, pool };