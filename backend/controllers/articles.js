const Article = require('../models/article');
const Author = require('../models/author');
const Revision = require('../models/revision');
const errors = require('../errors/errors');
const { logger } = require('../middlewares/logger');

const createArticle = (req, res, next) => {
  logger.info('createArticle called', { userID: req.user._id });
  const submittingAuthor = req.user._id;
  return Article.create({
    submittingAuthor
  })
    .then((article) => {
      logger.info('Article created', { submittingAuthor, articleID: article._id });
      Author.findByIdAndUpdate(
        submittingAuthor,
        { $addToSet: { articles: article._id } },
        { new: true },
      )
        .then();
      return article;
    })
    .then((article) => {
      res.status(200).send(article);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new errors.ValidationErrorCode(`Validation error ${err.message}`);
      }
    })
    .catch(next);
};

const getArticle = (req, res, next) => {
  const { articleID } = req.params;
  // const authorID = req.user._id;
  Article.find({ state: 'Published', articleID })
    .then((article) => {
      if (!article) {
        throw new errors.WrongArticleError('No article found');
      }
      // if (article.status !== "Published" && article.submittingAuthor.toString() !== authorID) {
      //   throw new errors.WrongArticleError('The article is not published. Only a submitting author can access to unpublished articles');
      // }
      res.status(200).send(article);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new errors.CastErrorCode('Wrong article ID format');
      }
      next(err);
    })
    .catch(next);
};

const getArticles = (req, res, next) => {
  Article.find({ "state": "Published" }).populate('revisions')
    .then((articles) => res.status(200).send(articles))
    .catch(next);
};

const getAbstracts = (req, res, next) => {
  Article.find({ "state": "Published" }).populate({
    path: 'revisions',
    populate: ({
      path: 'authors',
      populate: [
        { path: 'author', model: 'author' },
        { path: 'organisations', model: 'organisation' },
      ],
    }),
  })

    .then((articles) => {
      let abstracts = {};
      abstracts = articles.map((article) => {
        const finalRevision = article.revisions[article.revisions.length - 1];
        return (
          {
            articleType: finalRevision.articleType,
            articleTitle: finalRevision.articleTitle,
            articlePublicationDate: article.publicationDateTime,
            articleID: article._id,
            revisionID: finalRevision._id,
            categories: finalRevision.categories,
            authors: finalRevision.authors,
            abstractText: finalRevision.abstract,
            likes: article.likes,
          }
        )
      });
      return abstracts
    })
    .then((abstracts) => res.status(200).send(abstracts))
    .catch(next);
};

const submitArticle = (req, res, next) => {
  const { articleID } = req.params;
  const submittingAuthorID = req.user._id;
  Article.findById(articleID).populate('reviewers')
    .then((article) => {
      if (!article) {
        throw new errors.WrongArticleError('Wrong article ID');
      }
      if (article.submittingAuthor.toString() !== submittingAuthorID) {
        throw new errors.NotAllowedUserError('You can submit article, if you are the submitting author only');
      }
      if (article.state === ('Submitted')) {
        throw new errors.CastErrorCode('You have already  submitted the article.');
      };
      revisionIDs = article.revisions;
      Revision.updateMany(
        { _id: { $in: revisionIDs } },
        { $set: { "status": 'Submitted' } },
      )
        .then()
        .catch((err) => {
          next(err);
        })
        .catch(next);
      return Article.articleSubmit(articleID)
        .then((article) => res.status(200).send(article))
        .catch((err) => {
          next(err);
        })
        .catch(next);
    })
    .catch((err) => {
      next(err);
    })
    .catch(next);
};

const publishArticle = (req, res, next) => {
  const { articleID } = req.params;
  const submittingAuthorID = req.user._id;
  Article.findById(articleID)
    .then((article) => {
      if (!article) {
        throw new errors.WrongArticleError('Wrong article ID');
      }
      if (article.submittingAuthor.toString() !== submittingAuthorID) {
        throw new errors.NotAllowedUserError('Only submitting author can publish accepted article');
      }
      if (article.state !== ('Accepted')) {
        throw new errors.CastErrorCode('You can publish only accepted articles.');
      };
      return Article.articlePublish(articleID)
        .then((article) => res.status(200).send(article))
        .catch((err) => {
          next(err);
        })
        .catch(next);
    })
    .catch((err) => {
      next(err);
    })
    .catch(next);
};

// const putLikeOnArticle = (req, res, next) => Article.findByIdAndUpdate(
//   req.params.articleId,
//   { $addToSet: { likes: req.user._id } },
//   { new: true },
// )
//   .then((article) => {
//     if (article) {
//       return res.status(200).send(article);
//     }
//     throw new errors.NotFoundError('Article not found');
//   })
//   .catch((err) => {
//     if (err.name === 'CastError') {
//       throw new errors.CastErrorCode('Article ID error');
//     }
//     next(err);
//   })
//   .catch(next);

// const deleteLikeOnArticle = (req, res, next) => Article.findByIdAndUpdate(
//   req.params.articleId,
//   { $pull: { likes: req.user._id } },
//   { new: true },
// )
//   .then((article) => {
//     if (article) {
//       return res.status(200).send(article);
//     }
//     throw new errors.NotFoundError('Article not found');
//   })
//   .catch((err) => {
//     if (err.name === 'CastError') {
//       throw new errors.CastErrorCode('Article ID error');
//     }
//     next(err);
//   })
//   .catch(next);

module.exports = {
  createArticle,
  getArticle,
  getArticles,
  getAbstracts,
  submitArticle,
  publishArticle,
  // putLikeOnArticle,
  // deleteLikeOnArticle,
};
