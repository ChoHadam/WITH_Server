var express = require('express');
var router =  express.Router({mergeParams: true});
const crypto = require('crypto-promise');
const statusCode = require('../../module/utils/statusCode');
const responseMessage = require('../../module/utils/responseMessage');
const utils = require('../../module/utils/utils');
const User = require('../../model/user');
const jwtUtils= require('../../module/utils/jwt')

router.post('/', async(req, res) => {
    const {userId, password} = req.body;   

    if(!userId || !password){ //비어있는지 검사
        const missParameters = Object.entries({userId, password})
        .filter(it => it[1] == undefined).map(it => it[0]).join(',');
        
        res
        .status(statusCode.NO_CONTENT)
        .send(utils.successFalse(responseMessage.X_NULL_VALUE(missParameters)));
        return;
    }

    const userResult = await User.checkUser(userId);
    if(userResult.length == 0) { //존재하지 않는 데이터
        res
        .status(statusCode.BAD_REQUEST)
        .send(utils.successFalse(responseMessage.NO_USER));
        return;
    } else {
        const salt = userResult[0].salt;      
        const hashedEnterPw = await crypto.pbkdf2(password.toString(),salt,1000,32,'sha512');
        const inputPw = hashedEnterPw.toString('hex');
        console.log(inputPw);
        if(inputPw == userResult[0].password){
            const result = jwtUtils.sign(userResult[0]);
            const token  = result.token;
            const userIdx = userResult[0].userIdx;
            
            if(!token){ //토큰 생성 못함
                res
                .status(statusCode.INTERNAL_SERVER_ERROR)
                .send(utils.successFalse(responseMessage.EMPTY_TOKEN));
                return;
            } else{   //토큰 생성
                const finalResult = {token, userIdx};
                res
                .status(statusCode.OK)
                .send(utils.successTrue(responseMessage.SIGN_IN_SUCCESS,finalResult));                
            }   
        } else { //비밀번호 불일지, 로그인 실패
            res
            .status(statusCode.BAD_REQUEST)
            .send(utils.successFalse(responseMessage.SIGN_IN_FAIL));
            return;
    }
    }
    
});

module.exports = router;
