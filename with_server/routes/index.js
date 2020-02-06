var express = require('express');
var router = express.Router({mergeParams: true});

router.use('/auth', require('./Auth'));
router.use('/board', require('./Board'));
router.use('/mypage', require('./Mypage'));
router.use('/home', require('./Home'));
router.use('/chat', require('./Chat'));

/* GET home page. */
router.get('/', function(req, res) {
    res.send('Welcome to the sweet WITH house ＼º▽º/<br><br><br>- with Fam : 환희 미정 은별 루희 남수 준 승준 민준 연주 하담<br>- contact us : mjun09@naver.com');
})

module.exports = router;