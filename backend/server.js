require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

// Connect to database
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const app = express();

// Middleware
const cors = require("cors");

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Basic test route
app.get('/', (req, res) => {
  res.json({ message: 'Shop Rental Management System API is running...' });
});

// Route mounting
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tenants', require('./routes/tenants'));
app.use('/api/shops', require('./routes/shops'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/deposits', require('./routes/deposits'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/activity-logs', require('./routes/activityLogs'));

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running in development mode on port ${PORT}`);
  });
}

module.exports = app;
