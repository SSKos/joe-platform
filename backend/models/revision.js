const mongoose = require('mongoose');
// const validator = require('validator');

const revisionSchema = new mongoose.Schema({
  articleID: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'article',
  },

  status: {
    required: true,
    type: String,
    enum: ['Draft', 'Submitted'],
    default: 'Draft',
  },

  categories: [{
    required: true,
    type: String,
  }],

  authors: [{
    author: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: 'author',
    },
    organisations: [{
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: 'organisation',
    }],
  }],

  articleTitle: {
    required: true,
    type: String,
    minLength: 5,
  },

  abstract: {
    required: true,
    type: String,
    minLength: 500,
  },

  articleType: {
    required: true,
    type: String,
    enum: ['review', 'original research', 'short report', 'case report', 'position paper', 'recommendations', 'clinical trial', 'meta'],
  },

  articleDoc: {
    required: true,
    type: String,
  },

  // pdfID: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'pdf',
  // },

  supplements: [{
    type: String,
  }],

  ratingByAuthor: {
    required: true,
    type: Number,
    integerOnly: true,
  },

  conflictDisclosure: {
    required: true,
    type: String,
    minLength: 10,
  },

  authorsInput: {
    required: true,
    type: String,
    minLength: 10,
  },

  ethicStatement: {
    required: true,
    type: String,
    minLength: 10,
  },

  reviews: [{
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'review',
  }],

  replyToReview: {
    type: String,
    minLength: 10,
  },
}, { timestamps: true });

module.exports = mongoose.model('revision', revisionSchema);
