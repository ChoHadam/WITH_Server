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
const upload_auth = require('../../config/multer_auth');
const crypto = require('crypto-promise');
const nodemailer = require('nodemailer');
require('dotenv').config();

// 마이페이지 조회
router.get("/",authUtil.validToken, async(req, res) => {
    const userIdx = req.decoded.userIdx;
    const gender = req.decoded.gender;

    if(gender == 0) {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.LOOK_AROUND_TOKEN));
        return;
    }

    if(!userIdx) {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.EMPTY_TOKEN));
        return;
    }

    const result = await Mypage.readProfile(userIdx);
    
    if(result.length == 0) {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.NO_USER));
        return;
    }
    
    res.status(statusCode.OK).send(utils.successTrue(statusCode.OK, responseMessage.MYPAGE_READ_SUCCESS, result[0]));
});

// 마이페이지 수정
router.put("/", authUtil.validToken, upload.single('userImg') ,async(req, res) => {
    const userIdx = req.decoded.userIdx; 
    const gender = req.decoded.gender;
    var interest = req.body.interest;

    if(gender == 0){
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.LOOK_AROUND_TOKEN));
        return;
    }    
    if(!userIdx)
    {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.EMPTY_TOKEN));
        return;
    }

    if(req.file)
        var userImg= req.file.location;

    var json = {userImg, interest};

    // 인자가 하나도 없는 경우
    if(!json.userImg && !interest)
    {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
        return;
    }
    const result = await Mypage.update(json, userIdx);
    
    // 쿼리 결과가 없는 경우
    if(result.length == 0)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.MYPAGE_UPDATE_FAIL));
        return;
    }
    
    res.status(statusCode.OK).send(utils.successTrue(statusCode.OK, responseMessage.MYPAGE_UPDATE_SUCCESS));
});

// 내가 쓴 게시글 전체 보기
router.get("/boards", authUtil.validToken,async (req, res) => {
    const userIdx = req.decoded.userIdx;
    const gender = req.decoded.gender;

    if(gender == 0){
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.LOOK_AROUND_TOKEN));
        return;
    }

    if(!userIdx)
    {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.EMPTY_TOKEN));
        return;
    }

    const boardCounts = await Mypage.countBoard(userIdx);

    if(boardCounts[0].count == 0)
    {
        res.status(statusCode.OK).send(utils.successTrue(statusCode.OK, responseMessage.NO_MY_BOARD, null));
        return;
    }

    const result = await Mypage.readBoards(userIdx);
    
    if(result.length == 0)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.BOARD_READ_ALL_FAIL));
        return;
    }    

    res.status(statusCode.OK).send(utils.successTrue(statusCode.OK, responseMessage.BOARD_READ_ALL_SUCCESS, result));
});

// 비밀번호 변경
router.put("/changePw", authUtil.validToken, async(req, res) => {
    const userIdx = req.decoded.userIdx;
    const gender = req.decoded.gender;

    if(gender == 0) {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.LOOK_AROUND_TOKEN));
        return;
    } 
    const {currPw, newPw} = req.body;
    
    //비어있는지 검사
    if(!currPw || ! newPw) {
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
        
        if(inputCurrPw == userResult[0].password) { //기존 비번이랑 같다면 비번 변경
            const buf = await crypto.randomBytes(32); //64비트의 salt값 생성
            const salt = buf.toString('hex'); //비트를 문자열로 바꿈
            const hashedPw = await crypto.pbkdf2(newPw.toString(),salt,1000,32,'SHA512'); //버퍼 형태로 리턴해주기 때문에 base64 방식으로 문자열
            const finalPw = hashedPw.toString('hex');
            var json = {userIdx, finalPw, salt};

            result = Mypage.changePw(json);
            if(result.length == 0) {
                res
                .status(statusCode.INTERNAL_SERVER_ERROR)
                .send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.PW_CHANGE_FAIL));
                return;
            }
            else {
                res
                .status(statusCode.OK)
                .send(utils.successTrue(statusCode.OK, responseMessage.PW_CHANGE_SUCCESS, null));
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

// 본인인증
router.post("/selfAuth", upload_auth.single('img'), async(req, res) => {
    const userName = req.body.userName;

    if(!req.file) {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.X_NULL_VALUE('img')));
        return;
    }
    else if(!userName) {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.X_NULL_VALUE('userName')));
        return;
    }

    let transporter = nodemailer.createTransport({
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
      to: process.env.E_MAIL_ID,    // 수신 메일 주소
      subject: `[본인인증] ${userName}님께서 본인인증을 요청하였습니다`,   // 제목
      text: `${userName}님께서 본인인증을 요청하였습니다.\n AWS S3에서 확인해주세요!\n https://s3.console.aws.amazon.com/s3/`  // 내용
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.SELF_AUTH_FAIL));
        console.log(error);
        return;
      }
      else {
        res.status(statusCode.OK).send(utils.successTrue(statusCode.OK, responseMessage.SELF_AUTH_SUCCESS, null));
      }
    });
});
//관심사 리스트
router.get("/interests",async(req,res) => {
    const result = await Mypage.readInterest();

    if(result.length == 0) {
        res
        .status(statusCode.INTERNAL_SERVER_ERROR)
        .send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage. READ_INTEREST_FAIL));
        return;
    }

    res
    .status(statusCode.OK)
    .send(utils.successTrue(statusCode.OK, responseMessage. READ_INTEREST_SUCCESS, result));
    
});

