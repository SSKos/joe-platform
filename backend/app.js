require('dotenv').config();
const cors = require('cors');
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { celebrate, Joi, errors } = require('celebrate');
const authors = require('./routes/authors');
const articles = require('./routes/articles');
// const revisions = require('./routes/revisions');
// const reviews = require('./routes/reviews');
const myaccount = require('./routes/myaccount');
const organisations = require('./routes/organisations');
const auth = require('./middlewares/auth');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:3000';

const options = {
  // TODO: set ALLOWED_ORIGIN env var in production to the deployed frontend URL
  origin: ALLOWED_ORIGIN,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: ['Content-Type', 'origin'],
  credentials: true, // required for HttpOnly cookie auth
};
const {
  createAuthor,
  login,
} = require('./controllers/authors');

const { PORT = 2000 } = process.env;
const app = express();
const path = require('path');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/JOEdb');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.',
});

app.use(limiter);
app.use('*', cors(options));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(requestLogger);

app.post('/signin', celebrate(
  {
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(4),
    }),
  },
), login);
app.post('/signup', celebrate(
  {
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(4),
      mobile: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
      firstName: Joi.string().min(2).max(50),
      familyName: Joi.string().min(2).max(50),
      middleName: Joi.string().min(1).max(50).allow(''),
      scientificDegree: Joi.string().min(2).max(30).allow(''),
      avatar: Joi.string().pattern(/^http(s)?:\/\/(www\.)?[\w\-\.\_\~\:\/\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=]+$/).min(12).allow(''),
      about: Joi.string().min(2).max(300).allow(''),
      institutions: Joi.array().optional(),
      categories: Joi.array().optional(),
    }),
  },
), createAuthor);
// Middleware to decode URL components
app.use((req, res, next) => {
  req.url = decodeURIComponent(req.url);
  next();
});

app.post('/signout', (req, res) => {
  res.clearCookie('jwt').json({ message: 'Signed out' });
});

// app.use(auth);
app.use('/articles', articles);
// app.use('/articles', revisions);
// app.use('/articles', reviews);
app.use('/authors', authors);
app.use('/organisation', organisations);
app.use(auth);
app.use('/myaccount', myaccount);
// Serve PDF files from the 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(errorLogger);
// celebrate' errors
app.use(errors());

app.use((req, res) => {
  res
    .status(404)
    .send({
      message: 'resource was not found',
    });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({ message });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${PORT}`);
});
