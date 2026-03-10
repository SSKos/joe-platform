const mongoose = require('mongoose');
// const validator = require('validator');

const reviewSchema = new mongoose.Schema({
  submitDate: {
    type: Date,
  },
  revisionID: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'revision',
  },
  reviewerID: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'author',
  },
  // reviewText: {
  //   required: true,
  //   type: String,
  //   minLength: 5,
  // },
  rating: {
    required: true,
    type: Number,
  },
  decision: {
    required: true,
    type: String,
    enum: ['Accept', 'Revise', 'Decline'],
  },
  reviewDoc: {
    type: String,
  },
  status: {
    required: true,
    type: String,
    enum: ['Draft', 'Submitted'],
    default: 'Draft',
  },

}, { timestamps: true });

module.exports = mongoose.model('review', reviewSchema);