// 문의하기
router.post("/contactUs", authUtil.validToken, async(req, res) => {
    const userId = req.body.userId;
    const content = req.body.content;
    console.log(userId)

    if(!userId || !content) {
        const missParameters = Object.entries({userId, content}).filter(it => it[1] == undefined).map(it => it[0]).join(',');
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.X_NULL_VALUE(missParameters)));
        return;
    }

    let transporter = nodemailer.createTransport({
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
        to: process.env.E_MAIL_ID,    // 수신 메일 주소
        subject: `[문의] ${userId} 님으로부터의 문의입니다`,   // 제목
        text: content  // 내용
    };
  
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.CONTACT_US_FAIL));
          console.log(error);
          return;
        }
        else {
          res.status(statusCode.OK).send(utils.successTrue(statusCode.OK, responseMessage.CONTACT_US_SUCCESS, null));
        }
    });
});

//공지사항 전체보기
router.get("/noticeAll",authUtil.validToken,async(req,res) => {

    const result = await Mypage.NoticeAll();

    if(result.length == 0) {
        res
        .status(statusCode.INTERNAL_SERVER_ERROR)
        .send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage. READ_NOTICE_FAIL));
        return;
    }

    res
    .status(statusCode.OK)
    .send(utils.successTrue(statusCode.OK, responseMessage. READ_NOTICE_SUCCESS, result));


});

//공지사항 세부내용 보기
router.get("/notice/:noticeIdx",authUtil.validToken,async(req,res) => {

    const noticeIdx = req.params.noticeIdx;

    if(!noticeIdx)
    {
        res.status(statusCode.BAD_REQUEST)
        .send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.X_NULL_VALUE("noticeIdx")));
        return;
    }

    const result = await Mypage.NoticeDetail(noticeIdx);

    if(result.length == 0) {
        res
        .status(statusCode.INTERNAL_SERVER_ERROR)
        .send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage. READ_NOTICE_FAIL));
        return;
    }

    res
    .status(statusCode.OK)
    .send(utils.successTrue(statusCode.OK, responseMessage. READ_NOTICE_SUCCESS, result[0]));


});

// 탈퇴 하기
router.put("/withdraw", authUtil.validToken, async(req, res) => {
    const userIdx = req.decoded.userIdx;
    const gender = req.decoded.gender;

    if(gender == 0){
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.LOOK_AROUND_TOKEN));
        return;
    }

    if(!userIdx)
    {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.EMPTY_TOKEN));
        return;
    }

    const result =  await Mypage.byeUser(userIdx);

    if(result.length == 0) { 
        res
        .status(statusCode.INTERNAL_SERVER_ERROR)
        .send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.WITHDRAW_FAIL));
        return;
    }

    res
    .status(statusCode.OK)
    .send(utils.successTrue(statusCode.OK, responseMessage.WITHDRAW_SUCCESS, result[0]))
});

module.exports = router;