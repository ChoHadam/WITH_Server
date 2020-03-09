const express = require('express');
const router = express.Router({mergeParams: true});

const utils = require('../../module/utils/utils');
const responseMessage = require('../../module/utils/responseMessage');
const statusCode = require('../../module/utils/statusCode');

const moment = require('moment');
const moment_timezone = require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

const authUtil = require('../../module/utils/authUtil');
const Chat = require('../../model/chat');
const nodemailer = require('nodemailer');
require('dotenv').config();

// 채팅방 개설
router.post('/', authUtil.validToken, async (req, res) => {
    // 채팅 신청자, 게시글 작성자, 게시글 idx, room ID를 받고 채팅방 정보를 생성한다.
    const {userIdx1, boardIdx, roomId} = req.body;
    const userIdx2 = req.decoded.userIdx;

    // 자신이 자신에게 채팅거는 경우
    if(userIdx1 == userIdx2) {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.CHAT_MYSELF));
        return;
    }

    const gender = req.decoded.gender;

    // 둘러보기 토큰인 경우
    if(gender == 0) {
      res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.LOOK_AROUND_TOKEN));
      return;
    }

    // 파라미터 미입력인 경우
    if(!userIdx1 || !userIdx2 || !boardIdx || !roomId) {
        const missParameters = Object.entries({userIdx1, userIdx2, boardIdx, roomId})
        .filter(it => it[1] == undefined).map(it => it[0]).join(',');
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.X_NULL_VALUE(missParameters)));
        return;
    }
    
    // 1~4 사이의 난수 생성 (초대장 이미지 4개 중에서 랜덤 배정하기 위해서)
    let rand = Math.floor(Math.random() * 4) + 1;
    let json = {userIdx1, boardIdx, roomId, rand};

    // 채팅방 중복 확인
    const check = await Chat.checkRoom(roomId);
    if(check.length) {
        res.status(statusCode.CONFLICT).send(utils.successTrue(statusCode.CONFLICT, responseMessage.ALREADY_CHAT, check[0].invitationIdx));
        return;
    }

    // 채팅방 생성
    let result = await Chat.create(json);

    // DB 쿼리 오류 시, 에러 처리
    if(result.length == 0) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.CHAT_CREATE_FAIL));
        return;
    }
    json.userIdx1 = userIdx2;
    result = await Chat.create(json); // 상대방에게도 채팅방 생성

    // DB 쿼리 오류 시, 에러 처리
    if(result.length == 0) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.CHAT_CREATE_FAIL));
        return;
    }
    res.status(statusCode.OK).send(utils.successTrue(statusCode.OK, responseMessage.CHAT_CREATE_SUCCESS, json.rand));
});

// 동행 신청하기
router.put('/', authUtil.validToken, async (req, res) => {
    const gender = req.decoded.gender;
    const userIdx = req.decoded.userIdx;

    if(gender == 0) {
      res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.LOOK_AROUND_TOKEN));
      return;
    }
    
    // receiverIdx, boardIdx, senderIdx를 이용해 동행 처리
    var {roomId, withDate} = req.body;
    const withTime = moment().format('YYYY-MM-DD HH:mm:ss');
    withDate = moment(withDate, 'YY.MM.DD').format('YYYY-MM-DD');

    // 파라미터 미입력 시, 오류 처리
    if(!roomId || !withDate) {
        const missParameters = Object.entries({roomId, withDate})
        .filter(it => it[1] == undefined).map(it => it[0]).join(',');
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.X_NULL_VALUE(missParameters)));
        return;
    }

    const parsingArr = roomId.split('-')
    const boardIdx = parsingArr[0];
    const writerIdx = parsingArr[1];

    // 글쓴이 이외의 유저가 초대장을 보내려 하는 경우
    if(userIdx != writerIdx) {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.MISS_MATCH_ID));
        return;
    }

    const json = {roomId, withDate, withTime, boardIdx};
    const result = await Chat.update(json); // 동행 처리

    // DB 쿼리 오류 시, 에러 처리
    if(result.length == 0) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.WITH_FAIL));
        return;
    }
    else if(result == -1) {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.CHAT_EMPTY));
        return;
    }
    else if(result == -2) {
        res.status(statusCode.CONFLICT).send(utils.successFalse(statusCode.CONFLICT, responseMessage.WITH_ALREADY));
        return;
    }
    
    res.status(statusCode.OK).send(utils.successTrue(statusCode.OK, responseMessage.WITH_SUCCESS, null));
});

