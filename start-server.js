#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting StoreMIS Server with Environment Variables...');

// Load environment variables from .env file if it exists
try {
  require('dotenv').config();
  console.log('📁 Loaded environment variables from .env file');
} catch (error) {
  console.log('⚠️  No .env file found, using default values');
}

// Set default environment variables if not already set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://postgres:Da1wi2d$@localhost:5432/mininfra?sslmode=prefer";
}
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = "your_secure_secret_here_12345";
}
if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = "http://localhost:3000";
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "your_jwt_secret_here_12345";
}

console.log('✅ Environment variables set successfully!');
console.log('📊 DATABASE_URL:', process.env.DATABASE_URL);
console.log('');

// Test database connection first
console.log('🔍 Testing database connection...');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful!');
    await prisma.$disconnect();
    
    // Start the development server
    console.log('');
    console.log('🌐 Starting Next.js development server...');
    console.log('📍 Server will be available at: http://localhost:3000');
    console.log('');
    
    const child = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env }
    });
    
    child.on('error', (error) => {
      console.error('❌ Failed to start server:', error);
    });
    
    child.on('exit', (code) => {
      console.log(`Server exited with code ${code}`);
    });
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('Please check your database configuration.');
    await prisma.$disconnect();
    process.exit(1);
  }
}

testConnection();
