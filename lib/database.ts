import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

import dotenv from 'dotenv'
import postgres from 'postgres'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: resolve(__dirname, '..', '.env') })

const { DATABASE_HOST, DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD } = process.env

if (!DATABASE_HOST || !DATABASE_NAME || !DATABASE_USER || !DATABASE_PASSWORD) {
  console.error('Missing database configuration. Please check your .env file.')
  process.exit(1)
}

const sql = postgres({
  host: DATABASE_HOST,
  database: DATABASE_NAME,
  username: DATABASE_USER,
  password: DATABASE_PASSWORD,
  port: 5432,
  ssl: { rejectUnauthorized: false },
})

export default sql
