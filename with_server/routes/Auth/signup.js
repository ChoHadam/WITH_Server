var express = require('express');
const router = express.Router({mergeParams: true});
const crypto = require('crypto-promise');
const statusCode = require('../module/utils/statusCode');
const responseMessage = require('../module/utils/responseMessage');
const authUtil = require('../module/utils/utils');
const db = require('../module/db/pool');
const upload = require('../../config/multer');
const User = require('../../model/user');

router.post('/',upload.single('img'),async (req,res) =>{    
    const {userId, password, name, birth, gender} = req.body;
    //필수항목 안채웠으면 오류메세지 전송
    if(!userId || !password || name || name || birth || gender){
        res
        .status(statusCode.BAD_REQUEST)
        .send(authUtil.successFalse(responseMessage.NULL_VALUE));
        return;
    }
    //빈 항목이 없다면 그 아이디 중복되는지 확인
    const checkDup = await User.checkUser(userId);
    if(checkDup.length != 0)
    {
        res
        .status(statusCode.BAD_REQUEST)
        .send(authUtil.successFalse(responseMessage.ALREADY_ID));
        return;
    }
    //중복되는 아이디가 없다면 회원가입 시작
    if(req.file == null){ //사용자가 회원가입시 이미지 안넣으면 default이미지 넣어야됨
        var imgUrl = "default이미지 주소";
    }  else{
        var imgUrl = req.file.location; //s3에 저장된 이미지 url
    }

    const buf = await crypto.randomBytes(64); //64비트의 salt값 생성
    const salt = buf.toString('base64'); //비트를 문자열로 바꿈
    const hashedPw = await crypto.pbkdf2(password.toString(),salt,1000,64,'SHA512'); //버퍼 형태로 리턴해주기 때문에 base64 방식으로 문자열
    const finalPw = hashedPw.toString('base64');

    const json = {userId, finalPw, salt, name, birth, gender, imgUrl};
    result = await User.signup(json);
    if(!result){
        res
        .status(statusCode.INTERNAL_SERVER_ERROR)
        .send(authUtil.successFalse(responseMessage.INTERNAL_SERVER_ERROR));
        return;
    }
    res
    .status(statusCode.OK)
    .send(authUtil.successTrue(responseMessage.SIGN_UP_SUCCESS));//회원가입 성공하면 data뭐 반납해야됨??
});

module.exports = router;