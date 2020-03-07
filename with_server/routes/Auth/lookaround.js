var express = require('express');
var router =  express.Router({mergeParams: true});
const statusCode = require('../../module/utils/statusCode');
const responseMessage = require('../../module/utils/responseMessage');
const utils = require('../../module/utils/utils');
const jwtUtils= require('../../module/utils/jwt')

const tempUser = {
    userIdx: 0,
    //userId: 'Guest',
    //password: 'Guest',
    //salt: 'Guest',
    name: 'Guest',
    gender: 0
}

router.post('/', async(req, res) => {
    const result = jwtUtils.sign(tempUser);
    const accessToken  = result.accessToken;
    const userIdx = tempUser.userIdx;
    const name  = tempUser.name;

    if(!accessToken){ //토큰 생성 못함
        res
        .status(statusCode.INTERNAL_SERVER_ERROR)
        .send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.LOOK_AROUND_FAIL));
        return;
    } else{   //토큰 생성
        const finalResult = {accessToken, userIdx, name};
        res
        .status(statusCode.OK)
        .send(utils.successTrue(statusCode.OK, responseMessage.LOOK_AROUND_SUCCESS,finalResult));                
    }
});

module.exports = router;