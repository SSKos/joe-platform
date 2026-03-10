const Review = require('../models/review');
const Article = require('../models/article');
const Author = require('../models/author');
const Revision = require('../models/revision');
const errors = require('../errors/errors');
const { logger } = require('../middlewares/logger');

const createReview = (req, res, next) => {
  const {
    reviewText,
    rating,
    decision,
  } = req.body;
  const { articleID, revisionID } = req.params;
  const reviewerID = req.user._id;
  let reviewDoc = '';
  if (req.files.reviewDoc) { reviewDoc = req.files.reviewDoc[0].path; }
  Promise.all([
    // Check that reviewer is allowed to edit review this article
    Article.findById(articleID).populate('revisions'),
    Author.findById(reviewerID),
    Review.findOne({ revisionID, reviewerID }),
  ])
    .then(([article, reviewer, review]) => {
      if (review) {
        throw new errors.WrongArticleError('You have already written review for this article. Thank you!');
      }
      if (!article) {
        throw new errors.WrongArticleError('Wrong article ID.');
      }
      if (article.revisions[article.revisions.length - 1]._id.toString() !== revisionID) {
        throw new errors.WrongRevisionError('This is not the latest revision of the article.');
      }
      if (article.state !== 'Submitted') {
        throw new errors.CastErrorCode('You can submit review only for the article under review.');
      }
      let articleReviewer = false;
      article.reviewers.forEach((i) => {
        if (i.reviewer.toString() === reviewerID) { articleReviewer = true }
      });
      if (!articleReviewer) {
        throw new errors.NotAllowedUserError('You can submit review only if you are the suggested reviewer of the article.');
      }
      let reviewerAllowed = false;
      reviewer.reviewRequests.forEach((i) => {
        if (i.articleID.toString() === articleID && i.status === 'requestedReview') {
          reviewerAllowed = true;
        }
      });
      if (!reviewerAllowed) {
        throw new errors.NotAllowedUserError('Your are not allowed to review this article now. You have probably written review already.');
      }
      const articleReviewers = [];
      const expiredReviewers = [];
      article.reviewers.forEach((i) => {
        if ((i.status === 'requestedReview' || i.status === 'underReview') && (Date.now() - i.updatedAt) / 1000 / 60 / 60 / 24 > 7) {
          expiredReviewers.push(i.reviewer.toString());
        } else {
          if (i.reviewer.toString() !== reviewerID) { articleReviewers.push(i); }
        }
      });
      let articleState = article.state;
      // If this review is from the only reviewer
      if (articleReviewers.length === 0) { articleState = 'Submitted'; logger.info('Review: 1 reviewer, status Submitted', { articleID }); }
      // If there are 2 active reviewers
      if (articleReviewers.length === 1) {
        let acceptCount = 0;
        let declineCount = 0;
        let reviseCount = 0;
        if (decision === 'Accept') { acceptCount = 1; }
        if (decision === 'Decline') { declineCount = 1; }
        if (decision === 'Revise') { reviseCount = 1; }
        articleReviewers.forEach((i) => {
          if (i.decision === 'Accept') { acceptCount += 1; }
          if (i.decision === 'Decline') { declineCount += 1; }
          if (i.decision === 'Revise') { reviseCount += 1; }
        });
        if (acceptCount === 2) { articleState = 'Accepted'; }
        if (declineCount === 2) { articleState = 'Declined'; }
        if (acceptCount === 1 && declineCount === 1) { articleState = 'Submitted'; }
        if (reviseCount === 2 || (reviseCount === 1 && (acceptCount === 1 || declineCount === 1))) { articleState = 'WaitingAuthorReply'; }
        logger.info('Review: 2 reviewers', { articleID, articleState });
      }
      // If there are 3 active reviewers (allowed only if previously 1 Accept and 1 Decline)
      if (articleReviewers.length === 2) {
        if (decision === 'Accept') { articleState = 'Accepted'; }
        if (decision === 'Decline') { articleState = 'Declined'; }
        if (decision === 'Revise') { articleState = 'WaitingAuthorReply'; }
        logger.info('Review: 3 reviewers', { articleID, articleState });
      }

      return Review.create({
        revisionID,
        reviewerID,
        reviewText,
        rating,
        decision,
        reviewDoc,
      })
        .then((review) => {
          Promise.all([
            Revision.findByIdAndUpdate(
              revisionID,
              { $addToSet: { reviews: review._id.toString() } },
            ),
            Article.findByIdAndUpdate(
              articleID,
              {
                $set: {
                  'state': articleState,
                  'reviewers.$[elem].status': 'reviewed',
                  'reviewers.$[elem].updatedAt': Date.now(),
                  'reviewers.$[elem].rating': rating,
                  'reviewers.$[elem].decision': decision,
                },
              },
              { arrayFilters: [{ 'elem.reviewer': reviewerID }] },
            ),
            Author.findByIdAndUpdate(
              reviewerID,
              {
                $addToSet: { reviews: review._id.toString() },
                // $set: { 'reviewRequests.$[elem].status': 'reviewed' },
              },
              {
                arrayFilters: [{ 'elem.articleID': articleID }],
                new: true,
              },
            ),
          ])
            .then(res.status(200).send(review))
            .catch(next);
        })
        .catch((err) => {
          if (err.name === 'ValidationError') {
            throw new errors.ValidationErrorCode(`Validation error ${err.message}`);
          }
        })
        .catch(next);
    })
    .catch(next);
};

// const editReview = (req, res, next) => {
//   const {
//     reviewText,
//     rating,
//     decision,
//   } = req.body;
//   const { articleID, revisionID } = req.params;
//   const reviewerID = req.user._id;
//   let reviewDoc = '';
//   if (req.file) { reviewDoc = req.file.filename; }

