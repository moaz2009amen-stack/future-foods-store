import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM categories ORDER BY created_at ASC`;
      return res.json(rows);
    }

    if (req.method === 'POST') {
      const { name_ar, name_en, icon } = req.body;
      if (!name_ar) return res.status(400).json({ error: 'name_ar required' });
      const rows = await sql`
        INSERT INTO categories (name_ar, name_en, icon)
        VALUES (${name_ar}, ${name_en || ''}, ${icon || '🛒'})
        RETURNING *`;
      return res.status(201).json(rows[0]);
    }

    if (req.method === 'PATCH') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id required' });
      const { name_ar, name_en, icon } = req.body;
      const rows = await sql`
        UPDATE categories SET name_ar=${name_ar}, name_en=${name_en}, icon=${icon}
        WHERE id = ${id} RETURNING *`;
      return res.json(rows[0]);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id required' });
      await sql`DELETE FROM categories WHERE id = ${id}`;
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
