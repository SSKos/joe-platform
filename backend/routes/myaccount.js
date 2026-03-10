/* eslint-disable no-useless-escape */
const router = require('express').Router();
const {
  getMyArticles,
  getMyArticle,
} = require('../controllers/myaccount');

router.get('/articles/:articleID', getMyArticle);
router.get('', getMyArticles);

module.exports = router;
