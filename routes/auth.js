const jwt = require('jsonwebtoken');
const config = require('../config');
const { secret } = config;
const { connect } = require('../connect');

module.exports = (app, nextMain) => {
  app.post('/login', async (req, resp, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(400);
    }

    try {
      const db = connect();
      const users = db.collection('users');
      const query = { email, password };
      const resultUser = await users.findOne(query);
      console.log(resultUser);
      if (resultUser) {
        const token = jwt.sign({ email, uid: resultUser._id, role: resultUser.role }, secret);
        resp.json({ accessToken: token });
      } else {
        next(404);
      }
    } catch (err) {
      console.error(err);
    }
  });

  return nextMain();
};
