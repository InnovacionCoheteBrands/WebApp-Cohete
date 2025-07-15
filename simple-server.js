// Simple server debug script
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

console.log('Starting simple Express server...');

const app = express();
const port = parseInt(process.env.PORT || "5000");

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Simple server running'
  });
});

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Cohete Workflow Server',
    status: 'Running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Simple server running on port ${port}`);
  console.log(`📡 Server accessible at: http://0.0.0.0:${port}`);
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});