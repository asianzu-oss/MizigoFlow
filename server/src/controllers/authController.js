const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Login
const login = async (req, res) => {
  try {
    const { full_name, password } = req.body;

    // Validate input
    if (!full_name || !password) {
      return res.status(400).json({ message: 'Full name and password are required' });
    }

    // Find users with matching full name
    const result = await pool.query(
      'SELECT * FROM users WHERE full_name = $1 AND is_active = true',
      [full_name]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password against each match
    let user = null;
    for (const row of result.rows) {
      const isMatch = await bcrypt.compare(password, row.password_hash);
      if (isMatch) {
        user = row;
        break;
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        role: user.role,
        phone_number: user.phone_number,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Register (admin only)
const register = async (req, res) => {
  try {
    const { full_name, email, phone_number, password, role } = req.body;

    // Validate input
    if (!full_name || !phone_number || !password || !role) {
      return res.status(400).json({ message: 'Full name, phone number, password and role are required' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (full_name, email, phone_number, password_hash, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, email, phone_number, role`,
      [full_name, email, phone_number, password_hash, role]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, full_name, email, phone_number, role FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { login, register, getMe };