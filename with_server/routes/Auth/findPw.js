const express = require('express');
const router = express.Router({mergeParams: true});
const crypto = require('crypto-promise');
const statusCode = require('../../module/utils/statusCode');
const responseMessage = require('../../module/utils/responseMessage');
const utils = require('../../module/utils/utils');
const User = require('../../model/user');
var nodemailer = require('nodemailer');
require('dotenv').config();

router.put('/', async(req, res) => {
    const {userId, name, birth} = req.body;
    
    if(!userId || !name || !birth) { // 빈 항목이 있는 경우
        const missParameters = Object.entries({userId, name, birth})
        .filter(it => it[1] == undefined).map(it => it[0]).join(',');
        res.status(statusCode.BAD_REQUEST)
        .send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.X_NULL_VALUE(missParameters)));
        return;
    }

    const checkUser = await User.checkUser(userId);

    if(checkUser.length==0) { //존재하지 않는 유저
        res
        .status(statusCode.BAD_REQUEST)
        .send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.NO_USER));
        return;
    }

    if(checkUser[0].name != name || checkUser[0].birth != birth){ // 유저 정보가 일치하지 않는 경우
        res
        .status(statusCode.BAD_REQUEST)
        .send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.NO_USER));
        return;
    }

    var randomPw = createCode(10); //임시 비밀번호 발급 함수

    const buf = await crypto.randomBytes(32); 
    const salt = buf.toString('hex'); 
    const hashedPw = await crypto.pbkdf2(randomPw.toString(),salt,1000,32,'SHA512'); //버퍼 형태로 리턴해주기 때문에 base64 방식으로 문자열
    const tempPw = hashedPw.toString('hex');

    var json = {userId, tempPw, salt};
    result =  User.changePw(json);
    if(!result){
        res
        .status(statusCode.INTERNAL_SERVER_ERROR)
        .send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
        return;
    }
    res
    .status(statusCode.OK)
    .send(utils.successTrue(statusCode.OK, responseMessage.PW_CHANGE_SUCCESS, null));


    let transporter = nodemailer.createTransport({ // 메일 전송 계정 정보
        service: process.env.E_MAIL_SERVICE,
        host: process.env.E_MAIL_HOST,
        port: process.env.E_MAIL_PORT,
        auth: {
          user: process.env.E_MAIL_ID,  // 계정 아이디
          pass: process.env.E_MAIL_PW // 계정 비밀번호
        }
    });
    
    let mailOptions = { 
        from: process.env.E_MAIL_ID,    // 발송 메일 주소
        to: userId,    // 수신 메일 주소
        subject: `WiTH에서 ${name}님께 임시 비밀번호를 발급하였습니다.`, 
        html : `<p font-size : 7px align='center' style='color: dimgray;'>${name}님의 임시 비밀번호 입니다. 로그인 후 비밀번호를 변경해주세요.</p><div align='center' style='border:1px solid white; background-color: indigo; font-family:verdana'><p style='color: white;'><strong>임시 비밀번호 : ${randomPw}<strong></p></div> `
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.FIND_PW_FAIL));
        console.log(error);
        return;
        }
        else {
            res.status(statusCode.OK).send(utils.successTrue(statusCode.OK, responseMessage.FIND_PW_SUCCESS, null));
        }
    });
});

function createCode(length){ //임시 비밀번호 발급 함수
    var arr = "0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z".split(",");
    var randomStr = "";

    for(var j=0; j<length; j++){
        randomStr += arr[Math.floor(Math.random()*arr.length)]
    }

    return randomStr
};


module.exports = router;
