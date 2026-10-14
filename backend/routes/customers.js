import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const page = Math.max(
      1,
      parseInt(req.query.page, 10) || 1
    );

    const allowedLimits = [10, 25, 50, 100];
    const requestedLimit = parseInt(req.query.limit, 10) || 10;

    const limit = allowedLimits.includes(requestedLimit)
      ? requestedLimit
      : 10;

    const offset = (page - 1) * limit;

    const search = String(req.query.search || '').trim();
    const status = String(req.query.status || 'All');
    const dateFrom = req.query.dateFrom || '';
    const dateTo = req.query.dateTo || '';

    const conditions = [];
    const values = [];

    function addCondition(sql, value) {
      values.push(value);
      conditions.push(
        sql.replace('?', `$${values.length}`)
      );
    }

    // Search customer details
    if (search) {
      values.push(`%${search}%`);
      const parameter = `$${values.length}`;

      conditions.push(`
        (
          customer_name ILIKE ${parameter}
          OR company ILIKE ${parameter}
          OR email ILIKE ${parameter}
          OR phone ILIKE ${parameter}
          OR owner ILIKE ${parameter}
        )
      `);
    }

    // Filter by status
    if (status !== 'All') {
      addCondition('status = ?', status);
    }

    // Filter by creation date
    if (dateFrom) {
      addCondition('created_at >= ?::date', dateFrom);
    }

    if (dateTo) {
      addCondition(
        "created_at < (?::date + INTERVAL '1 day')",
        dateTo
      );
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    // Count all matching records, not just the current page
    const countResult = await pool.query(
      `
        SELECT COUNT(*)::int AS total
        FROM customers
        ${whereClause}
      `,
      values
    );

    const totalRecords = countResult.rows[0].total;
    const totalPages = Math.ceil(totalRecords / limit);

    // Fetch only the requested page
    const customersResult = await pool.query(
      `
        SELECT *
        FROM customers
        ${whereClause}
        ORDER BY created_at DESC NULLS LAST, id DESC
        LIMIT $${values.length + 1}
        OFFSET $${values.length + 2}
      `,
      [...values, limit, offset]
    );

    res.json({
      records: customersResult.rows,
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages
      }
    });
  } catch (err) {
    console.error('Failed to fetch customers:', err.message);

    res.status(500).json({
      error: 'Failed to fetch customers'
    });
  }
});


// POST: Create customer
router.post('/', async (req, res) => {
  const {
    customer_name, company, email, phone,
    value, status, notes, owner
  } = req.body;

  if (!customer_name) {
    return res.status(400).json({
      error: 'Customer name is required'
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO customers
       (customer_name, company, email, phone, value, status, notes, owner)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        customer_name, company ?? null, email ?? null,
        phone ?? null, value ?? 0, status ?? 'New',
        notes ?? null, owner ?? null
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// PUT: Update customer
router.put('/:id', async (req, res) => {
  const {
    customer_name, company, email, phone,
    value, status, notes, owner
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE customers SET
       customer_name = $1, company = $2, email = $3,
       phone = $4, value = $5, status = $6,
       notes = $7, owner = $8
       WHERE id = $9
       RETURNING *`,
      [
        customer_name, company ?? null, email ?? null,
        phone ?? null, value ?? 0, status ?? 'New',
        notes ?? null, owner ?? null, req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// DELETE: Remove customer
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM customers WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

export default router;

