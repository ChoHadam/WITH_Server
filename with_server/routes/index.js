var express = require('express');
var router = express.Router();

/* GET home page. */
router.use('/auth', require('./Auth'));

module.exports = router;
