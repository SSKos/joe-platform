/* eslint-disable no-useless-escape */
const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  createOrganisation,
  getOrganisation,
  getOrganisations,
  deleteOrganisation,
} = require('../controllers/organisations');

router.get('/:organsiationID', celebrate(
  {
    params: Joi.object().keys({
      organsiationID: Joi.string().length(24).required(),
    }),
  },
), getOrganisation);
router.get('/', getOrganisations);
router.post('/', celebrate(
  {
    body: Joi.object().keys({
      fullTitle: Joi.string().min(2).max(200),
      shortTitle: Joi.string().min(2).max(200),
      address: Joi.string().min(2).max(200),
      logo: Joi.string().pattern(/^http(s)?:\/\/(www\.)?[\w\-\.\_\~\:\/\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=]+$/).min(12),
    }),
  },
), createOrganisation);


router.delete('/:organsiationID', celebrate(
  {
    params: Joi.object().keys({
      organsiationID: Joi.string().length(24).required(),
    }),
  },
), deleteOrganisation);

module.exports = router;
