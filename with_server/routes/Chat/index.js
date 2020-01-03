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
    var userIdx = userIdx1;

    // 파라미터 미입력 시, 오류 처리
    if(!userIdx1 || !userIdx2 || !boardIdx || !roomId)
    {
        const missParameters = Object.entries({userIdx1, userIdx2, boardIdx, roomId})
        .filter(it => it[1] == undefined).map(it => it[0]).join(',');
        res
        .status(statusCode.BAD_REQUEST)
        .send(utils.successFalse(responseMessage.X_NULL_VALUE(missParameters)));
        return;
    }

    let json = {userIdx, boardIdx, roomId};
    const check = await Chat.checkRoom(json); // 채팅방 중복 확인

    // DB 쿼리 오류 시, 에러 처리
    if(check.length!==0)
    {
        res.status(statusCode.OK).send(utils.successFalse(responseMessage.ALREADY_CHAT));
        return;
    }
    let result = await Chat.create(json); // 채팅방 생성
    // DB 쿼리 오류 시, 에러 처리
    if(result.length == 0)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.CHAT_CREATE_FAIL));
        return;
    }
    json.userIdx = userIdx2;
    result = await Chat.create(json); // 채팅방 생성

    // DB 쿼리 오류 시, 에러 처리
    if(result.length == 0)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.CHAT_CREATE_FAIL));
        return;
    }
    res.status(statusCode.OK).send(utils.successTrue(responseMessage.CHAT_CREATE_SUCCESS));
});

// 동행 신청하기
router.put('/', authUtil.validToken, async (req, res) => {
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

    const json = {roomId, withDate, withTime};
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
    // 파라미터 미입력 시, 오류 처리
    if(!userIdx)
    {
        const missParameters = Object.entries({userIdx})
        .filter(it => it[1] == undefined).map(it => it[0]).join(',');
        res
        .status(statusCode.BAD_REQUEST)
        .send(utils.successFalse(responseMessage.X_NULL_VALUE(missParameters)));
        return;
    }
    
    let result = await Chat.readAll(userIdx); // 사용자와 관계된 모든 채팅방 정보들 출력
    // DB 쿼리 오류 시, 에러 처리
    if(result.length == 0)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.CHAT_READ_ALL_FAIL));
        return;
    }

    res.status(statusCode.OK).send(utils.successTrue(responseMessage.CHAT_READ_ALL_SUCCESS, result));
});

module.exports = router;