/* eslint-disable func-names */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const errors = require('../errors/errors');

const authorSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (value) => validator.isEmail(value),
      message: 'Wrong email',
    },
  },

  password: {
    type: String,
    required: true,
    select: false,
  },

  mobile: {
    type: String,
    sparse: true,
  },

  firstName: {
    required: true,
    type: String,
    minLength: 2,
  },

  middleName: {
    type: String,
  },

  familyName: {
    type: String,
    minLength: 2,
  },

  scientificDegree: { // none, PhD, Professor etc.
    type: String,
  },

  avatar: {
    type: String,
    validate: {
      validator: (value) => validator.isURL(value),
      message: 'Wrong URL',
    },
  },

  organisations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'organisation',
  }],

  categories: {
    type: [String],
    default: [],
  }, //this should be suspended some time later when enough authors are present to replace search of reviewers through the categories of the published aricles

  reviewer: {
    type: Boolean,
    required: true,
    default: true,
  }, //allows the user to recieve review requests

  articles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'article',
  }],

  reviewRequests: [{
    articleID: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: 'article',
    },
    status: {
      required: true,
      type: String,
      enum: ['requestedReview', 'underReview', 'reviewed', 'declinedReview', 'expiredReview'],
    },
  }],

  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'review',
  }],

}, { timestamps: true });

authorSchema.statics.findauthorByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((author) => {
      if (!author) {
        throw new errors.AuthentificationErrorCode('Wrong email or password');
      }

      return bcrypt.compare(password, author.password)
        .then((matched) => {
          if (!matched) {
            throw new errors.AuthentificationErrorCode('Wrong email or password');
          }

          return author; // now user is available
        });
    });
};

authorSchema.statics.findAuthorsByName = function (firstName, familyName) {
  return this.find(
    {
      $or: [
        { firstName, familyName },
        { firstName },
        { familyName },
     ]
    }, { email: 0, mobile: 0 }
  ).then((authors) => {
    if (!authors) {
      throw new errors.NotFoundError('Server error. No authors found');
    }
    return authors;
  });
};

module.exports = mongoose.model('author', authorSchema);
