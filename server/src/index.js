const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const vehicleRoutes = require('./routes/vehicles');
const driverRoutes = require('./routes/drivers');
const gateRoutes = require('./routes/gates');
const inventoryRoutes = require('./routes/inventory');
const orderRoutes = require('./routes/orders');
const documentRoutes = require('./routes/documents');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/gates', gateRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/documents', documentRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'MizigoFlow API is running' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`MizigoFlow server running on port ${PORT}`);
});

module.exports = app;