const pool = require('../config/db');

// Get all drivers
const getDrivers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM drivers ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single driver
const getDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM drivers WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get driver error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create driver
const createDriver = async (req, res) => {
  try {
    const { full_name, phone_number, national_id, license_number } = req.body;
    if (!full_name) {
      return res.status(400).json({ message: 'Full name is required' });
    }
    const result = await pool.query(
      `INSERT INTO drivers (full_name, phone_number, national_id, license_number)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [full_name, phone_number, national_id, license_number]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create driver error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update driver
const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone_number, national_id, license_number } = req.body;
    const result = await pool.query(
      `UPDATE drivers SET full_name=$1, phone_number=$2, national_id=$3, license_number=$4
       WHERE id=$5 RETURNING *`,
      [full_name, phone_number, national_id, license_number, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update driver error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete driver
const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM drivers WHERE id=$1', [id]);
    res.json({ message: 'Driver deleted successfully' });
  } catch (error) {
    console.error('Delete driver error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDrivers, getDriver, createDriver, updateDriver, deleteDriver };