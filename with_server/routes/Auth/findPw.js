const express = require('express');
const router = express.Router({mergeParams: true});
const crypto = require('crypto-promise');
var nodemailer = require('nodemailer');
var smtpPool = require('nodemailer-smtp-pool');
var mailConfig = require('../../config/mailConfig')

const statusCode = require('../../module/utils/statusCode');
const responseMessage = require('../../module/utils/responseMessage');
const utils = require('../../module/utils/utils');
const jwtUtils= require('../../module/utils/jwt');
const User = require('../../model/user');
//var smtpTransport = require('nodemailer-smtp-transport');


router.put('/', async(req, res) => {
    const {userId, name, birth} = req.body;
    console.log(userId);
    
    if(!userId || !name || !birth) {
        const missParameters = Object.entries({userId, name, birth})
        .filter(it => it[1] == undefined).map(it => it[0]).join(',');
        res.status(statusCode.BAD_REQUEST)
        .send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.X_NULL_VALUE(missParameters)));
        return;
    }

    const checkUser = await User.checkUser(userId);
    console.log(checkUser);

    if(checkUser.length==0) { //존재하지 않는 유저
        res
        .status(statusCode.BAD_REQUEST)
        .send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.NO_USER));
        return;
    }

    if(checkUser[0].name != name || checkUser[0].birth != birth){
        res
        .status(statusCode.BAD_REQUEST)
        .send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.NO_USER));
        return;
    }

    var arr = "0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z".split(",");
    var randomPw = createCode(arr, 10);

    const buf = await crypto.randomBytes(32); //64비트의 salt값 생성
    const salt = buf.toString('hex'); //비트를 문자열로 바꿈
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

    var transporter = nodemailer.createTransport({
            //service : mailConfig.mailService,
            port : mailConfig.port,
            host : mailConfig.host,
            //secure : true,
            auth: {
                //type: "OAuth2",
                user : mailConfig.maiId,
                pass : mailConfig.mailPw,
                //accessToken : "" 
            }
            /*
            tls: {
                rejectUnauthorize: false
            },
            maxConnections: 5,
            maxMessages: 10
            */
    });

    let mailOptions = {
        from: mailConfig.maiId,// 발송 메일 주소
        to: userId,// 수신 메일 주소
        subject: "임시 비밀번호 안내", // 제목
        text: "계정의 임시 비밀번호는 000 입니다."
        //html: `<p>${userId} 계정의 임시 비밀번호는 <strong>${randomPw}<strong>입니다.</p>` // html body
    };

    transporter.sendMail(mailOptions, function(err, res){
        if(err){
            console.log(err);
        }else{
            return res.status(200).json({ success: true });
        }
        transporter.close();
    });
});

function createCode(objArr, length){
    var arr = objArr;
    var randomStr = "";

    for(var j=0; j<length; j++){
        randomStr += arr[Math.floor(Math.random()*arr.length)]
    }

    return randomStr
};


module.exports = router;
