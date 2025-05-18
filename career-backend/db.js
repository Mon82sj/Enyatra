const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
   ssl: {
    rejectUnauthorized: false, // Required for some hosted DBs like Render/Heroku
  },
});

pool.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch(err => console.error("Database connection error", err));

module.exports = pool;
