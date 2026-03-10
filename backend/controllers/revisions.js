const path = require('path');
const fs = require('fs');
const Revision = require('../models/revision');
const Article = require('../models/article');
const errors = require('../errors/errors');
const { logger } = require('../middlewares/logger');

const createRevision = (req, res, next) => {
  logger.info('createRevision called', { articleID: req.params.articleID });
  const {
    categories,
    authors,
    articleTitle,
    abstract,
    articleType,
    ratingByAuthor,
    conflictDisclosure,
    authorsInput,
    ethicStatement,
    replyToReview,
  } = req.body;
  const articleDoc = req.files.articleDoc[0].path;
  let supplements = [];
  if (req.files.supplements) {
    supplements = req.files.supplements.map((file) => file.path);
  }
  const { articleID } = req.params;
  const submittingAuthorID = req.user._id;

  Article.findById(articleID)
    .populate('revisions')
    .then((article) => {
      if (!article) {
        throw new errors.WrongArticleError('No article found');
      }
      if (article.submittingAuthor.toString() !== submittingAuthorID) {
        throw new errors.NotAllowedUserError('You can edit article, if you are the submitting author, only');
      }
      if (article.state !== 'Submitting') {
        if (article.state !== 'WaitingAuthorReply') {
          throw new errors.CastErrorCode('You can create a revision only when you are submitting an article or preparing a reply to reviewers');
        }
      }
      const draftRevision = article.revisions.find(revision => revision.status === 'Draft');
      if (draftRevision) {
        throw new errors.CastErrorCode('Article already has a draft of revision. Continue editing');
      }
      return Revision.create({
        articleID,
        categories,
        authors,
        articleTitle,
        abstract,
        articleType,
        articleDoc,
        supplements,
        ratingByAuthor,
        conflictDisclosure,
        authorsInput,
        ethicStatement,
        replyToReview,
      })
        .then((revision) => {
          Article.findByIdAndUpdate(
            articleID.toString(),
            {
              $addToSet: { revisions: revision._id.toString() },
            },
            { new: true },
          )
            .then();
          return revision
        })
        .then((revision) => {
          res.status(200).send(revision);
        })
        .catch((err) => {
          if (err.name === 'CastError') {
            throw new errors.CastErrorCode('No article');
          }
          next(err);
        });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new errors.CastErrorCode('No article');
      }
      next(err);
    });
};

const editRevision = (req, res, next) => {
  const {
    categories,
    authors,
    affiliations,
    articleTitle,
    abstract,
    articleType,
    fullText,
    ratingByAuthor,
    conflictDisclosure,
    authorsInput,
    ethicStatement,
    replyToReview,
  } = req.body;
  const articleDoc = req.files.articleDoc[0].path;
  let supplements = [];
  if (req.files.supplements) {
    supplements = req.files.supplements.map((file) => file.path);
  }
  const { articleID, revisionID } = req.params;
  const submittingAuthorID = req.user._id;
  Article.findById(articleID)
    .then((article) => {
      if (!article) {
        throw new errors.WrongArticleError('No article found');
      }
      if (article.submittingAuthor.toString() !== submittingAuthorID) {
        throw new errors.NotAllowedUserError('You can edit article, if you are the submitting author, only');
      }
      if (article.state !== 'Submitting') {
        if (article.state !== 'Waiting Author Reply') {
          throw new errors.CastErrorCode('You can edit article only if you are still Submitting it or Waiting for Author Reply');
        }
      }
      Revision.findById(revisionID)
        .then((revision) => {
          if (revision.status === 'Submitted') {
            throw new errors.CastErrorCode('This revision has been submitter and can not be edited. Create new revision.');
          }
        })
        .catch((err) => {
          if (err.name === 'CastError') {
            throw new errors.CastErrorCode('No article');
          }
          next(err);
        });
      return Revision.findByIdAndUpdate(
        revisionID,
        {
          articleID,
          categories,
          authors,
          affiliations,
          articleTitle,
          abstract,
          articleType,
          fullText,
          articleDoc,
          supplements,
          ratingByAuthor,
          conflictDisclosure,
          authorsInput,
          ethicStatement,
          replyToReview,
        },
        { runValidators: true, new: true })
        .then((revision) => {
          Article.findByIdAndUpdate(
            articleID.toString(),
            {
              $addToSet: { revisions: revision._id.toString() },
            },
            { new: true },
          )
            .then();
          return revision
        })
        .then((revision) => {
          res.status(200).send(revision);
        })
        .catch((err) => {
          if (err.name === 'CastError') {
            throw new errors.CastErrorCode('No article');
          }
          next(err);
        });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new errors.CastErrorCode('No article');
      }
      next(err);
    });
};

const getRevision = (req, res, next) => {
  const { articleID } = req.params;
  const { revisionID } = req.params;
  Article.findById(articleID)
    .then((article) => {
      if (!article) {
        throw new errors.WrongArticleError('No article found');
      }
      Revision.findById(revisionID).populate({
        path: 'authors',
        populate: [
          { path: 'author', model: 'author' },
          { path: 'organisations', model: 'organisation' },
        ],
      })
        .then(async (revision) => {
          if (!revision) {
            throw new errors.WrongRevisionError('No revision found');
          }
          if (article.revisions.includes(revision._id.toString()) !== true) {
            throw new errors.CastErrorCode('This revision does not belong to this article.');
          }
          // Read the file's binary content
          const filePath = path.join(__dirname.slice(0, -12), revision.articleDoc);
          const fileContent = await fs.promises.readFile(filePath);

          // Include the file content in the response
          res.status(200).json({ revision, fileContent });

          // res.status(200).send(revision);
        })
        .catch((err) => {
          if (err.name === 'CastError') {
            throw new errors.CastErrorCode('Wrong revision ID format');
          }
          next(err);
        })
        .catch(next);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new errors.CastErrorCode('Wrong article ID format');
      }
      next(err);
    })
    .catch(next);
};

const getCurrentRevision = (req, res, next) => {
  const { articleID } = req.params;
  Article.findById(articleID)
    .then((article) => {
      if (!article) {
        throw new errors.WrongArticleError('No article found');
      }
      const currentRevision = article.revisions[article.revisions.length - 1];
      Revision.findById(currentRevision)
        .then((revision) => res.status(200).send(revision))
        .catch((err) => {
          if (err.name === 'CastError') {
            throw new errors.CastErrorCode('Something wrong with revision IDs of these article');
          }
          next(err);
        });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new errors.CastErrorCode('Wrong article ID format');
      }
      next(err);
    });
};

const getRevisions = (req, res, next) => {
  const { articleID } = req.params;
  Article.findById(articleID)
    .then((article) => {
      if (!article) {
        throw new errors.WrongArticleError('No article found');
      }
      const revisions = article.revisions;
      res.status(200).send(revisions);
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
  createRevision,
  getCurrentRevision,
  getRevision,
  getRevisions,
  editRevision,
};
