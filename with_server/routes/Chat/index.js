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
    const check = await Chat.checkRoom(json);
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

    if(gender == 0){
      res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.LOOK_AROUND_TOKEN));
      return;
    }
    // receiverIdx, boardIdx, senderIdx를 이용해 동행 처리
    var {roomId, withDate} = req.body;
    const withTime = moment().format('YYYY-MM-DD HH:mm:ss');
    withDate = moment(withDate, 'YY.MM.DD').format('YYYY-MM-DD');
    console.log(withDate);

    // 파라미터 미입력 시, 오류 처리
    if(!roomId || !withDate)
    {
        const missParameters = Object.entries({roomId, withDate})
        .filter(it => it[1] == undefined).map(it => it[0]).join(',');
        res
        .status(statusCode.BAD_REQUEST)
        .send(utils.successFalse(responseMessage.X_NULL_VALUE(missParameters)));
        return;
    }

    const boardIdxArr = roomId.split('_')
    const boardIdx = boardIdxArr[0];

    const json = {roomId, withDate, withTime, boardIdx};
    let result = await Chat.update(json); // 동행 처리

    // DB 쿼리 오류 시, 에러 처리
    if(result.length == 0)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.WITH_FAIL));
        return;
    }

    res.status(statusCode.OK).send(utils.successTrue(responseMessage.WITH_SUCCESS));
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
    let result = await Chat.readAll(userIdx);

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

module.exports = router;