// 위드 메이트 채팅 목록 조회
router.get('/withmate', authUtil.validToken, async (req, res) => {
    const userIdx = req.decoded.userIdx;
    const gender = req.decoded.gender;

    // 둘러보기 토큰인 경우
    if(gender == 0) {
      res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.LOOK_AROUND_TOKEN));
      return;
    }

    // 사용자와 관계된 위드메이트 채팅방 정보들 받아오기
    const result = await Chat.readWithMate(userIdx);

    // DB 쿼리 오류 시, 에러 처리
    if(result.length == 0) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.CHAT_READ_WITHMATE_FAIL));
        return;
    }
    
    else if(result == -1) {
        res.status(statusCode.OK).send(utils.successTrue(statusCode.OK, responseMessage.CHAT_EMPTY, null));
        return;
    }
    
    res.status(statusCode.OK).send(utils.successTrue(statusCode.OK, responseMessage.CHAT_READ_WITHMATE_SUCCESS, result));
});

// 채팅 목록 조회
router.get('/', authUtil.validToken, async (req, res) => {
    const userIdx = req.decoded.userIdx;
    const gender = req.decoded.gender;

    // 둘러보기 토큰인 경우
    if(gender == 0) {
      res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.LOOK_AROUND_TOKEN));
      return;
    }

    // 사용자와 관계된 모든 채팅방 정보들 받아오기
    const result = await Chat.readAll(userIdx);

    // DB 쿼리 오류 시, 에러 처리
    if(result.length == 0) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.CHAT_READ_ALL_FAIL));
        return;
    }
    
    else if(result == -1) {
        res.status(statusCode.OK).send(utils.successTrue(statusCode.OK, responseMessage.CHAT_EMPTY, null));
        return;
    }
    
    res.status(statusCode.OK).send(utils.successTrue(statusCode.OK, responseMessage.CHAT_READ_ALL_SUCCESS, result));
});

router.post('/report', authUtil.validToken, async (req, res) => {
    const userIdx = req.decoded.userIdx;
    const gender = req.decoded.gender;
    const roomId = req.body.roomId;
    const category = req.body.category;


    if(gender == 0) {
      res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.LOOK_AROUND_TOKEN));
      return;
    }
    else if (!category || !roomId) {
        const missParameters = Object.entries({category, roomId})
        .filter(it => it[1] == undefined).map(it => it[0]).join(',');
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.X_NULL_VALUE(missParameters)));
        return;
    }

    const parsingArr = roomId.split('-');
    var defendant;

    const check = await Chat.checkRoom(roomId);
    if(check.length == 0) {
        res.status(statusCode.BAD_REQUEST).send(utils.successTrue(statusCode.BAD_REQUEST, responseMessage.CHAT_EMPTY));
        return;
    }

    if(userIdx == parsingArr[1])
        defendant = parsingArr[2];
    else
        defendant = parsingArr[1];

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
        subject: `[신고] ${userIdx}님께서 ${defendant}님을 신고하셨습니다`,   // 제목
        text: `${userIdx}님께서 ${defendant}님을 신고하셨습니다.\n 확인 부탁드립니다 \n 사유 : ${category} \n 채팅방 roomId : ${roomId}`  // 내용
      };
  
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.REPORT_FAIL));
          console.log(error);
          return;
        }
        else {
          res.status(statusCode.OK).send(utils.successTrue(statusCode.OK, responseMessage.REPORT_SUCCESS, null));
        }
      });
});

module.exports = router;