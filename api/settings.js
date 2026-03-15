import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM store_settings WHERE id = 1`;
      if (!rows.length) {
        // auto-create default row
        const def = await sql`
          INSERT INTO store_settings (id) VALUES (1)
          ON CONFLICT DO NOTHING RETURNING *`;
        return res.json(def[0] || {});
      }
      return res.json(rows[0]);
    }

    if (req.method === 'PATCH') {
      const { store_name_ar, store_name_en, store_phone, delivery_fee, min_order, is_open, whatsapp } = req.body;
      const rows = await sql`
        UPDATE store_settings SET
          store_name_ar = COALESCE(${store_name_ar}, store_name_ar),
          store_name_en = COALESCE(${store_name_en}, store_name_en),
          store_phone   = COALESCE(${store_phone},   store_phone),
          delivery_fee  = COALESCE(${delivery_fee},  delivery_fee),
          min_order     = COALESCE(${min_order},     min_order),
          is_open       = COALESCE(${is_open},       is_open),
          whatsapp      = COALESCE(${whatsapp},      whatsapp),
          updated_at    = NOW()
        WHERE id = 1 RETURNING *`;
      return res.json(rows[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
