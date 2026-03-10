/* eslint-disable no-useless-escape */
// TODO: add @swagger JSDoc annotations for revision endpoints
// Endpoints: GET /articles/:articleID/revisions, GET /:revisionID, GET /current,
//            POST / (create revision with file upload), PATCH /:revisionID (edit)
const router = require('express').Router({ mergeParams: true });
const { celebrate } = require('celebrate');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const {
  createRevision,
  editRevision,
  getRevision,
  getRevisions,
  getCurrentRevision,
} = require('../controllers/revisions');
const { upload, download } = require('../middlewares/fileloader');

router.get('/current', getCurrentRevision);

// console.log(download.req);

// const downloadFiles = download.req([
//   { name: 'supplements', maxCount: 10 },
// ]);

router.get('/:revisionID', getRevision);
router.get('/', getRevisions);

const uploadFiles = upload.fields([
  { name: 'articleDoc', maxCount: 1 },
  { name: 'supplements', maxCount: 1 },
]);

router.post('/',
  uploadFiles,
  celebrate(
    {
      params: Joi.object().keys({
        articleID: Joi.string().length(24).required(),
      }),
      body: Joi.object().keys({
        categories: Joi.array().items(Joi.string()).required(),
        authors: Joi.array()
          .items(
            Joi.object({
              author: Joi.string().required(),
              organisations: Joi.array().items(Joi.objectId()).required(),
            }),
          ),
        // organisations: Joi.array().items(Joi.string()).required(),
        articleTitle: Joi.string().min(5).required(),
        abstract: Joi.string().min(500).max(800).required(),
        articleType: Joi.string().min(2).max(30).required(),
        // fullText: Joi.string().min(1000).max(50000),
        articleDoc: Joi.string().min(10).max(60),
        // pdfID: Joi.string().min(2).max(30),
        supplements: Joi.string().min(10).max(60),
        ratingByAuthor: Joi.string().min(1).max(5).required(),
        conflictDisclosure: Joi.string().min(10).max(300).required(),
        authorsInput: Joi.string().min(15).max(300).required(),
        ethicStatement: Joi.string().min(10).max(300).required(),
        reviews: [Joi.objectId()],
        replyToReview: Joi.string().min(2),
      }),
    },
  ),
  createRevision);

router.patch('/:revisionID',
  uploadFiles,
  celebrate(
    {
      params: Joi.object().keys({
        articleID: Joi.string().length(24).required(),
        revisionID: Joi.string().length(24).required(),
      }),
      body: Joi.object().keys({
        categories: Joi.array().items(Joi.string()).required(),
        authors: Joi.array()
          .items(
            Joi.object({
              author: Joi.string().required(),
              organisations: Joi.array().items(Joi.objectId()).required(),
            }),
          ),
        // organisations: Joi.array().items(Joi.string()).required(),
        articleTitle: Joi.string().min(5).required(),
        abstract: Joi.string().min(500).max(800).required(),
        articleType: Joi.string().min(2).max(30).required(),
        // fullText: Joi.string().min(1000).max(50000),
        articleDoc: Joi.string().min(10).max(60),
        // pdfID: Joi.string().min(2).max(30),
        supplements: Joi.string().min(10).max(60),
        ratingByAuthor: Joi.string().min(1).max(5).required(),
        conflictDisclosure: Joi.string().min(10).max(300).required(),
        authorsInput: Joi.string().min(15).max(300).required(),
        ethicStatement: Joi.string().min(10).max(300).required(),
        reviews: [Joi.objectId()],
        replyToReview: Joi.string().min(2),
      }),
    },
  ),
  editRevision);

module.exports = router;
