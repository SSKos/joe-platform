const Article = require('../models/article');
const errors = require('../errors/errors');
const { logger } = require('../middlewares/logger');

const getMyArticles = (req, res, next) => {
  const authorID = req.user._id;
  Article.find({ "submittingAuthor": authorID }).populate('revisions')
    .then((articles) => {
      if (!articles) {
        throw new errors.WrongArticleError('No article found');
      }
      // if (articles.submittingAuthor.toString() !== authorID) {
      //   throw new errors.WrongArticleError('You can view only your articles from your cabinet.')
      // }
      res.status(200).send(articles);
    })
    .catch((err) => {
      logger.error('getMyArticles error', { error: err.message });
      if (err.name === 'CastError') {
        throw new errors.CastErrorCode('Wrong article ID format');
      }
      next(err);
    })
    .catch(next);
};

const getMyArticle = (req, res, next) => {
  const { articleID } = req.params;
  logger.info('getMyArticle called', { articleID });
  const authorID = req.user._id;
  Article.find({ _id: articleID }).populate('revisions')
    .then((article) => {
      if (!article) {
        throw new errors.WrongArticleError('No article found');
      }
      if (article[0].submittingAuthor.toString() !== authorID) {
        throw new errors.WrongArticleError('You can view only your articles from your cabinet.')
      }
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

module.exports = {
  getMyArticles,
  getMyArticle,
};
