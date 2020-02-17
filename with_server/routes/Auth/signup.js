var express = require('express');
const router = express.Router({mergeParams: true});
const crypto = require('crypto-promise');
const statusCode = require('../../module/utils/statusCode');
const responseMessage = require('../../module/utils/responseMessage');
const utils = require('../../module/utils/utils');
const upload = require('../../config/multer');
const User = require('../../model/user');

router.post('/',upload.single('img'), async (req, res) => {    
    //필수항목 안채웠으면 오류메세지 전송
    const {userId, password, name, birth, gender, interest1, interest2, interest3} = req.body;

    if(!userId || !password || !name || !birth || !gender){
        const missParameters = Object.entries({userId, password, name, birth, gender})
        .filter(it => it[1] == undefined).map(it => it[0]).join(',');
        res.status(statusCode.BAD_REQUEST)
        .send(utils.successFalse(responseMessage.X_NULL_VALUE(missParameters)));
        return;
    }
    //빈 항목이 없다면 그 아이디 중복되는지 확인
    console.log("들어와라");
    checkDup = await User.checkUser(userId);
    if(!checkDup.length==0)
    {
        res
        .status(statusCode.BAD_REQUEST)
        .send(utils.successFalse(responseMessage.ALREADY_ID));
        return;
    }
    //중복되는 아이디가 없다면 회원가입 시작 
    
    var userImg = req.file.location; //s3에 저장된 이미지 url
    console.log(userImg);    
    
    const buf = await crypto.randomBytes(32); //64비트의 salt값 생성
    const salt = buf.toString('hex'); //비트를 문자열로 바꿈
    const hashedPw = await crypto.pbkdf2(password.toString(),salt,1000,32,'SHA512'); //버퍼 형태로 리턴해주기 때문에 base64 방식으로 문자열
    const finalPw = hashedPw.toString('hex');    
    var json = {userId, finalPw, salt, name, birth, gender, userImg, interest1, interest2, interest3 };
    json.gender = Number(json.gender);
    result = User.signup(json);
    if(!result){
        res
        .status(statusCode.INTERNAL_SERVER_ERROR)
        .send(utils.successFalse(responseMessage.INTERNAL_SERVER_ERROR));
        return;
    }
    res
    .status(statusCode.OK)
    .send(utils.successTrue(responseMessage.SIGN_UP_SUCCESS)); 
});

module.exports = router;