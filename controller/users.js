const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const { connect } = require('../connect');

module.exports = {
  getUsers: async (req, resp, next) => {
    try {
      const db = connect();
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

  postUsers: async (req, resp, next) => {
    // Crear nuevos usuarios
    try {
      const db = connect();
      const usersCollection = db.collection('users');
      // Validar si el usuario ya existe
      const existingUser = await usersCollection.findOne({ email: req.body.email });
      if (existingUser) {
        console.log('El usuario ya existe');
        return resp.status(403).json({ error: 'El usuario ya existe' });
      }
      // Validar si el email y la contraseña están presentes en la solicitud
      if (!req.body.email || !req.body.password) {
        console.log('Email y contraseña son obligatorios');
        return resp.status(400).json({ error: 'Email y contraseña son obligatorios' });
      }

      // Validar la longitud de la contraseña
      if (req.body.password.length < 6) {
        console.log('La contraseña debe tener al menos 6 caracteres');
        return resp.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      }
      // Verifica si el email es válido
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(req.body.email)) {
        console.log('Email no válido');
        return resp.status(400).json({ error: 'Email no válido' });
      }

      if (!req.body.password) {
        console.log('Contraseña es obligatoria');
        return resp.status(400).json({ error: 'Contraseña es obligatoria' });
      }
  
      const hashedPassword = bcrypt.hashSync(req.body.password, 10);

      const newUser = {
        email: req.body.email,
        password: hashedPassword,
        roles: req.body.roles,
      };
      await usersCollection.insertOne(newUser);
      delete newUser.password;
      console.log('Se agrego el usuario con exito!!');
      resp.status(200).json(newUser);
    } catch (error) {
      console.log('Error al agregar usuario', error);
      resp.status(500).json({ error: 'Error al agregar un nuevo usuario' });
    }
  }

     
  getUsersUid: async (req, resp, next) => {
    // Obtener usuario por id
    try {
      const db = connect();
      const usersCollection = db.collection('users');
      const userId = req.params.uid;
      let user;

      // Verifica si el parámetro es un ID válido
      if (ObjectId.isValid(userId)) {
        const objectId = new ObjectId(userId);
        user = await usersCollection.findOne({ _id: objectId });
      } else {
        // Si no es un ID válido, asume que es un correo electrónico
        user = await usersCollection.findOne({ email: userId });
      }

      if (!user) {
        console.log('El usuario no existe');
        return resp.status(404).json({ error: 'El usuario no existe' });
      }
      // Verificar si el usuario autenticado es el propietario o un administrador
      const authenticatedUserId = req.userId ? req.userId.toString() : null;
      if (authenticatedUserId !== user._id.toString() && req.userRole !== 'admin') {
        console.log('No autorizado');
        return resp.status(403).json({ error: 'No autorizado' });
      }

      console.log(user);
      resp.json(user);
    } catch (error) {
      console.error(error);
      resp.status(500).json({ error: 'Error al obtener el usuario' });
    }
  },

  postUsers: async (req, resp, next) => {
    // Crear nuevos usuarios
    try {
      const db = connect();
      const usersCollection = db.collection('users');
      // Validar si el usuario ya existe
      const existingUser = await usersCollection.findOne({ email: req.body.email });
      if (existingUser) {
        console.log('El usuario ya existe');
        return resp.status(403).json({ error: 'El usuario ya existe' });
      }
      // Validar si el email y la contraseña están presentes en la solicitud
      if (!req.body.email || !req.body.password) {
        console.log('Email y contraseña son obligatorios');
        return resp.status(400).json({ error: 'Email y contraseña son obligatorios' });
      }

      // Validar la longitud de la contraseña
      if (req.body.password.length < 6) {
        console.log('La contraseña debe tener al menos 6 caracteres');
        return resp.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      }
      // Verifica si el email es válido
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(req.body.email)) {
        console.log('Email no válido');
        return resp.status(400).json({ error: 'Email no válido' });
      }

      if (!req.body.password) {
        console.log('Contraseña es obligatoria');
        return resp.status(400).json({ error: 'Contraseña es obligatoria' });
      }
  
      const hashedPassword = bcrypt.hashSync(req.body.password, 10);

      const newUser = {
        email: req.body.email,
        password: hashedPassword,
        roles: req.body.roles,
      };
      await usersCollection.insertOne(newUser);
      delete newUser.password;
      console.log('Se agrego el usuario con exito!!');
      resp.status(200).json(newUser);
    } catch (error) {
      console.log('Error al agregar usuario', error);
      resp.status(500).json({ error: 'Error al agregar un nuevo usuario' });
    }
  },
  
  updateUsersUid: async (req, resp, next) => {
    // Actualiza o edita al usuario
    try {
      const db = await connect();
      const usersCollection = db.collection('users');
      const userId = req.params.uid;

      let user, objectId;

      // Verifica si el parámetro es un ID válido
      if (ObjectId.isValid(userId)) {
        objectId = new ObjectId(userId);
        user = await usersCollection.findOne({ _id: objectId });
      } else {
        // Si no es un ID válido, asume que es un correo electrónico
        user = await usersCollection.findOne({ email: userId });
        objectId = user ? user._id : null; // Obtén el _id del usuario si se encontró por correo
      }

      if (!user) {
        console.log('El usuario no existe');
        return resp.status(404).json({ error: 'El usuario no existe' });
      }
      // Verificar si el usuario autenticado es el propietario o un administrador
      const authenticatedUserId = req.userId ? req.userId.toString() : null;
      if (authenticatedUserId !== user._id.toString() && req.userRole !== 'admin') {
        console.log('No autorizado');
        return resp.status(403).json({ error: 'No autorizado' });
      }
    // Verificación de actualización de propiedades
      const updatedData = {};

      if (req.body.email !== undefined && req.body.email !== null) {
        updatedData.email = req.body.email;
      }

      if (req.body.password !== undefined && req.body.password !== null) {
        const hashedPassword = bcrypt.hashSync(req.body.password, 10);
        updatedData.password = hashedPassword;
      }

      if (req.body.roles !== undefined && req.body.roles !== null) {
      // Verificar si el usuario autenticado es un administrador
        if (req.userRole === 'admin') {
          updatedData.roles = req.body.roles;
        } else {
          console.log('No autorizado para cambiar roles');
          return resp.status(403).json({ error: 'No autorizado para cambiar roles' });
        }
      }

      if (req.body.roles) {
      // Verificar si el usuario autenticado es un administrador
        if (req.userRole === 'admin') {
          updatedData.roles = req.body.roles;
        } else {
          console.log('No autorizado para cambiar roles');
          return resp.status(403).json({ error: 'No autorizado para cambiar roles' });
        }
      }

      // Verifica que haya al menos una propiedad para actualizar
      if (Object.keys(updatedData).length === 0) {
        console.log('No hay propiedades para actualizar');
        return resp.status(400).json({ error: 'No hay propiedades para actualizar' });
      }
      // Realiza la actualización del usuario
      const result = await usersCollection.updateOne({ _id: objectId }, { $set: updatedData });

      if (result.modifiedCount === 1) {
        console.log('Usuario actualizado con éxito');
        resp.status(200).json({ message: 'Usuario actualizado con éxito' });
      } else {
        console.log('No se pudo actualizar el usuario');
        resp.status(500).json({ error: 'No se pudo actualizar el usuario' });
      }
    } catch (error) {
      console.error(error);
      resp.status(500).json({ error: error.message || 'Error interno del servidor' });
    }
  },

  
  deleteUsersUid: async (req, resp, next) => {
    // Elimina el usuario
    try {
      const db = await connect();
      const usersCollection = db.collection('users');
      const userId = req.params.uid;

      let user, objectId;

      // Verifica si el parámetro es un ID válido
      if (ObjectId.isValid(userId)) {
        objectId = new ObjectId(userId);
        user = await usersCollection.findOne({ _id: objectId });
      } else {
        // Si no es un ID válido, asume que es un correo electrónico
        user = await usersCollection.findOne({ email: userId });
        objectId = user ? user._id : null; // Obtén el _id del usuario si se encontró por correo
      }

      if (!user) {
        console.log('El usuario no existe');
        return resp.status(404).json({ error: 'El usuario no existe' });
      }
      // Verificar si el usuario autenticado es el propietario o un administrador
      const authenticatedUserId = req.userId ? req.userId.toString() : null;
      if (authenticatedUserId !== user._id.toString() && req.userRole !== 'admin') {
        console.log('No autorizado');
        return resp.status(403).json({ error: 'No autorizado' });
      }

      if (!user) {
        console.log('El usuario no existe');
        return resp.status(404).json({ error: 'El usuario no existe' });
      }

      await usersCollection.deleteOne({ _id: objectId });

      console.log('Usuario eliminado con éxito');
      resp.status(200).json({ message: 'Usuario eliminado con éxito' });
    } catch (error) {
      console.error(error);
      resp.status(500).json({ error: 'Error al eliminar el usuario' });
    }
  },
}
