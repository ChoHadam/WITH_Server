var express = require('express');
var router =  express.Router();
const crypto = require('crypto-promise');
const statusCode = require('../../module/utils/statusCode');
const responseMessage = require('../../module/utils/responseMessage');
const utils = require('../../module/utils/utils');
const User = require('../../model/user');
const jwtUtils= require('../../module/utils/jwt')

router.post('/', async(req, res) => {
    const {userId, password} = req.body;
    if(!userId || !password){ //
        res
        .status(statusCode.BAD_REQUEST)
        .send(utils.successFalse(responseMessage.NULL_VALUE));
        return;
    }
    const userResult = await User.checkUser(userId);
    if(userResult.length == 0) {
        res
        .status(statusCode.OK)
        .send(utils.successFalse(responseMessage.NO_USER));
        return;
    }
    const salt = userResult.salt;
    const hashedEnterPw = await crypto.pbkdf2(password.toString(),salt,1000,64,'SHA512');
    if(hashedEnterPw.toString('base64') == userResult.password){
        const result = jwtUtils.sign(userResult);
        if(!result){
            res
            .status(statusCode.OK)
            .send(utils.successFalse(responseMessage.EMPTY_TOKEN));
        } else{
            res
            .status(statusCode.OK)
            .send(utils.successTrue(responseMessage.SIGN_IN_SUCCESS,result.token));
        }   
    }
    else{ //비밀번호 불일지, 로그인 실패
        res
            .status(statusCode.OK)
            .send(utils.successFalse(responseMessage.SIGN_IN_FAIL));
    }


});