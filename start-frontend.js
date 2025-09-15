#!/usr/bin/env node

// Frontend-only startup script for Volumania
// This starts only the Vite development server without backend dependencies

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDir = path.join(__dirname, 'client');

console.log('🚀 Starting Volumania Frontend (Mock Mode)');
console.log('📁 Client directory:', clientDir);

// Start Vite development server
const viteProcess = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '5000'], {
  cwd: clientDir,
  stdio: 'inherit',
  shell: true
});

viteProcess.on('error', (error) => {
  console.error('❌ Failed to start Vite server:', error);
  process.exit(1);
});

viteProcess.on('close', (code) => {
  console.log(`Vite server exited with code ${code}`);
  process.exit(code);
});

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down frontend server...');
  viteProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Terminating frontend server...');
  viteProcess.kill('SIGTERM');
  process.exit(0);
});