"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pgClient = void 0;
require('dotenv').config({ path: '.env' });
const pg_1 = require("pg");
if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não definida no ambiente!');
}
;
exports.pgClient = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false,
});
