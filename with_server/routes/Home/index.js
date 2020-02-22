const express = require('express');
const router = express.Router({mergeParams: true});
const utils = require('../../module/utils/utils');
const responseMessage = require('../../module/utils/responseMessage');
const statusCode = require('../../module/utils/statusCode');
const Home = require('../../model/home');
const authUtil = require('../../module/utils/authUtil');

require('dotenv').config();

// 국가 리스트 출력하기
router.get("/regions/:regionCode", async (req, res) => {
    const regionCode = req.params.regionCode;

    if(!regionCode)
    {
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

// 홈 배경이미지 출력하기 (랜덤 1개)
router.get("/bgImg", async (req, res) => {
    
    const result = await Home.bgImage();

    if(result.length == 0)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.READ_HOME_BGIMG_FAIL));
        return;
    }
    //console.log(process.env); // 잘나옴

    let rand = Math.floor(Math.random() * result.length);

    res.status(statusCode.OK).send(utils.successTrue(responseMessage.READ_HOME_BGIMG_SUCCESS, result[rand]));    
});


module.exports = router;
