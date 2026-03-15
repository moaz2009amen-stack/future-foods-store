import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // GET /api/products?id=...&category_id=...&available=true
    if (req.method === 'GET') {
      const { id, category_id, available } = req.query;
      if (id) {
        const rows = await sql`SELECT * FROM products WHERE id = ${id}`;
        return res.json(rows[0] || null);
      }
      let rows;
      if (category_id && available) {
        rows = await sql`SELECT * FROM products WHERE category_id = ${category_id} AND is_available = true ORDER BY created_at DESC`;
      } else if (category_id) {
        rows = await sql`SELECT * FROM products WHERE category_id = ${category_id} ORDER BY created_at DESC`;
      } else if (available) {
        rows = await sql`SELECT * FROM products WHERE is_available = true ORDER BY created_at DESC`;
      } else {
        rows = await sql`SELECT * FROM products ORDER BY created_at DESC`;
      }
      return res.json(rows);
    }

    // POST /api/products
    if (req.method === 'POST') {
      const { name_ar, name_en, description_ar, description_en, price, original_price, stock, unit_ar, unit_en, category_id, image_url, is_available, is_featured } = req.body;
      const rows = await sql`
        INSERT INTO products (name_ar, name_en, description_ar, description_en, price, original_price, stock, unit_ar, unit_en, category_id, image_url, is_available, is_featured)
        VALUES (${name_ar}, ${name_en||''}, ${description_ar||null}, ${description_en||null}, ${price}, ${original_price||null}, ${stock||0}, ${unit_ar||'قطعة'}, ${unit_en||'piece'}, ${category_id||null}, ${image_url||null}, ${is_available??true}, ${is_featured??false})
        RETURNING *`;
      return res.status(201).json(rows[0]);
    }

    // PATCH /api/products?id=...
    if (req.method === 'PATCH') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id required' });
      const fields = req.body;
      const keys = Object.keys(fields);
      if (!keys.length) return res.status(400).json({ error: 'no fields' });
      // Build dynamic update
      const setClauses = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
      const values = [id, ...keys.map(k => fields[k])];
      const { rows } = await sql.query(
        `UPDATE products SET ${setClauses}, updated_at = NOW() WHERE id = $1 RETURNING *`,
        values
      );
      return res.json(rows[0]);
    }

    // DELETE /api/products?id=...
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id required' });
      await sql`DELETE FROM products WHERE id = ${id}`;
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
