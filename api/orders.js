import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `FF-${date}-${rand}`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // GET /api/orders?id=...&phone=...&status=...
    if (req.method === 'GET') {
      const { id, phone, status } = req.query;

      if (id) {
        const orders = await sql`SELECT * FROM orders WHERE id = ${id}`;
        const items = await sql`SELECT * FROM order_items WHERE order_id = ${id}`;
        return res.json({ order: orders[0], items });
      }

      if (phone) {
        const rows = await sql`
          SELECT * FROM orders WHERE customer_phone = ${phone}
          ORDER BY created_at DESC LIMIT 10`;
        return res.json(rows);
      }

      if (status && status !== 'all') {
        const rows = await sql`
          SELECT * FROM orders WHERE status = ${status}
          ORDER BY created_at DESC`;
        return res.json(rows);
      }

      const rows = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
      return res.json(rows);
    }

    // POST /api/orders  — creates order + items in one transaction
    if (req.method === 'POST') {
      const {
        customer_name, customer_phone, customer_address,
        customer_notes, payment_method,
        subtotal, delivery_fee, total, items
      } = req.body;

      if (!customer_name || !customer_phone || !customer_address) {
        return res.status(400).json({ error: 'missing required fields' });
      }

      const order_number = generateOrderNumber();

      const orderRows = await sql`
        INSERT INTO orders (order_number, customer_name, customer_phone, customer_address, customer_notes, payment_method, subtotal, delivery_fee, total)
        VALUES (${order_number}, ${customer_name}, ${customer_phone}, ${customer_address}, ${customer_notes||null}, ${payment_method||'cash'}, ${subtotal}, ${delivery_fee||10}, ${total})
        RETURNING *`;

      const order = orderRows[0];

      if (items && items.length) {
        for (const item of items) {
          await sql`
            INSERT INTO order_items (order_id, product_id, product_name_ar, product_name_en, price, quantity, subtotal)
            VALUES (${order.id}, ${item.product_id||null}, ${item.product_name_ar}, ${item.product_name_en||''}, ${item.price}, ${item.quantity}, ${item.subtotal})`;
        }
      }

      return res.status(201).json(order);
    }

    // PATCH /api/orders?id=...  — update status
    if (req.method === 'PATCH') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id required' });
      const { status } = req.body;
      const rows = await sql`
        UPDATE orders SET status = ${status}, updated_at = NOW()
        WHERE id = ${id} RETURNING *`;
      return res.json(rows[0]);
    }

    // DELETE /api/orders?id=...        — حذف طلب واحد
    // DELETE /api/orders?before=YYYY-MM  — حذف كل طلبات قبل تاريخ
    // DELETE /api/orders?all=true        — حذف الكل
    if (req.method === 'DELETE') {
      const { id, before, all } = req.query;

      if (id) {
        await sql`DELETE FROM order_items WHERE order_id = ${id}`;
        await sql`DELETE FROM orders WHERE id = ${id}`;
        return res.status(204).end();
      }

      if (before) {
        // before = "2025-03" → delete orders created before 2025-04-01
        const cutoff = new Date(before + '-01');
        cutoff.setMonth(cutoff.getMonth() + 1);
        const cutoffStr = cutoff.toISOString();
        const toDelete = await sql`SELECT id FROM orders WHERE created_at < ${cutoffStr}`;
        for (const o of toDelete) {
          await sql`DELETE FROM order_items WHERE order_id = ${o.id}`;
        }
        const result = await sql`DELETE FROM orders WHERE created_at < ${cutoffStr}`;
        return res.json({ deleted: toDelete.length });
      }

      if (all === 'true') {
        await sql`DELETE FROM order_items`;
        await sql`DELETE FROM orders`;
        return res.json({ deleted: 'all' });
      }

      return res.status(400).json({ error: 'specify id, before, or all' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
