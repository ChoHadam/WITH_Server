var express = require('express');
var router =  express.Router({mergeParams: true});
const crypto = require('crypto-promise');
const statusCode = require('../../module/utils/statusCode');
const responseMessage = require('../../module/utils/responseMessage');
const utils = require('../../module/utils/utils');
const User = require('../../model/user');
const authUtil = require('../../module/utils/authUtil');
const jwtUtils= require('../../module/utils/jwt');
const moment = require('moment');
const moment_timezone = require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

router.post('/renew', authUtil.validRefreshToken, async(req, res) => {
    const {userIdx, name} = req.decoded;
    const userResult = await User.returnUser(userIdx);

    if(userResult.length == 0) { //존재하지 않는 데이터
        res
        .status(statusCode.BAD_REQUEST)
        .send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.NO_USER));
        return;
    }
    else {
        const name = userResult[0].name;
        const gender = userResult[0].gender;

        const user = {userIdx, name, gender};
        const result = jwtUtils.renew(user);

        const currentTime = moment();
        const tempTime = moment(currentTime, "YY.MM.DD").add(1, 'days');
        const date = tempTime.format('YY.MM.DD');
        const time = tempTime.format('HH:mm');
        const expireTime = date + ' ' + time;
        const accessToken = result.accessToken;
        const refreshToken = req.headers.token;

        
        if(!accessToken){ //토큰 생성 못함
            res
            .status(statusCode.INTERNAL_SERVER_ERROR)
            .send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.EMPTY_TOKEN));
            return;
        } else{   //토큰 생성
            const finalResult = {accessToken, refreshToken, expireTime, userIdx, name};
            res
            .status(statusCode.OK)
            .send(utils.successTrue(statusCode.OK, responseMessage.RENEW_TOKEN_SUCCESS, finalResult));
        }
    }
});

router.post('/', async(req, res) => {
    const {userId, password} = req.body;
    
    if(!userId || !password){ //비어있는지 검사
        const missParameters = Object.entries({userId, password})
        .filter(it => it[1] == undefined).map(it => it[0]).join(',');
        
        res
        .status(statusCode.BAD_REQUEST)
        .send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.X_NULL_VALUE(missParameters)));
        return;
    }

    const userResult = await User.checkUser(userId);
    
    if(userResult.length == 0) { //존재하지 않는 데이터
        res
        .status(statusCode.BAD_REQUEST)
        .send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.NO_USER));
        return;
    } else {
        const salt = userResult[0].salt;      
        const hashedEnterPw = await crypto.pbkdf2(password.toString(),salt,1000,32,'sha512');
        const inputPw = hashedEnterPw.toString('hex');
        
        if(inputPw == userResult[0].password){
            const result = jwtUtils.sign(userResult[0]);
            const currentTime = moment();
            const tempTime = moment(currentTime, "YY.MM.DD").add(1, 'days');
            const date = tempTime.format('YY.MM.DD');
            const time = tempTime.format('HH:mm');
            const expireTime = date + ' ' + time;
            const accessToken  = result.accessToken;
            const refreshToken = result.refreshToken;
            const userIdx = userResult[0].userIdx;
            const name  = userResult[0].name;
            
            if(!accessToken || !refreshToken){ //토큰 생성 못함
                res
                .status(statusCode.INTERNAL_SERVER_ERROR)
                .send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.EMPTY_TOKEN));
                return;
            } else{   //토큰 생성
                const finalResult = {accessToken, refreshToken, expireTime, userIdx, name};
                res
                .status(statusCode.OK)
                .send(utils.successTrue(statusCode.OK, responseMessage.SIGN_IN_SUCCESS,finalResult));                
            }
        } else { //비밀번호 불일지, 로그인 실패
            res
            .status(statusCode.BAD_REQUEST)
            .send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.MISS_MATCH_PW));
            return;
        }
    }
});

module.exports = router;
