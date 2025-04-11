require('dotenv').config();
import { Pool } from 'pg';

export let pgClient = process.env.NODE_ENV === 'production' 
? new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  }) 
:  new Pool({
    connectionString: process.env.DATABASE_URL_TESTING,
    ssl: {
      rejectUnauthorized: false,
    },              
});
