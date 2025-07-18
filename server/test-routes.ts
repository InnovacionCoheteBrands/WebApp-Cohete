// Test file to identify problematic route
import express from "express";

const app = express();

// Test the most recently added routes one by one
try {
  app.patch('/api/tasks/:taskId', (req, res) => res.json({}));
  console.log("✓ Route 1 OK");
} catch (e) { console.log("✗ Route 1 FAILED:", e.message); }

try {
  app.get('/api/tasks/:taskId/attachments', (req, res) => res.json({}));
  console.log("✓ Route 2 OK");
} catch (e) { console.log("✗ Route 2 FAILED:", e.message); }

try {
  app.post('/api/tasks/:taskId/attachments', (req, res) => res.json({}));
  console.log("✓ Route 3 OK");
} catch (e) { console.log("✗ Route 3 FAILED:", e.message); }

try {
  app.get('/api/tasks/:taskId', (req, res) => res.json({}));
  console.log("✓ Route 4 OK");
} catch (e) { console.log("✗ Route 4 FAILED:", e.message); }

console.log("Route testing completed");