const express = require('express');
const router = express.Router({mergeParams: true});

router.use('/signup', require('./signup'));
router.use('/signin', require('./signin'));
router.use('/lookaround', require('./lookaround'));
router.use('/findPw', require('./findPw'));

module.exports = router;