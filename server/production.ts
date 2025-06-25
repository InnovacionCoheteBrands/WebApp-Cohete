
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Production configuration for deployment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const productionConfig = {
  port: parseInt(process.env.PORT || "5000"),
  staticPath: path.join(__dirname, '../public'),
  nodeEnv: 'production',
  corsOrigins: [
    `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`,
    `https://${process.env.REPL_SLUG || 'localhost'}.replit.dev`,
    `https://${process.env.REPL_ID || 'localhost'}.replit.app`
  ]
};

export default productionConfig;
