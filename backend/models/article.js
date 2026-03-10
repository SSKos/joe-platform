const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({

  submittingAuthor: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'author',
  },

  state: {
    required: true,
    type: String,
    enum: ['Submitting', 'Submitted', 'SuggestedForReview', 'UnderReview', 'WaitingAuthorReply', 'Accepted', 'Published', 'Rejected', 'Revoked'],
    default: 'Submitting',
  },

  revisions: [{
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'revision',
  }],

  reviewers: [{
    updatedAt: {
      required: true,
      type: Date,
      default: Date.now(),
    },
    reviewer: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: 'author',
    },
    status: {
      required: true,
      type: String,
      enum: ['requestedReview', 'underReview', 'reviewed', 'declinedReview', 'expiredReview'],
    },
    rating: {
      type: Number,
    },
    decision: {
      type: String,
      enum: ['Accept', 'Revise', 'Decline'],
    },
  }],

  submittanceDateTime: { type: Date },

  decisionDateTime: { type: Date }, // looks like it's not used

  publicationDateTime: { type: Date },

  likes: [{
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'author',
  }],

}, { timestamps: true });

articleSchema.statics.articleSubmit = function (articleID) {
  return this.findByIdAndUpdate(
    articleID,
    {
      // $unset: {
      //   'reviewers.$[elem].decision': 1,
      // },
      $set: {
        state: 'Submitted',
        'reviewers.$[elem].status': 'requestedReview',
        'reviewers.$[elem].decision': '',
        $min: { submittanceDateTime: Date.now() },
      },
    },
    {
      arrayFilters: [{ 'elem.status': 'reviewed' }],
      new: true,
    },
  )
    .then((article) => { return article });
};

articleSchema.statics.articlePublish = function (articleID) {
  return this.findByIdAndUpdate(
    articleID,
    {
      state: 'Published',
      $min: { publicationDateTime: Date.now() },
    },
    { new: true },
  )
    .then((article) => { return article });
};

module.exports = mongoose.model('article', articleSchema);
