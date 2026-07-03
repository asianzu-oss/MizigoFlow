const pool = require('../config/db');

// Get all users
const getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, full_name, email, phone_number, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, phone_number, role, is_active } = req.body;
    const result = await pool.query(
      `UPDATE users SET full_name=$1, email=$2, phone_number=$3, role=$4, is_active=$5
       WHERE id=$6 RETURNING id, full_name, email, phone_number, role, is_active`,
      [full_name, email, phone_number, role, is_active, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const result = await pool.query(
      'DELETE FROM users WHERE id=$1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getUsers, updateUser, deleteUser };