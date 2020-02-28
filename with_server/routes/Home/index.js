const express = require('express');
const router = express.Router({mergeParams: true});
const utils = require('../../module/utils/utils');
const responseMessage = require('../../module/utils/responseMessage');
const statusCode = require('../../module/utils/statusCode');
const Home = require('../../model/home');
const authUtil = require('../../module/utils/authUtil');

require('dotenv').config();

// 국가 리스트 출력하기
router.get("/regions", authUtil.validToken, async (req, res) => {
    const result = await Home.readRegion();

    if(result.length == 0) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.READ_REGION_LIST_FAIL));
        return;
    }

    res.status(statusCode.OK).send(utils.successTrue(statusCode.OK, responseMessage.READ_REGION_LIST_SUCCESS, result));
});

// 홈 배경이미지 출력하기 (랜덤 1개)
router.get("/bgImg", authUtil.validToken, async (req, res) => {
    const {name} = req.decoded;

    if(!name) {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
        return;
      }  

    const image = await Home.bgImage();

    if(image.length == 0) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.READ_HOME_BGIMG_FAIL));
        return;
    }

    let rand = Math.floor(Math.random() * image.length);
    const imgUrl = image[rand].imgUrl;
    const result = {imgUrl, name};

    res.status(statusCode.OK).send(utils.successTrue(statusCode.OK, responseMessage.READ_HOME_BGIMG_SUCCESS, result));    
});


module.exports = router;
