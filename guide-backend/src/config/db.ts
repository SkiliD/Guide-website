import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'guide_db',
});

export async function initDb(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(10) NOT NULL CHECK (role IN ('admin', 'user')),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS guides (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        days_count INTEGER NOT NULL,
        mobility TEXT[] NOT NULL DEFAULT '{}',
        season TEXT[] NOT NULL DEFAULT '{}',
        audience TEXT[] NOT NULL DEFAULT '{}',
        owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS guide_members (
        guide_id UUID REFERENCES guides(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        PRIMARY KEY (guide_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS days (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        guide_id UUID REFERENCES guides(id) ON DELETE CASCADE,
        day_number INTEGER NOT NULL,
        date DATE,
        title VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS activities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        guide_id UUID REFERENCES guides(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(20) NOT NULL CHECK (category IN ('musee', 'chateau', 'activite', 'parc', 'grotte')),
        address VARCHAR(500),
        phone VARCHAR(50),
        opening_hours VARCHAR(100),
        website VARCHAR(500),
        start_time VARCHAR(10),
        end_time VARCHAR(10)
      );

      CREATE TABLE IF NOT EXISTS day_activities (
        day_id UUID REFERENCES days(id) ON DELETE CASCADE,
        activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
        visit_order INTEGER NOT NULL DEFAULT 1,
        PRIMARY KEY (day_id, activity_id)
      );
    `);

    // Seed demo data if no users exist
    const { rows } = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(rows[0].count) === 0) {
      await seedDemoData(client);
    }
  } finally {
    client.release();
  }
}

async function seedDemoData(client: import('pg').PoolClient): Promise<void> {
  const adminHash = await bcrypt.hash('admin123', 10);
  const userHash = await bcrypt.hash('user123', 10);

  const adminResult = await client.query(
    `INSERT INTO users (email, name, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id`,
    ['admin@henri.trip', 'Admin Henri', adminHash, 'admin']
  );
  const adminId = adminResult.rows[0].id;

  const userResult = await client.query(
    `INSERT INTO users (email, name, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id`,
    ['user@henri.trip', 'User Demo', userHash, 'user']
  );
  const userId = userResult.rows[0].id;

  // Create a demo guide
  const guideResult = await client.query(
    `INSERT INTO guides (title, description, days_count, mobility, season, audience, owner_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    ['Voyage à Tokyo', 'Une semaine au Japon avec les incontournables', 2, ['a_pied', 'velo'], ['printemps'], ['entre_amis', 'groupe'], adminId]
  );
  const guideId = guideResult.rows[0].id;

  // Add user as member
  await client.query(
    `INSERT INTO guide_members (guide_id, user_id) VALUES ($1, $2)`,
    [guideId, userId]
  );

  // Create days
  const day1Result = await client.query(
    `INSERT INTO days (guide_id, day_number, date, title) VALUES ($1, $2, $3, $4) RETURNING id`,
    [guideId, 1, '2026-05-10', 'Quartier Asakusa']
  );
  const day1Id = day1Result.rows[0].id;

  await client.query(
    `INSERT INTO days (guide_id, day_number, date, title) VALUES ($1, $2, $3, $4) RETURNING id`,
    [guideId, 2, '2026-05-11', 'Shibuya et Shinjuku']
  );

  // Create activity
  const activityResult = await client.query(
    `INSERT INTO activities (guide_id, title, description, category, address, phone, opening_hours, website, start_time, end_time)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
    [guideId, 'Visite du temple Senso-ji', 'Découverte du quartier et du temple historique', 'musee',
     '2 Chome-3-1 Asakusa, Taito City, Tokyo', '+81-3-3842-0181', '06:00-17:00', 'https://www.senso-ji.jp/',
     '09:00', '11:00']
  );
  const activityId = activityResult.rows[0].id;

  // Link activity to day 1
  await client.query(
    `INSERT INTO day_activities (day_id, activity_id, visit_order) VALUES ($1, $2, $3)`,
    [day1Id, activityId, 1]
  );

  console.log('Demo data seeded successfully');
}

export default pool;
