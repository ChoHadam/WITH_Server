const express = require('express');
const router = express.Router({mergeParams: true});
const utils = require('../../module/utils/utils');
const responseMessage = require('../../module/utils/responseMessage');
const statusCode = require('../../module/utils/statusCode');
const Home = require('../../model/home');

// 추천 동행지 보여주기
router.get("/recommendations/:regionCode", async (req, res) => {
    const regionCode = req.params.regionCode;
    
    if(!regionCode)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.OUT_OF_VALUE));
        return;
    }
    const result = await Home.recommend(regionCode);
    if(result.length == 0)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.RECOMMEND_UPDATE_FAIL));
        return;
    }
    res.status(statusCode.OK).send(utils.successTrue(responseMessage.RECOMMEND_READ_SUCCESS, result));
});

// 위드 메이트 보여주기
router.get("/mates/:userIdx/", async (req, res) => {
    const userIdx = req.params.userIdx;
    if(!userIdx)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.OUT_OF_VALUE));
        return;
    }

    user_arr = userIdx.split('+');
    var result = [];
    for ( var i in user_arr ) {
        let user_list = await Home.readMate(user_arr[i]);
        result.push(user_list);
    }
    
    if(result.length == 0)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.MATE_READ_FAIL));
        return;
    }

    res.status(statusCode.OK).send(utils.successTrue(responseMessage.MATE_READ_SUCCESS, result));
});

router.get("/boards/:boardIdx", async (req, res) => {
    const boardIdx = req.params.boardIdx;
    if(!boardIdx)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.OUT_OF_VALUE));
        return;
    }

    board_arr = boardIdx.split('+');
    var result = [];
    for ( var i in board_arr ) {
        let board_list = await Home.readBoard(board_arr[i]);
        result.push(board_list);
    }
    if(result.length == 0)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.MATE_READ_FAIL));
        return;
    }

    res.status(statusCode.OK).send(utils.successTrue(responseMessage.MATE_READ_SUCCESS, result));
});

router.get("/regions", async (req, res) => {
    const result = await Home.readAllRegion();

    if(result.length == 0)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.MATE_READ_FAIL));
        return;
    }

    res.status(statusCode.OK).send(utils.successTrue(responseMessage.MATE_READ_SUCCESS, result));
});

module.exports = router;
