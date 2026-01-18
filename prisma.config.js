const { defineConfig } = require('prisma/config');
const { config } = require('dotenv');
const { existsSync } = require('fs');
const { resolve } = require('path');

const envFiles = ['.env.production', '.env.development', '.env'];
for (const file of envFiles) {
  const path = resolve(process.cwd(), file);
  if (existsSync(path)) {
    config({ path });
    break;
  }
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL não definida. Verifique seu .env ou docker-compose env_file.'
  );
}

module.exports = defineConfig({
  schema: 'prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: databaseUrl,
  },
});