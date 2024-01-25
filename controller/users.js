const bcrypt = require('bcrypt');
const { connect } = require('../connect');

module.exports = {
  getUsers: async (req, resp, next) => {
    try {
      const db = await connect();
      const usersCollection = db.collection('users');
      // Parámetros de paginación
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query._limit) || 10;

      // Filtros opcionales
      const emailFilter = req.query.email ? { email: req.query.email } : {};
      const roleFilter = req.query.role ? { 'roles.admin': req.query.role === 'admin' } : {};

      // Combinar filtros
      const filters = { ...emailFilter, ...roleFilter };

      // Realiza una consulta para obtener el total de usuarios con los filtros
      const totalUsers = await usersCollection.countDocuments(filters);

      // Calcula el índice de inicio y fin para la paginación
      const startIndex = (page - 1) * limit;
      const endIndex = page === 1 ? limit : page * limit;

      // Consulta con filtros y paginación
      const users = await usersCollection.find(filters).skip(startIndex).limit(endIndex).toArray();

      // Construye la respuesta con información de paginación
      const responseData = {
        totalItems: totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: page,
        users: users,
        limit: limit,
      };

      resp.json(responseData);
    } catch (error) {
      console.error(error);
      resp.status(500).json({ error: 'Error al obtener la lista de usuarios' });
    }
  },
};
