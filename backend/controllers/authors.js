const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const Author = require('../models/author');
const errors = require('../errors/errors');
const { logger } = require('../middlewares/logger');

const getAuthors = (req, res, next) => {
  Author.find({}, { email: 0, mobile: 0 })
    .then((authors) => res.status(200).send(authors))
    .catch(next);
};

const getAuthorsByName = (req, res, next) => {
  const { firstName, familyName } = req.body;
  Author.findAuthorsByName(firstName, familyName, { email: 0, mobile: 0 })
    .then((authors) => {
      if (authors.length === 0) {
        throw new errors.NotFoundError('No authors found');
      };
      res.status(200).send(authors);
    })
    .catch(next);
};

const getAuthorsByEmail = (req, res, next) => {
  logger.info('getAuthorsByEmail called', { email: req.params.email });
  const { email } = req.params;
  Author.findOne({ email }).populate('organisations')
    .then((author) => {
      if (author.length === 0) {
        throw new errors.NotFoundError('No authors with this email found');
      }
      res.status(200).send(author);
    })
    .catch(next);
};

const getMe = (req, res, next) => {
  logger.info('getMe called', { userID: req.user._id });
  Author.findById(req.user._id)
    .then((author) => {
      if (!author) {
        throw new errors.NotFoundError('Author not found');
      }
      return res.status(200).send(author);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new errors.CastErrorCode('Author ID error');
      }
      next(err);
    })
    .catch(next);
};

const getAuthor = (req, res, next) => {
  Author.findById(req.params.authorId, { email: 0, mobile: 0 })
    .then((author) => {
      if (!author) {
        throw new errors.NotFoundError('Author not found');
      }
      return res.status(200).send(author);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new errors.CastErrorCode('Author ID error');
      }
    })
    .catch(next);
};

const createAuthor = (req, res, next) => {
  const {
    authorID,
    email,
    password,
    mobile,
    firstName,
    middleName,
    familyName,
    scientificDegree,
    avatar,
    institutions,
    reviewer,
    categories,
  } = req.body;
  if (!validator.isEmail(email)) {
    throw new errors.ValidationErrorCode('Check email spelling.');
  }
  Author.findOne({ email })
    .then((author) => {
      if (author) {
        throw new errors.AuthorExistsError('This email is already used.');
      }
      bcrypt.hash(password, 10)
        .then((hash) => {
          Author.create({
            authorID,
            email,
            password: hash,
            mobile,
            firstName,
            middleName,
            familyName,
            scientificDegree,
            avatar,
            institutions,
            reviewer,
            categories,
          })
            .then(() => {
              res.status(200).send({
                authorID,
                email,
                mobile,
                firstName,
                middleName,
                familyName,
                scientificDegree,
                avatar,
                institutions,
                reviewer,
                categories,
              });
            })
            .catch((err) => {
              if (err.name === 'ValidationError') {
                throw new errors.ValidationErrorCode(`Validation error ${err.message}`);
              }
            })
            .catch(next);
        });
    })
    .catch(next);
};

const updateAuthor = (req, res, next) => {
  const { name, middleName, familyName, scientificDegree, institutions, categories } = req.body;
  return Author.findByIdAndUpdate(
    req.user._id,
    { name, middleName, familyName, scientificDegree, institutions, categories },
    { runValidators: true, new: true },
  )
    .then((author) => {
      if (!author) {
        throw new errors.NotFoundError('Author not found');
      }
      return res.status(200).send(author);
    })
    .catch(next);
};

const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  return Author.findByIdAndUpdate(
    req.author._id,
    { avatar },
    { runValidators: true, new: true },
  )
    .then((author) => {
      if (!author) {
        throw new errors.NotFoundError('Author not found');
      }
      return res.status(200).send(author);
    })
    .catch(next);
};

const updateCredentials = (req, res, next) => {
  const { email, password } = req.body;
  if (!validator.isEmail(email)) {
    throw new errors.ValidationErrorCode('Check email spelling.');
  }
  Author.findOne({ email })
    .then((author) => {
      if (author) {
        throw new errors.AuthorExistsError('This email is already used.');
      }
      bcrypt.hash(password, 10)
        .then((hash) => {
          Author.findOne(
            email,
            {
              email,
              password: hash,
            },
            { runValidators: true, new: true },
          )
            .then(() => {
              res.status(200).send({ email });
            })
            .catch((err) => {
              if (err.name === 'ValidationError') {
                throw new errors.ValidationErrorCode(`Validation error ${err.message}`);
              }
            })
            .catch(next);
        });
    })
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  return Author.findauthorByCredentials(email, password, next)
    .then((author) => {
      if (!author) {
        throw new errors.NotFoundError('Author not found');
      }

      const { JWT_SECRET } = process.env;
      const token = jwt.sign(
        { _id: author._id },
        JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY || '7d' },
      );

      res
        .cookie('jwt', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
        })
        .status(200)
        .json({ message: 'Login successful' });
    })
    .catch(next);
};

module.exports = {
  createAuthor,
  login,
  getAuthors,
  getAuthor,
  getAuthorsByName,
  getAuthorsByEmail,
  getMe,
  updateAuthor,
  updateAvatar,
  updateCredentials,
};
