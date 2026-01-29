import postgres from 'postgres'

const { DATABASE_HOST, DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD, DATABASE_PORT } =
  process.env

if (!DATABASE_HOST || !DATABASE_NAME || !DATABASE_USER || !DATABASE_PASSWORD || !DATABASE_PORT) {
  console.error('Missing database configuration. Please check your .env file.')
  process.exit(1)
}

const sql = postgres({
  host: DATABASE_HOST,
  database: DATABASE_NAME,
  username: DATABASE_USER,
  password: DATABASE_PASSWORD,
  port: Number(DATABASE_PORT),
  ssl: { rejectUnauthorized: false },
  max: 10,
})

export default sql
