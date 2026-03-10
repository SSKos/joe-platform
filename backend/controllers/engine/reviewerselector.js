const Author = require('../../models/author');
const Article = require('../../models/article');
const Revision = require('../../models/revision');
const errors = require('../../errors/errors');

const selectReviewer = (req, res, next) => {
  const { articleID } = req.params;
  const submittingAuthorID = req.user._id;
  Article.findById(articleID)
    .then((article) => {
      if (!article) {
        throw new error.WrongArticleError('No article found');
      }
      if (article.submittingAuthor.toString() !== submittingAuthorID) {
        throw new errors.NotAllowedUserError('You can request reviewers for your own article only.');
      }
      if (article.state !== 'Submitted') {
          throw new errors.CastErrorCode('You can request reviewers only if the article is submitted');
      };
      // Determine users which can not be reviewers of the current article.
      // 1-st - already selected reviewers:
      const authorsToExclude = new Set([]);
      const currentReviewers = article.reviewers;
      for (item of currentReviewers) { authorsToExclude.add(item.reviewer.toString()) };
      // Find current revisions and their categories and authors
      const revisionIDs = article.revisions;
      Revision.find({ _id: { $in: revisionIDs } })
        .then((revisions) => {
          if (!revisions || revisions === []) {
            throw new errors.NotFoundError('You do not have a revision to review');
          }
          const categories = new Set([]);
          for (const rev of revisions) {
            for (const i of rev.categories) { categories.add(i) };
            for (const i of rev.authors) { authorsToExclude.add(i.author.toString()) };
          };
          const categoriesToSearch = Array.from(categories);
          // search for potential reviewers among authors with the same expertise (categories)
          Author.find({ categories: { $in: categoriesToSearch } })
            .then((reviewers) => {
              if (!reviewers) {
                throw new errors.CastErrorCode('Smth wrong with reviewers search');
              }
              if (reviewers === []) {
                throw new errors.NotFoundError('There are no reviewers for this topic');
              }
              // Filter them out form the list of the possible reviewers
              const reviewersList = reviewers.filter((each) => {
                return !authorsToExclude.has(each._id.toString());
              });
              if (reviewersList.length === 0) {
                throw new errors.CastErrorCode('Reviewers were not found');
              }
              const randomReviewerNumber = Math.floor(Math.random() * reviewersList.length);
              const newReviewer = reviewersList[randomReviewerNumber]._id;
              Author.findByIdAndUpdate(
                newReviewer.toString(),
                {
                  $addToSet: {
                    reviewRequests: {
                      articleID,
                      status: 'requestedReview',
                    },
                  },
                },
                { runValidators: true },
              )
                .then()
                .catch((err) => {
                  next(err);
                })
                .catch(next);
              Article.findByIdAndUpdate(
                articleID.toString(),
                {
                  $addToSet: {
                    reviewers: {
                      reviewer: newReviewer,
                      status: 'requestedReview',
                    },
                  },
                },
                { runValidators: true, new: true },
              )
                .then((article) => {
                  if (!article) {
                    throw new errors.NotFoundError('Article not found');
                  }
                  return res.status(200).send(article);
                })
                .catch((err) => {
                  next(err);
                })
                .catch(next);
            })
            .catch((err) => {
              if (err.name === 'CastError') {
                throw new errors.CastErrorCode('Something wrong with reviewer search');
              }
              next(err);
            })
            .catch(next);
        })
        .catch(next);
    })
    .catch(next);
};

module.exports = {
  selectReviewer,
};
