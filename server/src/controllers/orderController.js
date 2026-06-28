const pool = require('../config/db');

// Get all orders
const getOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, 
        v.plate_number,
        d.full_name as driver_name,
        u.full_name as created_by_name
       FROM orders o
       LEFT JOIN vehicles v ON o.vehicle_id = v.id
       LEFT JOIN drivers d ON o.driver_id = d.id
       LEFT JOIN users u ON o.created_by = u.id
       ORDER BY o.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single order
const getOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await pool.query(
      `SELECT o.*, 
        v.plate_number,
        d.full_name as driver_name,
        u.full_name as created_by_name
       FROM orders o
       LEFT JOIN vehicles v ON o.vehicle_id = v.id
       LEFT JOIN drivers d ON o.driver_id = d.id
       LEFT JOIN users u ON o.created_by = u.id
       WHERE o.id = $1`,
      [id]
    );

    if (order.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Get order items
    const items = await pool.query(
      `SELECT oi.*, p.name as product_name, p.unit_of_measure
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [id]
    );

    res.json({
      ...order.rows[0],
      items: items.rows,
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create order
const createOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    const { order_type, vehicle_id, driver_id, expected_date, notes, items } = req.body;

    if (!order_type || !vehicle_id || !driver_id || !items || items.length === 0) {
      return res.status(400).json({ message: 'Order type, vehicle, driver and items are required' });
    }

    await client.query('BEGIN');

    // Create order
    const order = await client.query(
      `INSERT INTO orders (order_type, vehicle_id, driver_id, created_by, expected_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [order_type, vehicle_id, driver_id, req.user.id, expected_date, notes]
    );

    // Create order items
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, expected_quantity)
         VALUES ($1, $2, $3)`,
        [order.rows[0].id, item.product_id, item.expected_quantity]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Order created successfully',
      order: order.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      `UPDATE orders SET status=$1, completed_date = CASE WHEN $1='completed' THEN NOW() ELSE NULL END
       WHERE id=$2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Confirm dispatch - deduct stock
const confirmDispatch = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Items are required' });
    }

    await client.query('BEGIN');

    for (const item of items) {
      const { product_id, actual_quantity } = item;

      // Check stock availability
      const stock = await client.query(
        'SELECT quantity FROM stock WHERE product_id = $1',
        [product_id]
      );

      if (stock.rows[0].quantity < actual_quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: `Insufficient stock for product ID ${product_id}` });
      }

      // Deduct stock
      await client.query(
        `UPDATE stock SET quantity = quantity - $1, last_updated = NOW()
         WHERE product_id = $2`,
        [actual_quantity, product_id]
      );

      // Update order item actual quantity
      await client.query(
        `UPDATE order_items SET actual_quantity=$1 WHERE order_id=$2 AND product_id=$3`,
        [actual_quantity, id, product_id]
      );

      // Record stock movement
      await client.query(
        `INSERT INTO stock_movements (product_id, movement_type, quantity, reference_id, performed_by)
         VALUES ($1, 'outbound', $2, $3, $4)`,
        [product_id, actual_quantity, id, req.user.id]
      );
    }

    // Update order status to completed
    await client.query(
      `UPDATE orders SET status='completed', completed_date=NOW() WHERE id=$1`,
      [id]
    );

    await client.query('COMMIT');

    res.json({ message: 'Dispatch confirmed successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Confirm dispatch error:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
};

module.exports = { getOrders, getOrder, createOrder, updateOrderStatus, confirmDispatch };