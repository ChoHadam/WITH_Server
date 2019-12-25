const express = require('express');
const router = express.Router({mergeParams: true});

const utils = require('../../module/utils/utils');
const responseMessage = require('../../module/utils/responseMessage');
const statusCode = require('../../module/utils/statusCode');

const Mypage = require('../../model/myPage');

// 마이페이지 보기
router.get("/:userIdx", async(req, res, next) => {
    Mypage.loadInfo(req.params.userIdx).then(({
        code,
        json
    }) => {
        res.status(code).send(json);
    })
    .catch(err => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.MYPAGE_READ_FAIL));
    });
});

// 마이페이지 수정하기
router.put("/:userIdx", async(req, res, next) => {
    Mypage.update(req.body, req.params.userIdx).then(({
        code,
        json
    }) => {
        res.status(code).send(json);
    })
    .catch(err => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.MYPAGE_UPDATE_FAIL));
    });
});

// 내가 쓴 게시글 전체 보기
router.get("/:userIdx", async (req, res, next) => {
    Mypage.readAll(req.params.userIdx).then(({
        code,
        json
    }) => {
    res.status(code).send(json);
    })
    .catch(err => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_READ_FAIL));
    });
});

// 내가 쓴 게시글 하나 보기
router.get("/:bltIdx", async(req, res, next) => {
    Mypage.read(req.params.bltIdx).then(({
        code,
        json
    }) => {
        res.status(code).send(json);
    })
    .catch(err => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_READ_FAIL));
    });
});

module.exports = router;