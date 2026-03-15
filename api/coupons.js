import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // Ensure table exists
    await sql`
      CREATE TABLE IF NOT EXISTS coupons (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        discount_type TEXT CHECK (discount_type IN ('percent','fixed')) DEFAULT 'percent',
        discount_value NUMERIC(10,2) NOT NULL,
        min_order NUMERIC(10,2) DEFAULT 0,
        max_uses INT DEFAULT 100,
        used_count INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`;

    // GET /api/coupons?code=XXX — validate coupon
    if (req.method === 'GET') {
      const { code } = req.query;
      if (!code) {
        const rows = await sql`SELECT * FROM coupons ORDER BY created_at DESC`;
        return res.json(rows);
      }
      const rows = await sql`
        SELECT * FROM coupons
        WHERE UPPER(code) = UPPER(${code})
        AND is_active = true
        AND used_count < max_uses`;
      if (!rows.length) return res.status(404).json({ error: 'كوبون غير صالح أو منتهي' });
      return res.json(rows[0]);
    }

    // POST /api/coupons — create coupon (admin)
    if (req.method === 'POST') {
      const { code, discount_type, discount_value, min_order, max_uses } = req.body;
      if (!code || !discount_value) return res.status(400).json({ error: 'missing fields' });
      const rows = await sql`
        INSERT INTO coupons (code, discount_type, discount_value, min_order, max_uses)
        VALUES (UPPER(${code}), ${discount_type||'percent'}, ${discount_value}, ${min_order||0}, ${max_uses||100})
        RETURNING *`;
      return res.status(201).json(rows[0]);
    }

    // PATCH /api/coupons?id=... — update or increment used_count
    if (req.method === 'PATCH') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id required' });
      const { use, is_active } = req.body;
      if (use) {
        const rows = await sql`
          UPDATE coupons SET used_count = used_count + 1 WHERE id = ${id} RETURNING *`;
        return res.json(rows[0]);
      }
      const rows = await sql`
        UPDATE coupons SET is_active = ${is_active} WHERE id = ${id} RETURNING *`;
      return res.json(rows[0]);
    }

    // DELETE /api/coupons?id=...
    if (req.method === 'DELETE') {
      const { id } = req.query;
      await sql`DELETE FROM coupons WHERE id = ${id}`;
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
