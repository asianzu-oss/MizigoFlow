const pool = require('../config/db');

// Get all vehicles
const getVehicles = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT v.*, d.full_name as driver_name, d.phone_number as driver_phone
       FROM vehicles v
       LEFT JOIN drivers d ON v.driver_id = d.id
       ORDER BY v.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single vehicle
const getVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT v.*, d.full_name as driver_name, d.phone_number as driver_phone
       FROM vehicles v
       LEFT JOIN drivers d ON v.driver_id = d.id
       WHERE v.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create vehicle
const createVehicle = async (req, res) => {
  try {
    const { plate_number, type, driver_id } = req.body;
    if (!plate_number) {
      return res.status(400).json({ message: 'Plate number is required' });
    }
    const result = await pool.query(
      `INSERT INTO vehicles (plate_number, type, driver_id)
       VALUES ($1, $2, $3) RETURNING *`,
      [plate_number, type, driver_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Plate number already exists' });
    }
    console.error('Create vehicle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update vehicle
const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { plate_number, type, driver_id } = req.body;
    const result = await pool.query(
      `UPDATE vehicles SET plate_number=$1, type=$2, driver_id=$3
       WHERE id=$4 RETURNING *`,
      [plate_number, type, driver_id, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete vehicle
const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM vehicles WHERE id=$1', [id]);
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle };