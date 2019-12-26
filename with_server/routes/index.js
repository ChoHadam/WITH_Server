var express = require('express');
var router = express.Router({mergeParams: true});

/* GET home page. */
router.use('/auth', require('./Auth'));
router.use('/board', require('./Board'));

module.exports = router;