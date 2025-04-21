import type { Config } from 'drizzle-kit'
const dotenv = require('dotenv')

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || '',
  },
} satisfies Config