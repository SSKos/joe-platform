/* eslint-disable func-names */
const mongoose = require('mongoose');
const validator = require('validator');
// const bcrypt = require('bcryptjs');
// const errors = require('../errors/errors');

const organisationSchema = new mongoose.Schema({

  fullTitle: {
    required: true,
    type: String,
    minLength: 2,
  },

  shortTitle: {
    type: String,
  },

  address: {
    type: String,
    minLength: 2,
  },

  logo: {
    type: String,
    validate: {
      validator: (value) => validator.isURL(value),
      message: 'Wrong URL',
    },
  },

  authors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'author',
  }],

  articles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'article',
  }],
}, { timestamps: true });

// institutionSchema.statics.findinstitutionByCredentials = function (email, password) {
//   return this.findOne({ email }).select('+password')
//     .then((institution) => {
//       if (!institution) {
//         throw new errors.AuthentificationErrorCode('Wrong email or password');
//       }

//       return bcrypt.compare(password, institution.password)
//         .then((matched) => {
//           if (!matched) {
//             throw new errors.AuthentificationErrorCode('Wrong email or password');
//           }

//           return institution;
//         });
//     });
// };

module.exports = mongoose.model('organisation', organisationSchema);
