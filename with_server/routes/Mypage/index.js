const express = require('express');
const router = express.Router({mergeParams: true});
const utils = require('../../module/utils/utils');
const responseMessage = require('../../module/utils/responseMessage');
const statusCode = require('../../module/utils/statusCode');
const Mypage = require('../../model/myPage');
const authUtil = require('../../module/utils/authUtil');
const moment = require('moment');
const moment_timezone = require('moment-timezone');
const upload = require('../../config/multer');

// 마이페이지 조회
router.get("/",authUtil.validToken, async(req, res) => {
    const userIdx = req.decoded.userIdx;
    var badge;

    if(!userIdx)
    {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.EMPTY_TOKEN));
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

    // 뱃지 계산   
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

    // 클라이언트에서 필요없는 정보 제거
    delete result[0].likeNum;
    delete result[0].dislikeNum;
    
    res.status(statusCode.OK).send(utils.successTrue(responseMessage.MYPAGE_READ_SUCCESS, result[0]));
});

// 마이페이지 수정하기
var uploadImg = upload.fields([{name:'userImg', maxCount :1}, {name:'userBgImg', maxCount:1}]);
router.put("/", authUtil.validToken, uploadImg ,async(req, res) => {
    const userIdx = req.decoded.userIdx; 
    var interest1 = req.body.interest1;
    var interest2 = req.body.interest2;
    var interest3 = req.body.interest3;    

    if(!userIdx)
    {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.EMPTY_TOKEN));
        return;
    }

    if(req.files['userImg'])
        var userImg= req.files['userImg'][0].location;

    if(req.files['userBgImg'])
        var userBgImg = req.files['userBgImg'][0].location;
    
    var json = {userImg, userBgImg, interest1, interest2, interest3};

    // 인자가 하나도 없는 경우
    if(!json.userImg && !json.userBgImg)
    {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.NULL_VALUE));
        return;
    }
    const result = await Mypage.update(json, userIdx);
    
    // 쿼리 결과가 없는 경우
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
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.EMPTY_TOKEN));
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

// 동행 평가하기 - 좋아요
router.put("/like", authUtil.validToken, async(req, res) => {
    const userIdx = req.decoded.userIdx;
    const roomId = req.body.roomId;
    var otherIdx = '';

    if(!userIdx)
    {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.EMPTY_TOKEN));
        return;
    }

    if(!roomId)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.NULL_VALUE));
        return;
    }

    arr = roomId.split('_');
    for(var i =1;i< arr.length;i++ ){
        if(arr[i] != userIdx){
            otherIdx = arr[i];
            break;
        }
    }
    const result = await Mypage.like(otherIdx,roomId);

    if(result.length == 0)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.EVALUATE_FAIL));
        return;
    }    
    res.status(statusCode.OK).send(utils.successTrue(responseMessage.EVALUATE_SUCCESS));
});

// 동행 평가하기 - 싫어요
router.put("/dislike", authUtil.validToken, async(req, res) => {
    const userIdx = req.decoded.userIdx;
    const roomId = req.body.roomId;
    var otherIdx = '';

    if(!userIdx)
    {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.EMPTY_TOKEN));
        return;
    }

    if(!roomId) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.NULL_VALUE));
        return;
    }

    arr = roomId.split('_');   
    for(var i =1;i< arr.length;i++ ){
        if(arr[i] != userIdx){
            otherIdx = arr[i];
            break;
        }
    }    
    const result = await Mypage.dislike(otherIdx,roomId);

    if(result.length == 0)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.EVALUATE_FAIL));
        return;
    }    
    res.status(statusCode.OK).send(utils.successTrue(responseMessage.EVALUATE_SUCCESS));
});

// 동행 평가하지 않는 경우
router.put("/noEvaluation", authUtil.validToken, async(req, res) => {
    const userIdx = req.decoded.userIdx;
    const roomId = req.body.roomId;

    if(!userIdx)
    {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.EMPTY_TOKEN));
        return;
    }

    if(!roomId)
    {
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.NULL_VALUE));
    return;
    }

    const result = await Mypage.noEvaluation(userIdx, roomId);
    if(result.length == 0)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.EVALUATE_FAIL));
        return;
    }    
    res.status(statusCode.OK).send(utils.successTrue(responseMessage.EVALUATE_SUCCESS));
});

module.exports = router;