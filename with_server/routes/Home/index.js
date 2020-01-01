const express = require('express');
const router = express.Router({mergeParams: true});
const utils = require('../../module/utils/utils');
const responseMessage = require('../../module/utils/responseMessage');
const statusCode = require('../../module/utils/statusCode');
const Home = require('../../model/home');
const authUtil = require('../../module/utils/authUtil');

// 추천 동행지 보여주기
router.get("/recommendations/:regionCode", async (req, res) => {
    const regionCode = req.params.regionCode;
    
    if(!regionCode)
    {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.NULL_VALUE));
        return;
    }
    const result = await Home.recommend(regionCode);
    if(result.length == 0)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.RECOMMEND_READ_FAIL));
        return;
    }
    res.status(statusCode.OK).send(utils.successTrue(responseMessage.RECOMMEND_READ_SUCCESS, result));
});

// 위드 메이트 보여주기
router.get("/mates", authUtil.validToken, async (req, res) => {
    const userIdx = req.decoded.userIdx;
    if(!userIdx)
    {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.NULL_VALUE));
        return;
    }
    const result = await Home.readMate(userIdx);
    if(result.length == 0)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.MATE_READ_FAIL));
        return;
    }

    res.status(statusCode.OK).send(utils.successTrue(responseMessage.MATE_READ_SUCCESS, result));
});

//최근 본 계시물 보기
router.get("/boards/:boardIdx", async (req, res) => {
    const boardIdx = req.params.boardIdx;
    if(!boardIdx)
    {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.NULL_VALUE));
        return;
    }

    board_arr = boardIdx.split('+');
    var result = [];
    for ( var i in board_arr ) {
        var board_list = await Home.readBoard(board_arr[i]);
        result.push(board_list[0]);
    }
    if(result.length == 0)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_READ_ALL_FAIL));
        return;
    }

    res.status(statusCode.OK).send(utils.successTrue(responseMessage.BOARD_READ_ALL_SUCCESS, result));
});

//국가 리스트 뿌려주기
router.get("/regions/:regionCode", async (req, res) => {
    const regionCode = req.params.regionCode;

    if(!regionCode){
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.NULL_VALUE));
        return;
    }

    const result = await Home.readRegion(regionCode);

    if(result.length == 0)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.READ_REGION_LIST_FAIL));
        return;
    }

    res.status(statusCode.OK).send(utils.successTrue(responseMessage.READ_REGION_LIST_SUCCESS, result));
});

//홈 배경이미지 랜덤으로 1개 보내주기
router.get("/bgImg", async (req, res) => {
    
    const result = await Home.bgImage();

    if(result.length == 0)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.READ_HOME_BGIMG_FAIL));
        return;
    }
    //console.log(result.length);
    let rand = Math.floor(Math.random() * result.length) + 1;
    //console.log(rand);

    res.status(statusCode.OK).send(utils.successTrue(responseMessage.READ_HOME_BGIMG_SUCCESS, result[rand]));
});
module.exports = router;
