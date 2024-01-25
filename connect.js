const { MongoClient } = require('mongodb');
const config = require('./config');

// eslint-disable-next-line no-unused-vars

const { dbUrl } = config;
const options = {
  connectTimeoutMS: 3000,
  socketTimeoutMS: 3000,
  serverSelectionTimeoutMS: 3000,
};
const client = new MongoClient(dbUrl, options);
console.log(dbUrl);
function connect() {
  try {
    //await client.connect();
    const db = client.db('burger-queen-api');
    console.log('La conexión a la base de datos fue exitosa');
    return db;
  } catch (error) {
    console.error('Error durante la conexión:', error);
    throw new Error('Lo siento, no se pudo conectar a la base de datos');
  }
}
module.exports = { connect };
