const config = require('./config');
const { MongoClient } = require('mongodb');
// eslint-disable-next-line no-unused-vars

const { dbUrl } = config;
const client = new MongoClient(dbUrl);

async function connect() {
  try {
    await client.connect();
    const db = client.db('Burger-Queen');
    return db;
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    throw new Error('No se pudo conectar a la base de datos');
  }
  // TODO: Database Connection
}

module.exports = { connect };
