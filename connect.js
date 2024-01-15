const config = require('./config');
const { MongoClient } = require('mongodb');
// eslint-disable-next-line no-unused-vars

const { dbUrl } = config;
// extrae la variable de dbUrl de config.
const client = new MongoClient(dbUrl);

async function connect() {
  try {
    await client.connect();
    const db = client.db('Burger-Queen');
    console.log('La conexión a la base de datos fue exitosa');
    return db;
  } catch (error) {
    console.error('Error durante la conexión:', error);
    throw new Error('Lo siento, no se pudo conectar a la base de datos');
  }
}
module.exports = { connect };
