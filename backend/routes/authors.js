/* eslint-disable no-useless-escape */
/**
 * @swagger
 * tags:
 *   name: Authors
 *   description: Author (user) profile and search endpoints
 *
 * /authors/me:
 *   get:
 *     summary: Get the authenticated author's profile
 *     tags: [Authors]
 *     responses:
 *       200:
 *         description: Author profile object (includes articles, reviews, organisations)
 *       401:
 *         description: Not authenticated
 *   patch:
 *     summary: Update authenticated author's profile fields
 *     tags: [Authors]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               middleName: { type: string }
 *               familyName: { type: string }
 *               scientificDegree: { type: string }
 *               categories: { type: array, items: { type: string } }
 *     responses:
 *       200:
 *         description: Updated author object
 *       401:
 *         description: Not authenticated
 *
 * /authors/me/avatar:
 *   patch:
 *     summary: Update authenticated author's avatar URL
 *     tags: [Authors]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               avatar: { type: string, format: uri }
 *     responses:
 *       200:
 *         description: Updated author object
 *
 * /authors/email/{email}:
 *   get:
 *     summary: Look up an author by email address
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Author object (with organisations populated)
 *       404:
 *         description: Author not found
 *
 * /authors:
 *   get:
 *     summary: Get all authors (email and mobile fields excluded)
 *     tags: [Authors]
 *     security: []
 *     responses:
 *       200:
 *         description: Array of author objects
 */
const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const auth = require('../middlewares/auth');
const {
  getAuthors,
  getAuthor,
  getMe,
  getAuthorsByName,
  updateAuthor,
  updateAvatar,
  updateCredentials,
  getAuthorsByEmail,
} = require('../controllers/authors');

router.patch('/me/avatar', auth, celebrate(
  {
    body: Joi.object().keys({
      avatar: Joi.string().pattern(/^http(s)?:\/\/(www\.)?[\w\-\.\_\~\:\/\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=]+$/).min(12),
    }),
  },
), updateAvatar);

router.patch('/me/credentials', auth, celebrate(
  {
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(4),
    }),
  },
), updateCredentials);

router.get('/me', auth, getMe);
router.get('/searchAuthor', getAuthorsByName);
router.get('/email/:email', getAuthorsByEmail);

router.patch('/me', auth, celebrate(
  {
    body: Joi.object().keys({
      firstName: Joi.string().min(2).max(40),
      middleName: Joi.string().min(2).max(40),
      familyName: Joi.string().min(2).max(40),
      scientificDegree: Joi.string().min(2).max(20),
      title: Joi.string().min(2).max(10),
      organisations: Joi.string().min(2).max(200),
      categories: Joi.array().items(Joi.string()).required(),
    }),
  },
), updateAuthor);

router.get('/ID/:authorId', celebrate(
  {
    params: Joi.object().keys({
      authorId: Joi.string().required().length(24),
    }),
  },
), getAuthor);

router.get('/', getAuthors);

module.exports = router;
