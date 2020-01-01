const express = require('express');
const router = express.Router({mergeParams: true});
const utils = require('../../module/utils/utils');
const responseMessage = require('../../module/utils/responseMessage');
const statusCode = require('../../module/utils/statusCode');
const Mypage = require('../../model/myPage');
const authUtil = require('../../module/utils/authUtil');

// 마이페이지 보기
router.get("/",authUtil.validToken, async(req, res) => {
    const userIdx = req.decoded.userIdx;
    var badge;

    if(!userIdx)
    {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.NULL_VALUE));
        return;
    }

    const result = await Mypage.readProfile(userIdx);
    
    if(result.length == 0)
    {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.NO_USER));
        return;
    }

    // birth field 값 나이로 변환하여 반환.
    const birthYear = result[0].birth.split("-");
    const currentYear = moment().format('YYYY');
    const age = currentYear - birthYear[0] + 1;

    result[0].birth = age;

    //뱃지 계산   
    const prop = (result[0].likeNum / (result[0].likeNum + result[0].dislikeNum)) * 100;
    
    if(parseInt(prop)>=70 && parseInt(prop)<80 ){
        badge = 1;
    }else if(parseInt(prop)>=80 && parseInt(prop)<90 ){
        badge = 2;
    }else if(parseInt(prop)>=90 && parseInt(prop)<=100 ){
        badge = 3;
    }else{
        badge = 0;
    }

    result[0].badge = badge;   

    res.status(statusCode.OK).send(utils.successTrue(responseMessage.MYPAGE_READ_SUCCESS, result[0]));
});

// 마이페이지 수정하기
router.put("/",authUtil.validToken ,async(req, res) => {
    const userIdx = req.decoded.userIdx;

    if(!userIdx)
    {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.NULL_VALUE));
        return;
    }
    

    const result = await Mypage.update(req.body, userIdx);
    
    if(result.length == 0)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.MYPAGE_UPDATE_FAIL));
        return;
    }
    
    res.status(statusCode.OK).send(utils.successTrue(responseMessage.MYPAGE_UPDATE_SUCCESS));

});
// 내가 쓴 게시글 전체 보기
router.get("/boards", authUtil.validToken,async (req, res) => {
    const userIdx = req.decoded.userIdx;
    
    if(!userIdx)
    {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.NULL_VALUE));
        return;
    }

    const result = await Mypage.readAll(userIdx);
    
    if(result.length == 0)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_READ_ALL_FAIL));
        return;
    }    

    res.status(statusCode.OK).send(utils.successTrue(responseMessage.BOARD_READ_ALL_SUCCESS, result));
});


// 동행 평가하기 - 좋아요+1
router.put("/like", authUtil.validToken, async(req, res) => {
    const userIdx = req.decoded.userIdx;

    if(!userIdx)
    {
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.OUT_OF_VALUE));
    }

    const result = await Mypage.like(userIdx);

    res.status(statusCode.OK).send(utils.successTrue(responseMessage.EVALUATE_SUCCESS));
});

// 동행 평가하기 - 싫어요+1
router.put("/dislike", authUtil.validToken, async(req, res) => {
    const userIdx = req.decoded.userIdx;

    if(!userIdx)
    {
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.OUT_OF_VALUE));
    return;
    }
    const result = await Mypage.dislike(userIdx);
    res.status(statusCode.OK).send(utils.successTrue(responseMessage.EVALUATE_SUCCESS));
});



module.exports = router;