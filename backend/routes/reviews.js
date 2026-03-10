/* eslint-disable no-useless-escape */
/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Peer review submission and retrieval
 *
 * /articles/{articleID}/revisions/{revisionID}/reviews:
 *   get:
 *     summary: Get all reviews for a specific revision
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: articleID
 *         required: true
 *         schema: { type: string, minLength: 24, maxLength: 24 }
 *       - in: path
 *         name: revisionID
 *         required: true
 *         schema: { type: string, minLength: 24, maxLength: 24 }
 *     responses:
 *       200:
 *         description: Array of review objects for the revision
 *       404:
 *         description: Article or revision not found
 *   post:
 *     summary: Submit a peer review (authenticated, assigned reviewer only)
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: articleID
 *         required: true
 *         schema: { type: string, minLength: 24, maxLength: 24 }
 *       - in: path
 *         name: revisionID
 *         required: true
 *         schema: { type: string, minLength: 24, maxLength: 24 }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               reviewText: { type: string, minLength: 5 }
 *               rating: { type: number }
 *               decision:
 *                 type: string
 *                 enum: [Accept, Revise, Decline]
 *               reviewDoc:
 *                 type: string
 *                 format: binary
 *                 description: Optional review document file
 *     responses:
 *       200:
 *         description: Created review object
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not an assigned reviewer or review already submitted
 *
 * # TODO: add swagger annotations to routes/revisions.js, routes/organisations.js, routes/myaccount.js
 */
const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getReviews,
  createReview,
} = require('../controllers/reviews');
const { upload } = require('../middlewares/fileloader');

const uploadFiles = upload.fields([
  { name: 'reviewDoc', maxCount: 1 },
]);

// router.delete('/:articleId', celebrate(
//   {
//     params: Joi.object().keys({
//       articleId: Joi.string().length(24).required(),
//     }),
//   },
// ), deleteArticle);

router.get('/', getReviews);
router.post('/',
  uploadFiles,
  celebrate(
    {
      body: Joi.object().keys({
        reviewText: Joi.string().min(5),
        rating: Joi.number(),
        decision: Joi.string().min(2),
        reviewDoc: Joi.string().min(10).max(60),
      }),
    },
  ),
  createReview);

module.exports = router;
