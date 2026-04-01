const mongoose = require('mongoose');
const prisma = require('../lib/prisma');

const datastoreStatus = {
  mongo: 'disabled',
  postgres: 'disabled',
};

async function initializeMongo() {
  if (!process.env.MONGODB_URI) {
    datastoreStatus.mongo = 'disabled';
    console.warn('[Backend] MongoDB disabled: MONGODB_URI is not set');
    return;
  }

  if (mongoose.connection.readyState === 1) {
    datastoreStatus.mongo = 'connected';
    return;
  }

  try {
    console.log('[Backend] Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    datastoreStatus.mongo = 'connected';
    console.log('[Backend] Successfully connected to MongoDB');
  } catch (error) {
    datastoreStatus.mongo = 'error';
    console.error('[Backend] MongoDB connection error:', error);
  }
}

async function initializePostgres() {
  if (!process.env.DATABASE_URL) {
    datastoreStatus.postgres = 'disabled';
    console.warn('[Backend] PostgreSQL disabled: DATABASE_URL is not set');
    return;
  }

  try {
    console.log('[Backend] Attempting to connect to PostgreSQL (Neon)...');
    await prisma.$connect();
    datastoreStatus.postgres = 'connected';
    console.log('[Backend] Successfully connected to PostgreSQL (Neon)');
  } catch (error) {
    datastoreStatus.postgres = 'error';
    console.error('[Backend] PostgreSQL connection error:', error);
  }
}

async function initializeDatastores() {
  await Promise.all([initializeMongo(), initializePostgres()]);
  return { ...datastoreStatus };
}

async function shutdownDatastores() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    datastoreStatus.mongo = 'disabled';
  }

  await prisma.$disconnect();
  datastoreStatus.postgres = 'disabled';
}

function getDatastoreStatus() {
  return { ...datastoreStatus };
}

module.exports = {
  getDatastoreStatus,
  initializeDatastores,
  shutdownDatastores,
};