//   Promise.all([
//     // Check that reviewer is allowed to edit review of this article
//     Article.findById(articleID),
//     Author.findById(reviewerID),
//   ])
//     .then(([article, reviewer]) => {
//       if (!article) {
//         throw new errors.WrongArticleError('Wrong article ID.');
//       }
//       if (article.revisions[article.revisions.length - 1].toString() !== revisionID) {
//         throw new errors.WrongRevisionError('This is not the latest revision of the article.');
//       }
//       if (article.state !== 'Submitted') {
//         throw new errors.CastErrorCode('You can submit review only for the article under review.');
//       }
//       let articleReviewer = false;
//       article.reviewers.forEach((i) => {
//         if (i.reviewer.toString() === reviewerID) { articleReviewer = true }
//       });
//       if (!articleReviewer) {
//         throw new errors.NotAllowedUserError('You can submit review only if you are the suggested reviewer of the article.');
//       }
//       let reviewerAllowed = false;
//       reviewer.reviewRequests.forEach((i) => {
//         if (i.articleID.toString() === articleID && i.status === 'requestedReview') {
//           reviewerAllowed = true;
//         }
//       });
//       if (!reviewerAllowed) {
//         throw new errors.NotAllowedUserError('Your are not allowed to review this article now. You have probably written review already.');
//       }
//       const articleReviewers = [];
//       const expiredReviewers = [];
//       article.reviewers.forEach((i) => {
//         if ((i.status === 'requestedReview' || i.status === 'underReview') && (Date.now() - i.updatedAt) / 1000 / 60 / 60 / 24 > 14) {
//           expiredReviewers.push(i.reviewer.toString());
//         } else {
//           if (i.reviewer.toString() !== reviewerID) { articleReviewers.push(i); }
//         }
//       });
//       let articleState = article.state;
//       // If this review is from the only reviewer
//       if (articleReviewers.length === 0) { articleState = 'Submitted'; console.log('1 reviewer, status Submitted') }
//       // If there are 2 active reviewers
//       if (articleReviewers.length === 1) {
//         let acceptCount = 0;
//         let declineCount = 0;
//         let reviseCount = 0;
//         if (decision === 'Accept') { acceptCount = 1; }
//         if (decision === 'Decline') { declineCount = 1; }
//         if (decision === 'Revise') { reviseCount = 1; }
//         articleReviewers.forEach((i) => {
//           if (i.decision === 'Accept') { acceptCount += 1; }
//           if (i.decision === 'Decline') { declineCount += 1; }
//           if (i.decision === 'Revise') { reviseCount += 1; }
//         });
//         if (acceptCount === 2) { articleState = 'Accepted'; }
//         if (declineCount === 2) { articleState = 'Declined'; }
//         if (acceptCount === 1 && declineCount === 1) { articleState = 'Submitted'; }
//         if (reviseCount === 2 || (reviseCount === 1 && (acceptCount === 1 || declineCount === 1))) { articleState = 'WaitingAuthorReply'; }
//         console.log('2 reviewers, status: ', articleState)
//       }
//       // If there are 3 active reviewers (allowed ony if previously 1 Accept and 1 Decline)
//       if (articleReviewers.length === 2) {
//         if (decision === 'Accept') { articleState = 'Accepted'; }
//         if (decision === 'Decline') { articleState = 'Declined'; }
//         if (decision === 'Revise') { articleState = 'WaitingAuthorReply'; }
//         console.log('3 reviewers, status: ', articleState)
//       }

//       return Review.create({
//         revisionID,
//         reviewerID,
//         reviewText,
//         rating,
//         decision,
//         reviewDoc,
//       })
//         .then((review) => {
//           Promise.all([
//             Revision.findByIdAndUpdate(
//               revisionID,
//               { $addToSet: { reviews: review._id.toString() } },
//             ),
//             Article.findByIdAndUpdate(
//               articleID,
//               {
//                 $set: {
//                   'state': articleState,
//                   'reviewers.$[elem].status': 'reviewed',
//                   'reviewers.$[elem].updatedAt': Date.now(),
//                   'reviewers.$[elem].rating': rating,
//                   'reviewers.$[elem].decision': decision,
//                 },
//               },
//               { arrayFilters: [{ 'elem.reviewer': reviewerID }] },
//             ),
//             Author.findByIdAndUpdate(
//               reviewerID,
//               {
//                 $addToSet: { reviews: review._id.toString() },
//                 // $set: { 'reviewRequests.$[elem].status': 'reviewed' },
//               },
//               {
//                 arrayFilters: [{ 'elem.articleID': articleID }],
//                 new: true,
//               },
//             ),
//           ])
//             .then(res.status(200).send(review))
//             .catch(next);
//         })
//         .catch((err) => {
//           if (err.name === 'ValidationError') {
//             throw new errors.ValidationErrorCode(`Validation error ${err.message}`);
//           }
//         })
//         .catch(next);
//     })
//     .catch(next);
// };

const getReviews = (req, res, next) => {
  const { articleID, revisionID } = req.params;
  Article.findById(articleID)
    .then((article) => {
      if (!article) {
        throw new errors.WrongArticleError('Wrong article ID');
      }
      if (article.revisions.includes(revisionID) !== true) {
        throw new errors.CastErrorCode('You are trying to view Reviews of the Revision which does not match the Article ID');
      }
      Revision.findById(revisionID)
        .then((revision) => {
          if (!revision) {
            throw new errors.WrongRevisionError('Wrong revision ID');
          };
          res.status(200).send(revision.reviews);
        })
        .catch((err) => {
          if (err.name === 'ValidationError') {
            throw new errors.ValidationErrorCode(`Validation error ${err.message}`);
          }
        })
        .catch(next);
    });
};

module.exports = {
  createReview,
  // editReview,
  getReviews,
};
