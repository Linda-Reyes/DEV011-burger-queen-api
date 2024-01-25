const jwt = require('jsonwebtoken');

// Middleware principal
module.exports = (secret) => (req, resp, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return next();
  }

  const [type, token] = authorization.split(' ');

  if (type.toLowerCase() !== 'bearer') {
    return next();
  }

  jwt.verify(token, secret, (err, decodedToken) => {
    if (err) {
      console.log(token, err);
      return next({ status: 403, message: 'Token invalido' });
    }
    req.userId = decodedToken.uid;
    req.userRole = decodedToken.role;
    console.log('Usuario autenticado:', req.userId, 'con el rol de:', req.userRole);
    return next();
  });

  // TODO: Verify user identity using `decodeToken.uid`//
};

// Función para verificar si el usuario está autenticado
module.exports.isAuthenticated = (req) => {
  const userId = req.userId ? req.userId.toString() : null;
  if (userId) {
    console.log('Usuario autenticado:', userId);
    return true;
  }
  console.log('Usuario no autenticado');
  return false;
  // TODO: Decide based on the request information whether the user is authenticated //
};

// Función para verificar si el usuario es administrador
module.exports.isAdmin = (req) => {
  const userRole = req.userRole ? req.userRole : null;
  if (userRole === 'admin') {
    console.log('El usuario es administrador');
    return true;
  }
  console.log('El usuario no es administrador');
  return false;
  // TODO: Decide based on the request information whether the user is an admin
};

// Middleware para requerir autenticación
module.exports.requireAuth = (req, resp, next) => (
  (!module.exports.isAuthenticated(req))

    ? next(401)
    : next()
);

// Middleware para requerir que el usuario sea administrador
module.exports.requireAdmin = (req, resp, next) => (
  // eslint-disable-next-line no-nested-ternary
  (!module.exports.isAuthenticated(req))
    ? next(401)
    : (!module.exports.isAdmin(req))
      ? next(403)
      : next()
);
