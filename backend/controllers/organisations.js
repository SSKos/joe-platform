const Organisation = require('../models/organisation');
const errors = require('../errors/errors');
const { logger } = require('../middlewares/logger');

const createOrganisation = (req, res, next) => {
  const {
    fullTitle,
    shortTitle,
    address,
    logo,
  } = req.body;
  logger.info('createOrganisation called', { fullTitle });
  Organisation.findOne({ fullTitle })
    .then((organisation) => {
      if (organisation) {
        return res.status(200).send(organisation);
      }
      return Organisation.create({
        fullTitle,
        shortTitle,
        address,
        logo,
      })
        .then((organisation) => {
          res.status(200).send(organisation);
        })
        .catch((err) => {
          if (err.name === 'ValidationError') {
            throw new errors.ValidationErrorCode(`Validation error ${err.message}`);
          }
        })
        .catch(next);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new errors.CastErrorCode('WTF');
      }
      next(err);
    });
};

const getOrganisation = (req, res, next) => {
  const { organisationID } = req.params;
  Organisation.findById(organisationID)
    .then((organisation) => {
      if (!organisation) {
        throw new errors.WrongArticleError('No organisation found');
      }
      res.status(200).send(organisation);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new errors.CastErrorCode('Wrong article ID format');
      }
      next(err);
    })
    .catch(next);
};

const getOrganisations = (req, res, next) => {
  Organisation.find({})
    .then((organisation) => res.status(200).send(organisation))
    .catch(next);
};

const deleteOrganisation = (req, res, next) => {
  Organisation.findById(req.params.organisationID)
    .then((organisation) => {
      if (!organisation) {
        throw new errors.NotFoundError('Organisation not found');
      }
      // if (organisation.owner.toString() !== req.user._id) {
      // throw new errors.NotAllowedUserError('You are not allowed to delete organisations.');
      // }
      Organisation.findByIdAndDelete(organisation._id)
        // eslint-disable-next-line no-shadow
        .then((organisation) => res.status(200).send(organisation));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new errors.CastErrorCode('Organisation ID error');
      }
      next(err);
    })
    .catch(next);
};

module.exports = {
  createOrganisation, getOrganisation, getOrganisations, deleteOrganisation,
};
