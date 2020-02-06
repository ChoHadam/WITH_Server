var express = require('express');
var router = express.Router({mergeParams: true});

router.use('/auth', require('./Auth'));
router.use('/board', require('./Board'));
router.use('/mypage', require('./Mypage'));
router.use('/home', require('./Home'));
router.use('/chat', require('./Chat'));

/* GET home page. */
router.get('/', function(req, res) {
    res.send('Welcome to the sweet WITH house ＼º▽º/')
})

module.exports = router;