const jwt = require('jsonwebtoken');
const errors = require('../errors/errors');

const { JWT_SECRET } = process.env;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required but not set. Aborting.');
}

module.exports = (req, res, next) => {
  const token = req.cookies?.jwt;

  if (!token) {
    throw new errors.AuthentificationErrorCode('You are not authorised to access this resource');
  }

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw new errors.AuthentificationErrorCode('Authorization is needed');
  }

  req.user = payload;
  next();
};
