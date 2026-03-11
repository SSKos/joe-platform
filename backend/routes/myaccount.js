/* eslint-disable no-useless-escape */
const router = require('express').Router();
const auth = require('../middlewares/auth');
const {
  getMyArticles,
  getMyArticle,
} = require('../controllers/myaccount');

router.get('/articles/:articleID', auth, getMyArticle);
router.get('', auth, getMyArticles);

module.exports = router;
