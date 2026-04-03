import pool from './config/db';
import {
  ActivityCategory,
  ActivityRecord,
  Audience,
  FrontGuide,
  GuideRecord,
  Mobility,
  Season,
  UserRecord,
} from './types/domain';

export type CreateGuideInput = {
  title: string;
  description: string;
  daysCount: number;
  mobility: Mobility[];
  season: Season[];
  audience: Audience[];
};

export type CreateActivityInput = {
  title: string;
  description: string;
  category: ActivityCategory;
  address: string;
  phone: string;
  openingHours: string;
  website: string;
  startTime?: string;
  endTime?: string;
  dayNumbers: number[];
};

// Helper: build a full GuideRecord from DB rows
async function buildGuideRecord(guideRow: any): Promise<GuideRecord> {
  const guideId = guideRow.id;

  // Load members
  const membersRes = await pool.query(
    'SELECT user_id FROM guide_members WHERE guide_id = $1',
    [guideId]
  );
  const memberIds = membersRes.rows.map((r: any) => r.user_id);

  // Load days
  const daysRes = await pool.query(
    'SELECT * FROM days WHERE guide_id = $1 ORDER BY day_number',
    [guideId]
  );

  // Load activities
  const activitiesRes = await pool.query(
    'SELECT * FROM activities WHERE guide_id = $1',
    [guideId]
  );

  // Load day-activity refs
  const dayIds = daysRes.rows.map((d: any) => d.id);
  let dayActivityMap: Record<string, { activityId: string; order: number }[]> = {};

  if (dayIds.length > 0) {
    const refsRes = await pool.query(
      'SELECT day_id, activity_id, visit_order FROM day_activities WHERE day_id = ANY($1) ORDER BY visit_order',
      [dayIds]
    );
    for (const ref of refsRes.rows) {
      if (!dayActivityMap[ref.day_id]) dayActivityMap[ref.day_id] = [];
      dayActivityMap[ref.day_id].push({ activityId: ref.activity_id, order: ref.visit_order });
    }
  }

  return {
    id: guideRow.id,
    title: guideRow.title,
    description: guideRow.description,
    daysCount: guideRow.days_count,
    mobility: guideRow.mobility,
    season: guideRow.season,
    audience: guideRow.audience,
    ownerId: guideRow.owner_id,
    memberIds,
    days: daysRes.rows.map((d: any) => ({
      id: d.id,
      dayNumber: d.day_number,
      date: d.date ? new Date(d.date).toISOString().slice(0, 10) : '',
      title: d.title || undefined,
      activityRefs: dayActivityMap[d.id] || [],
    })),
    activities: activitiesRes.rows.map((a: any) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      category: a.category as ActivityCategory,
      address: a.address,
      phone: a.phone,
      openingHours: a.opening_hours,
      website: a.website,
      startTime: a.start_time || undefined,
      endTime: a.end_time || undefined,
    })),
    createdAt: guideRow.created_at?.toISOString?.() || guideRow.created_at,
    updatedAt: guideRow.updated_at?.toISOString?.() || guideRow.updated_at,
  };
}

class PgStore {
  async listUsers(): Promise<UserRecord[]> {
    const { rows } = await pool.query('SELECT * FROM users ORDER BY created_at');
    return rows.map((r: any) => ({
      id: r.id,
      email: r.email,
      name: r.name,
      passwordHash: r.password_hash,
      role: r.role,
      createdAt: r.created_at?.toISOString?.() || r.created_at,
    }));
  }

  async listPublicUsers() {
    const { rows } = await pool.query('SELECT id, email, name, role, created_at FROM users ORDER BY created_at');
    return rows.map((r: any) => ({
      id: r.id,
      email: r.email,
      name: r.name,
      role: r.role,
      createdAt: r.created_at?.toISOString?.() || r.created_at,
    }));
  }

  async findUserById(userId: string): Promise<UserRecord | undefined> {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (rows.length === 0) return undefined;
    const r = rows[0];
    return {
      id: r.id,
      email: r.email,
      name: r.name,
      passwordHash: r.password_hash,
      role: r.role,
      createdAt: r.created_at?.toISOString?.() || r.created_at,
    };
  }

  async findUserByEmail(email: string): Promise<UserRecord | undefined> {
    const { rows } = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (rows.length === 0) return undefined;
    const r = rows[0];
    return {
      id: r.id,
      email: r.email,
      name: r.name,
      passwordHash: r.password_hash,
      role: r.role,
      createdAt: r.created_at?.toISOString?.() || r.created_at,
    };
  }

  async createUser(input: { email: string; name: string; passwordHash: string; role: 'admin' | 'user' }): Promise<UserRecord> {
    const { rows } = await pool.query(
      'INSERT INTO users (email, name, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [input.email, input.name, input.passwordHash, input.role]
    );
    const r = rows[0];
    return {
      id: r.id,
      email: r.email,
      name: r.name,
      passwordHash: r.password_hash,
      role: r.role,
      createdAt: r.created_at?.toISOString?.() || r.created_at,
    };
  }

