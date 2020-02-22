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
const crypto = require('crypto-promise');

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

/* 사용안함

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
*/
    
    res.status(statusCode.OK).send(utils.successTrue(responseMessage.MYPAGE_READ_SUCCESS, result[0]));
});

// 마이페이지 수정하기
router.put("/", authUtil.validToken, upload.single('userImg') ,async(req, res) => {
    const userIdx = req.decoded.userIdx; 
    var interest1 = req.body.interest1;
    var interest2 = req.body.interest2;
    var interest3 = req.body.interest3;    

    if(!userIdx)
    {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.EMPTY_TOKEN));
        return;
    }

    if(req.file)
        var userImg= req.file.location;

    var json = {userImg, interest1, interest2, interest3};

    // 인자가 하나도 없는 경우
    if(!json.userImg)
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


//유저 비밀번호 변경
router.put("/changePw", authUtil.validToken, async(req, res) => {
    const userIdx = req.decoded.userIdx;    
    console.log(userIdx);
    const {currPw, newPw} = req.body;
    
    if(!currPw || ! newPw){ //비어있는지 검사
        const missParameters = Object.entries({currPw, newPw})
        .filter(it => it[1] == undefined).map(it => it[0]).join(',');
        
        res
        .status(statusCode.BAD_REQUEST)
        .send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.X_NULL_VALUE(missParameters)));
        return;
    }

    const userResult = await Mypage.confirmUser(userIdx);
    
    if(userResult.length == 0) { //존재하지 않는 데이터
        res
        .status(statusCode.BAD_REQUEST)
        .send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.NO_USER));
        return;
    } else { //기존비밀번호랑 같은지 비교
        const salt = userResult[0].salt;      
        const hashedCurrPw = await crypto.pbkdf2(currPw.toString(),salt,1000,32,'sha512');
        const inputCurrPw = hashedCurrPw.toString('hex');
        
        if(inputCurrPw == userResult[0].password){ //기존 비번이랑 같다면 비번 변경

            const buf = await crypto.randomBytes(32); //64비트의 salt값 생성
            const salt = buf.toString('hex'); //비트를 문자열로 바꿈
            const hashedPw = await crypto.pbkdf2(newPw.toString(),salt,1000,32,'SHA512'); //버퍼 형태로 리턴해주기 때문에 base64 방식으로 문자열
            const finalPw = hashedPw.toString('hex'); 
            var json = {userIdx, finalPw, salt};

            result = Mypage.changePw(json);
            if(result.length == 0)
            {
                res
                .status(statusCode.INTERNAL_SERVER_ERROR)
                .send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR,responseMessage.NO_USER));
                return;
            }
            else
            {
                res
                .status(statusCode.OK)
                .send(utils.successTrue(statusCode.OK,responseMessage.PW_CHANGE_SUCCESS));
                return;
            }        
        } else { //기존 비번이랑 다르다면 비번 변경 실패
            res
            .status(statusCode.BAD_REQUEST)
            .send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.MISS_MATCH_PW));
            return;
        }
    }
});


module.exports = router;