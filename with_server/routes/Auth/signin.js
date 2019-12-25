var express = require('express');
var router =  express.Router();
const crypto = require('crypto-promise');
const statusCode = require('../module/utils/statusCode');
const responseMessage = require('../module/utils/responseMessage');
const authUtil = require('../module/utils/utils');
const db = require('../module/db/pool');
const upload = require('../../config/multer');
const User = require('../../model/user');

router.post('/', async(req, res) => {
    const {userId, password} = req.body;
    if(!userId || !password){
        res
        .status(statusCode.BAD_REQUEST)
        .send(authUtil.successFalse(responseMessage.NULL_VALUE));
        return;
    }
    const userResult = await User.checkUser(userId);
    if(userResult.length == 0) {
        res
        .status(statusCode.OK)
        .send(authUtil.successFalse(responseMessage.NO_USER));
        return;
    }
    const salt = userResult.salt;
    const hashedEnterPw = await crypto.pbkdf2(password.toString(),salt,1000,64,'SHA512');
    if(hashedEnterPw.toString('base64') == userResult.password){
       // const tokens = 
    }


});