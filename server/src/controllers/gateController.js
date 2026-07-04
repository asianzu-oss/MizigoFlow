const { sendCheckInAlert } = require('../utils/sms');
const pool = require('../config/db');

// Get all gate logs
const getGateLogs = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT g.*, 
        v.plate_number, 
        d.full_name as driver_name,
        u1.full_name as checked_in_by_name,
        u2.full_name as checked_out_by_name
       FROM gate_logs g
       LEFT JOIN vehicles v ON g.vehicle_id = v.id
       LEFT JOIN drivers d ON g.driver_id = d.id
       LEFT JOIN users u1 ON g.checked_in_by = u1.id
       LEFT JOIN users u2 ON g.checked_out_by = u2.id
       ORDER BY g.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get gate logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single gate log
const getGateLog = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT g.*, 
        v.plate_number, 
        d.full_name as driver_name,
        u1.full_name as checked_in_by_name,
        u2.full_name as checked_out_by_name
       FROM gate_logs g
       LEFT JOIN vehicles v ON g.vehicle_id = v.id
       LEFT JOIN drivers d ON g.driver_id = d.id
       LEFT JOIN users u1 ON g.checked_in_by = u1.id
       LEFT JOIN users u2 ON g.checked_out_by = u2.id
       WHERE g.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Gate log not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get gate log error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Vehicle check in
const checkIn = async (req, res) => {
  try {
    const { vehicle_id, driver_id, direction, purpose, order_id, notes } = req.body;

    if (!vehicle_id || !driver_id || !direction || !purpose) {
      return res.status(400).json({ message: 'Vehicle, driver, direction and purpose are required' });
    }

    const result = await pool.query(
      `INSERT INTO gate_logs 
        (vehicle_id, driver_id, direction, purpose, order_id, checked_in_by, arrival_time, notes)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7) RETURNING *`,
      [vehicle_id, driver_id, direction, purpose, order_id, req.user.id, notes]
    );

    // Get manager phone numbers to notify
    const managers = await pool.query(
      `SELECT phone_number FROM users WHERE role IN ('admin', 'manager') AND is_active = true`
    );

    // Send SMS to all managers
    for (const manager of managers.rows) {
      await sendCheckInAlert(manager.phone_number, vehicle_id, driver_id);
    }

    res.status(201).json({
      message: 'Vehicle checked in successfully',
      gate_log: result.rows[0],
    });
  } catch (error) {
    console.error('Check in error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Vehicle check out
const checkOut = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // Get the gate log
    const gateLog = await pool.query(
      'SELECT * FROM gate_logs WHERE id = $1',
      [id]
    );

    if (gateLog.rows.length === 0) {
      return res.status(404).json({ message: 'Gate log not found' });
    }

    if (gateLog.rows[0].departure_time) {
      return res.status(400).json({ message: 'Vehicle already checked out' });
    }

    // Calculate turnaround time in minutes
    const arrivalTime = new Date(gateLog.rows[0].arrival_time);
    const departureTime = new Date();
    const turnaround = Math.round((departureTime - arrivalTime) / 60000);

    const result = await pool.query(
      `UPDATE gate_logs 
       SET departure_time=NOW(), checked_out_by=$1, turnaround_minutes=$2, notes=COALESCE($3, notes)
       WHERE id=$4 RETURNING *`,
      [req.user.id, turnaround, notes, id]
    );

    res.json({
      message: 'Vehicle checked out successfully',
      gate_log: result.rows[0],
    });
  } catch (error) {
    console.error('Check out error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getGateLogs, getGateLog, checkIn, checkOut };