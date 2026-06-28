const pool = require('../config/db');

// Get all products
const getProducts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, s.quantity, s.bin_location
       FROM products p
       LEFT JOIN stock s ON p.id = s.product_id
       ORDER BY p.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single product
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await pool.query(
      `SELECT p.*, s.quantity, s.bin_location
       FROM products p
       LEFT JOIN stock s ON p.id = s.product_id
       WHERE p.id = $1`,
      [id]
    );
    if (product.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get stock movement history
    const movements = await pool.query(
      `SELECT sm.*, u.full_name as performed_by_name
       FROM stock_movements sm
       LEFT JOIN users u ON sm.performed_by = u.id
       WHERE sm.product_id = $1
       ORDER BY sm.created_at DESC`,
      [id]
    );

    res.json({
      ...product.rows[0],
      movements: movements.rows,
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create product
const createProduct = async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, sku, category, unit_of_measure, reorder_level, bin_location } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Product name is required' });
    }

    await client.query('BEGIN');

    // Create product
    const product = await client.query(
      `INSERT INTO products (name, sku, category, unit_of_measure, reorder_level)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, sku, category, unit_of_measure, reorder_level || 0]
    );

    // Create stock record
    await client.query(
      `INSERT INTO stock (product_id, quantity, bin_location)
       VALUES ($1, 0, $2)`,
      [product.rows[0].id, bin_location]
    );

    await client.query('COMMIT');

    res.status(201).json(product.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, category, unit_of_measure, reorder_level } = req.body;
    const result = await pool.query(
      `UPDATE products SET name=$1, sku=$2, category=$3, unit_of_measure=$4, reorder_level=$5
       WHERE id=$6 RETURNING *`,
      [name, sku, category, unit_of_measure, reorder_level, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GRN - Receive goods
const receiveGoods = async (req, res) => {
  const client = await pool.connect();
  try {
    const { order_id, items, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Items are required' });
    }

    await client.query('BEGIN');

    for (const item of items) {
      const { product_id, quantity } = item;

      // Update stock
      await client.query(
        `UPDATE stock SET quantity = quantity + $1, last_updated = NOW()
         WHERE product_id = $2`,
        [quantity, product_id]
      );

      // Record stock movement
      await client.query(
        `INSERT INTO stock_movements (product_id, movement_type, quantity, reference_id, performed_by, notes)
         VALUES ($1, 'inbound', $2, $3, $4, $5)`,
        [product_id, quantity, order_id, req.user.id, notes]
      );
    }

    // Update order status if order_id provided
    if (order_id) {
      await client.query(
        `UPDATE orders SET status='completed', completed_date=NOW() WHERE id=$1`,
        [order_id]
      );
    }

    await client.query('COMMIT');

    res.json({ message: 'Goods received successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Receive goods error:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
};

// Get low stock products
const getLowStock = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, s.quantity, s.bin_location
       FROM products p
       LEFT JOIN stock s ON p.id = s.product_id
       WHERE s.quantity <= p.reorder_level
       ORDER BY s.quantity ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get low stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, receiveGoods, getLowStock };