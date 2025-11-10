const { Pool } = require("pg");


const pool = new Pool({
  connectionString: "postgresql://authdb_7u9a_user:E7eRHBlbWmCDos07IMDeMgx1cBh7X4MA@dpg-d48pekemcj7s73e3lg00-a/authdb_7u9a",
  ssl: { rejectUnauthorized: false }  
});

module.exports = pool;
