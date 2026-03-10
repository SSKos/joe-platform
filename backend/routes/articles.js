/* eslint-disable no-useless-escape */
/**
 * @swagger
 * tags:
 *   name: Articles
 *   description: Manuscript submission and publication endpoints
 *
 * /articles:
 *   get:
 *     summary: Get published article abstracts
 *     tags: [Articles]
 *     security: []
 *     responses:
 *       200:
 *         description: Array of published article abstracts
 *
 * /articles/create:
 *   post:
 *     summary: Create a new article record (authenticated)
 *     tags: [Articles]
 *     responses:
 *       200:
 *         description: Newly created article object
 *       401:
 *         description: Not authenticated
 *
 * /articles/{articleID}:
 *   get:
 *     summary: Get a single published article
 *     tags: [Articles]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: articleID
 *         required: true
 *         schema: { type: string, minLength: 24, maxLength: 24 }
 *     responses:
 *       200:
 *         description: Article object
 *       404:
 *         description: Article not found
 *
 * /articles/{articleID}/submit:
 *   post:
 *     summary: Submit article for editorial desk review (authenticated)
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: articleID
 *         required: true
 *         schema: { type: string, minLength: 24, maxLength: 24 }
 *     responses:
 *       200:
 *         description: Updated article object
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not the submitting author
 *
 * /articles/{articleID}/publish:
 *   post:
 *     summary: Publish an accepted article (authenticated)
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: articleID
 *         required: true
 *         schema: { type: string, minLength: 24, maxLength: 24 }
 *     responses:
 *       200:
 *         description: Published article object
 *       403:
 *         description: Article not accepted or not authorized
 */
const router = require('express').Router();
const revisions = require('./revisions');
const reviews = require('./reviews');
const auth = require('../middlewares/auth');
const { celebrate, Joi } = require('celebrate');
const {
  createArticle,
  getArticle,
  getArticles,
  getAbstracts,
  submitArticle,
  publishArticle,
} = require('../controllers/articles');
const { selectReviewer } = require('../controllers/engine/reviewerselector');

router.use('/:articleID/revisions/:revisionID/reviews', reviews);
router.use('/:articleID/revisions', revisions);

router.post('/create', auth, createArticle);
router.post('/:articleID/submit', auth, celebrate(
  {
    params: Joi.object().keys({
      articleID: Joi.string().length(24).required(),
    }),
  },
), submitArticle);
router.post('/:articleID/publish', auth, celebrate(
  {
    params: Joi.object().keys({
      articleID: Joi.string().length(24).required(),
    }),
  },
), publishArticle);
router.post('/:articleID/selectReviewer', auth, celebrate(
  {
    body: Joi.object().keys({
      articleID: Joi.string().length(24).required(),
    }),
  },
), selectReviewer);
router.get('/:articleID', celebrate(
  {
    params: Joi.object().keys({
      articleID: Joi.string().length(24).required(),
    }),
  },
), getArticle);
router.get('/', getAbstracts);

module.exports = router;

// router.put('/:articleId/revisions', celebrate(
//   {
//     body: Joi.object().keys({
//       articleRevision: Joi.string().length(24).required(),
//     }),
//   },
// ), addArticleRevision);

// router.put('/:articleId/likes', celebrate(
//   {
//     params: Joi.object().keys({
//       articleId: Joi.string().length(24).required(),
//     }),
//   },
// ), putLikeOnArticle);

// router.delete('/:articleId/likes', celebrate(
//   {
//     params: Joi.object().keys({
//       articleId: Joi.string().length(24).required(),
//     }),
//   },
// ), deleteLikeOnArticle);

// router.delete('/:articleId', celebrate(
//   {
//     params: Joi.object().keys({
//       articleId: Joi.string().length(24).required(),
//     }),
//   },
// ), deleteArticle);

// celebrate(
//   {
//     body: Joi.object().keys({
//       // name: Joi.string().min(2).max(30),
//       // link: Joi.string().pattern(/^http(s)?:\/\/(www\.)?[\w\-\.\_\~\:\/\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=]+$/).min(12),
//       // articleRevisionID: Joi.string().min(2).max(30),
//       // submitDate: Joi.string().min(2).max(30),
//       // reviewID: Joi.string().min(2).max(30),
//       // publicationDateTime: Joi.string().min(2).max(30),
//       // preImageLink: Joi.string().min(2).max(30),
//       // articleTitle: Joi.string().min(2).max(30),
//       // authors: Joi.string().min(2).max(30),
//       // affiliations: Joi.string().min(2).max(30),
//       // abstract: Joi.string().min(2).max(30),
//       // fullText: Joi.string().min(2).max(30),
//       // fullLink: Joi.string().min(2).max(30),
//       // winDocID: Joi.string().min(2).max(30),
//       // pdfID: Joi.string().min(2).max(30),
//       // supplements: Joi.string().min(2).max(30),
//       // ethicStatement: Joi.string().min(2).max(30),
//       // conflictDisclosure: Joi.string().min(2).max(30),
//       // authorsInput: Joi.string().min(2).max(30),
//       // articleType: Joi.string().min(2).max(30),
//       // ratingByAuthor: Joi.string().min(2).max(30),
//       // categories: Joi.string().min(2).max(30),
//       // keyWords: Joi.string().min(2).max(30),
//       // state: Joi.string().min(2).max(30),
//       // lastStatusDateTime: Joi.string().min(2).max(30),
//       // likeCount: Joi.string().min(2).max(30),
//     }),
//   },
// ),
