const express = require('express');
const router = express.Router({mergeParams: true});
const utils = require('../../module/utils/utils');
const responseMessage = require('../../module/utils/responseMessage');
const statusCode = require('../../module/utils/statusCode');
const Home = require('../../model/home');

// 추천 동행지 보여주기
router.get("/:userIdx", async (req, res) => {
    const userIdx = req.params.userIdx;
    
    if(!userIdx)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.OUT_OF_VALUE));
        return;
    }

    const result = await Home.recommend(userIdx);
    
    
    if(result.length == 0)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.RECOMMEND_UPDATE_FAIL));
        return;
    }
    res.status(statusCode.OK).send(utils.successTrue(responseMessage.RECOMMEND_READ_SUCCESS, result));
});

// 위드 메이트 보여주기
router.get("/:userIdx/readMate", async (req, res) => {
    const userIdx = req.params.userIdx;
    
    if(!userIdx)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.OUT_OF_VALUE));
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

module.exports = router;
