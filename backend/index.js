// server.js
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';

// Import routes (make these files next)
import adminFormRoutes from './routes/AdminForm.routes.js';
import publicFormRoutes from './routes/PublicForm.routes.js';

// Import database connector
import connectDB from './database/database.js';

// Load environment variables first
dotenv.config();

// Connect MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['https://dynamic-admin-iota.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/admin/forms', adminFormRoutes);   // Admin CRUD routes
app.use('/forms', publicFormRoutes);        // Public user routes

// Health check route
app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'Server is healthy!', time: new Date().toISOString() });
});

// Root route
app.get('/', (req, res) => {
  res.send('Hello from Dynamic Form Builder backend!');
});

// Error handler middleware (basic)
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at: http://localhost:${PORT}`);
});

export default app;
