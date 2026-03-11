/* eslint-disable no-useless-escape */
const router = require('express').Router({ mergeParams: true });
const { celebrate } = require('celebrate');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const auth = require('../middlewares/auth');
const {
  createRevision,
  editRevision,
  getRevision,
  getRevisions,
  getCurrentRevision,
} = require('../controllers/revisions');
const { upload } = require('../middlewares/fileloader');

router.get('/current', getCurrentRevision);
router.get('/:revisionID', getRevision);
router.get('/', getRevisions);

const uploadFiles = upload.fields([
  { name: 'articleDoc', maxCount: 1 },
  { name: 'supplements', maxCount: 1 },
]);

router.post('/',
  auth,
  uploadFiles,
  createRevision);

router.patch('/:revisionID',
  auth,
  uploadFiles,
  celebrate({
    params: Joi.object().keys({
      articleID: Joi.string().length(24).required(),
      revisionID: Joi.string().length(24).required(),
    }),
    body: Joi.object().keys({
      categories: Joi.array().items(Joi.string()),
      authors: Joi.array().items(
        Joi.object({
          author: Joi.string().required(),
          organisations: Joi.array().items(Joi.objectId()),
        }),
      ),
      articleTitle: Joi.string().min(5).required(),
      abstract: Joi.string().min(10).max(5000).required(),
      articleType: Joi.string().min(2).max(50).required(),
      articleDocUrl: Joi.string().max(500).allow(''),
      ratingByAuthor: Joi.alternatives().try(Joi.number(), Joi.string()).required(),
      conflictDisclosure: Joi.string().min(3).max(1000).required(),
      authorsInput: Joi.string().min(3).max(1000).required(),
      ethicStatement: Joi.string().min(3).max(1000).required(),
      reviews: Joi.array().items(Joi.objectId()),
      replyToReview: Joi.string().min(2),
    }),
  }),
  editRevision);

module.exports = router;
