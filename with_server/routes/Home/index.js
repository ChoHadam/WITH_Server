const express = require('express');
const router = express.Router({mergeParams: true});
const utils = require('../../module/utils/utils');
const responseMessage = require('../../module/utils/responseMessage');
const statusCode = require('../../module/utils/statusCode');
const Home = require('../../model/home');
const authUtil = require('../../module/utils/authUtil');

require('dotenv').config();

// 국가 리스트 출력하기
router.get("/regions", async (req, res) => {
    const result = await Home.readRegion();

    if(result == -1) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.READ_REGION_LIST_FAIL));
        return;
    }

    res.status(statusCode.OK).send(utils.successTrue(statusCode.OK, responseMessage.READ_REGION_LIST_SUCCESS, result));
});

// 홈 배경이미지 출력하기 (랜덤 1개)
router.get("/bgImg", authUtil.validToken, async (req, res) => {
    const image = await Home.bgImage();

    if(image.length == 0) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.READ_HOME_BGIMG_FAIL));
        return;
    }

    let rand = Math.floor(Math.random() * image.length);
    const imgUrl = image[rand].imgUrl;
    const result = {imgUrl};

    res.status(statusCode.OK).send(utils.successTrue(statusCode.OK, responseMessage.READ_HOME_BGIMG_SUCCESS, result));    
});

router.get("/:regionCode", async (req, res) => {
    const regionCode = req.params.regionCode;

    const result = await Home.regionImage(regionCode);

    if(result.length == 0) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.READ_REGION_IMG_FAIL));
        return;
    }

    res.status(statusCode.OK).send(utils.successTrue(statusCode.OK, responseMessage.READ_REGION_IMG_SUCCESS, result[0]));
});


module.exports = router;