  async deleteUser(userId: string): Promise<boolean> {
    // Remove from guide_members first (cascade handles it, but explicit is clearer)
    await pool.query('DELETE FROM guide_members WHERE user_id = $1', [userId]);
    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    return (rowCount ?? 0) > 0;
  }

  async listGuides(): Promise<GuideRecord[]> {
    const { rows } = await pool.query('SELECT * FROM guides ORDER BY created_at DESC');
    return Promise.all(rows.map(buildGuideRecord));
  }

  async findGuideById(guideId: string): Promise<GuideRecord | undefined> {
    const { rows } = await pool.query('SELECT * FROM guides WHERE id = $1', [guideId]);
    if (rows.length === 0) return undefined;
    return buildGuideRecord(rows[0]);
  }

  async createGuide(input: CreateGuideInput, ownerId: string): Promise<GuideRecord> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows } = await client.query(
        `INSERT INTO guides (title, description, days_count, mobility, season, audience, owner_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [input.title, input.description, input.daysCount, input.mobility, input.season, input.audience, ownerId]
      );
      const guideId = rows[0].id;

      // Create days
      for (let i = 0; i < input.daysCount; i++) {
        const date = new Date(Date.now() + i * 86400000).toISOString().slice(0, 10);
        await client.query(
          'INSERT INTO days (guide_id, day_number, date, title) VALUES ($1, $2, $3, $4)',
          [guideId, i + 1, date, `Jour ${i + 1}`]
        );
      }

      await client.query('COMMIT');
      return (await this.findGuideById(guideId))!;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async updateGuide(guideId: string, input: Partial<CreateGuideInput>): Promise<GuideRecord | null> {
    const existing = await this.findGuideById(guideId);
    if (!existing) return null;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const title = input.title ?? existing.title;
      const description = input.description ?? existing.description;
      const daysCount = input.daysCount ?? existing.daysCount;
      const mobility = input.mobility ?? existing.mobility;
      const season = input.season ?? existing.season;
      const audience = input.audience ?? existing.audience;

      await client.query(
        `UPDATE guides SET title=$1, description=$2, days_count=$3, mobility=$4, season=$5, audience=$6, updated_at=NOW()
         WHERE id=$7`,
        [title, description, daysCount, mobility, season, audience, guideId]
      );

      // Handle day count changes
      if (input.daysCount !== undefined && input.daysCount > 0) {
        const currentDays = existing.days.length;
        if (input.daysCount > currentDays) {
          for (let i = currentDays; i < input.daysCount; i++) {
            const date = new Date(Date.now() + i * 86400000).toISOString().slice(0, 10);
            await client.query(
              'INSERT INTO days (guide_id, day_number, date, title) VALUES ($1, $2, $3, $4)',
              [guideId, i + 1, date, `Jour ${i + 1}`]
            );
          }
        } else if (input.daysCount < currentDays) {
          await client.query(
            'DELETE FROM days WHERE guide_id = $1 AND day_number > $2',
            [guideId, input.daysCount]
          );
        }
      }

      await client.query('COMMIT');
      return (await this.findGuideById(guideId))!;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async deleteGuide(guideId: string): Promise<boolean> {
    const { rowCount } = await pool.query('DELETE FROM guides WHERE id = $1', [guideId]);
    return (rowCount ?? 0) > 0;
  }

  async addMember(guideId: string, userId: string): Promise<GuideRecord | null> {
    const guide = await this.findGuideById(guideId);
    if (!guide) return null;

    await pool.query(
      'INSERT INTO guide_members (guide_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [guideId, userId]
    );
    return this.findGuideById(guideId) as Promise<GuideRecord>;
  }

  async removeMember(guideId: string, userId: string): Promise<GuideRecord | null> {
    const guide = await this.findGuideById(guideId);
    if (!guide) return null;

    await pool.query('DELETE FROM guide_members WHERE guide_id = $1 AND user_id = $2', [guideId, userId]);
    return this.findGuideById(guideId) as Promise<GuideRecord>;
  }

  async addActivity(guideId: string, input: CreateActivityInput): Promise<ActivityRecord | null> {
    const guide = await this.findGuideById(guideId);
    if (!guide) return null;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows } = await client.query(
        `INSERT INTO activities (guide_id, title, description, category, address, phone, opening_hours, website, start_time, end_time)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [guideId, input.title, input.description, input.category, input.address, input.phone,
         input.openingHours, input.website, input.startTime || null, input.endTime || null]
      );
      const activityId = rows[0].id;

      // Link to days
      for (const dayNumber of input.dayNumbers) {
        const dayRes = await client.query(
          'SELECT id FROM days WHERE guide_id = $1 AND day_number = $2',
          [guideId, dayNumber]
        );
        if (dayRes.rows.length > 0) {
          const dayId = dayRes.rows[0].id;
          const orderRes = await client.query(
            'SELECT COALESCE(MAX(visit_order), 0) + 1 as next_order FROM day_activities WHERE day_id = $1',
            [dayId]
          );
          await client.query(
            'INSERT INTO day_activities (day_id, activity_id, visit_order) VALUES ($1, $2, $3)',
            [dayId, activityId, orderRes.rows[0].next_order]
          );
        }
      }

      await client.query('COMMIT');

      const a = rows[0];
      return {
        id: a.id,
        title: a.title,
        description: a.description,
        category: a.category,
        address: a.address,
        phone: a.phone,
        openingHours: a.opening_hours,
        website: a.website,
        startTime: a.start_time || undefined,
        endTime: a.end_time || undefined,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async updateActivity(guideId: string, activityId: string, input: Partial<CreateActivityInput>): Promise<ActivityRecord | null> {
    const guide = await this.findGuideById(guideId);
    if (!guide) return null;

    const activity = guide.activities.find((a) => a.id === activityId);
    if (!activity) return null;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows } = await client.query(
        `UPDATE activities SET
          title = COALESCE($1, title),
          description = COALESCE($2, description),
          category = COALESCE($3, category),
          address = COALESCE($4, address),
          phone = COALESCE($5, phone),
          opening_hours = COALESCE($6, opening_hours),
          website = COALESCE($7, website),
          start_time = COALESCE($8, start_time),
          end_time = COALESCE($9, end_time)
         WHERE id = $10 AND guide_id = $11 RETURNING *`,
        [input.title, input.description, input.category, input.address, input.phone,
         input.openingHours, input.website, input.startTime, input.endTime, activityId, guideId]
      );

      if (rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }

      // Update day assignments if provided
      if (input.dayNumbers) {
        await client.query(
          'DELETE FROM day_activities WHERE activity_id = $1',
          [activityId]
        );
        for (const dayNumber of input.dayNumbers) {
          const dayRes = await client.query(
            'SELECT id FROM days WHERE guide_id = $1 AND day_number = $2',
            [guideId, dayNumber]
          );
          if (dayRes.rows.length > 0) {
            const dayId = dayRes.rows[0].id;
            const orderRes = await client.query(
              'SELECT COALESCE(MAX(visit_order), 0) + 1 as next_order FROM day_activities WHERE day_id = $1',
              [dayId]
            );
            await client.query(
              'INSERT INTO day_activities (day_id, activity_id, visit_order) VALUES ($1, $2, $3)',
              [dayId, activityId, orderRes.rows[0].next_order]
            );
          }
        }
      }

      await client.query('COMMIT');
      await pool.query('UPDATE guides SET updated_at = NOW() WHERE id = $1', [guideId]);

      const a = rows[0];
      return {
        id: a.id,
        title: a.title,
        description: a.description,
        category: a.category,
        address: a.address,
        phone: a.phone,
        openingHours: a.opening_hours,
        website: a.website,
        startTime: a.start_time || undefined,
        endTime: a.end_time || undefined,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async deleteActivity(guideId: string, activityId: string): Promise<boolean> {
    const { rowCount } = await pool.query(
      'DELETE FROM activities WHERE id = $1 AND guide_id = $2',
      [activityId, guideId]
    );
    if ((rowCount ?? 0) > 0) {
      await pool.query('UPDATE guides SET updated_at = NOW() WHERE id = $1', [guideId]);
      return true;
    }
    return false;
  }

  canAccessGuide(guide: GuideRecord, userId: string, role: 'admin' | 'user'): boolean {
    if (role === 'admin') return true;
    return guide.ownerId === userId || guide.memberIds.includes(userId);
  }

  async toFrontGuide(guide: GuideRecord, currentUserId: string): Promise<FrontGuide> {
    const owner = await this.findUserById(guide.ownerId);

    return {
      id: guide.id,
      title: guide.title,
      description: guide.description,
      mobility: guide.mobility,
      season: guide.season,
      audience: guide.audience,
      daysCount: guide.daysCount,
      ownerName: owner?.name,
      isShared: guide.ownerId !== currentUserId,
      days: guide.days
        .slice()
        .sort((a, b) => a.dayNumber - b.dayNumber)
        .map((day) => ({
          id: day.id,
          date: day.date,
          title: day.title,
          activities: day.activityRefs
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((ref) => guide.activities.find((activity) => activity.id === ref.activityId))
            .filter((activity): activity is ActivityRecord => Boolean(activity))
            .map((activity) => ({
              id: activity.id,
              title: activity.title,
              description: activity.description,
              startTime: activity.startTime,
              endTime: activity.endTime,
            })),
        })),
    };
  }
}

export const store = new PgStore();
