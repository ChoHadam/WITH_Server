var express = require('express');
var router = express.Router({mergeParams: true});

/* GET home page. */
router.use('/auth', require('./Auth'));
router.use('/board', require('./Board'));
router.use('/mypage', require('./Mypage'));
router.use('/home', require('./Home'));

module.exports = router;