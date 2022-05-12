const Pool = require('pg').Pool
const pool = new Pool({
    user: 'ggnodeuser',
    host: 'localhost',
    database: 'api',
    password: 'Gudang123',
    port: 5432,
})

// docker pull postgres:alpine
// docker run --name postgres-0 -e POSTGRES_PASSWORD=password -d -p 5432:5432 postgres:alpine
// docker exec -it postgres-0 bash
// psql -U postgres
// CREATE ROLE ggnodeuser WITH LOGIN PASSWORD 'Gudang123';
// ALTER ROLE ggnodeuser CREATEDB;
// \q #to quit
// psql -d postgres -U ggnodeuser
// CREATE DATABASE api;
// \list
// \c api #to connect to DB

// CREATE TABLE MS_USERS(
//     ID SERIAL PRIMARY KEY,
//     username VARCHAR(255),
//     password VARCHAR(255),
//     email VARCHAR(255) UNIQUE,
//     otp_code VARCHAR(15),
//     otp_exp_time NUMERIC(18),
//     otp_verified boolean
// );

// INSERT INTO MS_USERS (username, password, email, otp_code, otp_exp_time, otp_verified) VALUES('richard','Metrodata123#','richard@example.com','KLBDX6',1652080952118,FALSE);

module.exports = pool;