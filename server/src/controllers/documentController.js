const pool = require('../config/db');

// Get all documents
const getDocuments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, 
        o.order_type,
        u.full_name as generated_by_name
       FROM documents d
       LEFT JOIN orders o ON d.order_id = o.id
       LEFT JOIN users u ON d.generated_by = u.id
       ORDER BY d.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single document with full details
const getDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await pool.query(
      `SELECT d.*, 
        o.order_type, o.status, o.notes as order_notes, o.expected_date,
        v.plate_number, v.type as vehicle_type,
        dr.full_name as driver_name, dr.phone_number as driver_phone,
        dr.license_number,
        u.full_name as generated_by_name
       FROM documents d
       LEFT JOIN orders o ON d.order_id = o.id
       LEFT JOIN vehicles v ON o.vehicle_id = v.id
       LEFT JOIN drivers dr ON o.driver_id = dr.id
       LEFT JOIN users u ON d.generated_by = u.id
       WHERE d.id = $1`,
      [id]
    );

    if (document.rows.length === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Get order items
    const items = await pool.query(
      `SELECT oi.*, p.name as product_name, p.unit_of_measure, p.sku
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [document.rows[0].order_id]
    );

    res.json({
      ...document.rows[0],
      items: items.rows,
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate GRN
const generateGRN = async (req, res) => {
  try {
    const { order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    // Check if GRN already exists for this order
    const existing = await pool.query(
      `SELECT * FROM documents WHERE order_id=$1 AND document_type='GRN'`,
      [order_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'GRN already exists for this order' });
    }

    const result = await pool.query(
      `INSERT INTO documents (document_type, order_id, generated_by)
       VALUES ('GRN', $1, $2) RETURNING *`,
      [order_id, req.user.id]
    );

    res.status(201).json({
      message: 'GRN generated successfully',
      document: result.rows[0],
    });
  } catch (error) {
    console.error('Generate GRN error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate Waybill
const generateWaybill = async (req, res) => {
  try {
    const { order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    // Check if waybill already exists for this order
    const existing = await pool.query(
      `SELECT * FROM documents WHERE order_id=$1 AND document_type='waybill'`,
      [order_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Waybill already exists for this order' });
    }

    const result = await pool.query(
      `INSERT INTO documents (document_type, order_id, generated_by)
       VALUES ('waybill', $1, $2) RETURNING *`,
      [order_id, req.user.id]
    );

    res.status(201).json({
      message: 'Waybill generated successfully',
      document: result.rows[0],
    });
  } catch (error) {
    console.error('Generate waybill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate Delivery Note
const generateDeliveryNote = async (req, res) => {
  try {
    const { order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const result = await pool.query(
      `INSERT INTO documents (document_type, order_id, generated_by)
       VALUES ('delivery_note', $1, $2) RETURNING *`,
      [order_id, req.user.id]
    );

    res.status(201).json({
      message: 'Delivery note generated successfully',
      document: result.rows[0],
    });
  } catch (error) {
    console.error('Generate delivery note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDocuments, getDocument, generateGRN, generateWaybill, generateDeliveryNote };