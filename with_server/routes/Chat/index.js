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

router.post('/', authUtil.validToken, async (req, res) => {
    // 채팅 신청자, 게시글 작성자, 게시글 idx, room ID를 받고 채팅방 정보를 생성한다.
    const {receiverIdx, boardIdx, roomId} = req.body;
    const senderIdx = req.decoded.userIdx;

    // 파라미터 미입력 시, 오류 처리
    if(!senderIdx || !receiverIdx || !boardIdx || !roomId)
    {
        const missParameters = Object.entries({senderIdx, receiverIdx, boardIdx, roomId})
        .filter(it => it[1] == undefined).map(it => it[0]).join(',');
        res
        .status(statusCode.BAD_REQUEST)
        .send(utils.successFalse(responseMessage.X_NULL_VALUE(missParameters)));
        return;
    }

    const json = {senderIdx, receiverIdx, boardIdx, roomId};
    const check = await Chat.checkRoom(json); // 채팅방 중복 확인
    // DB 쿼리 오류 시, 에러 처리
    if(!check.length==0)
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

    res.status(statusCode.OK).send(utils.successTrue(responseMessage.CHAT_CREATE_SUCCESS));
});

// receiverIdx, boardIdx -> roomId 로 대체 문의 필요
router.put('/', authUtil.validToken, async (req, res) => {
    // receiverIdx, boardIdx, senderIdx를 이용해 동행 처리
    let {receiverIdx, boardIdx, withDate} = req.body;
    const senderIdx = req.decoded.userIdx;
    const withTime = moment().format('YYYY-MM-DD HH:mm:ss');
    withDate = moment(withDate, 'YY.MM.DD').format('YYYY-MM-DD');

    // 파라미터 미입력 시, 오류 처리
    if(!senderIdx || !receiverIdx || !boardIdx || !withDate)
    {
        const missParameters = Object.entries({senderIdx, receiverIdx, boardIdx, withDate})
        .filter(it => it[1] == undefined).map(it => it[0]).join(',');
        res
        .status(statusCode.BAD_REQUEST)
        .send(utils.successFalse(responseMessage.X_NULL_VALUE(missParameters)));
        return;
    }

    const json = {senderIdx, receiverIdx, boardIdx, withDate, withTime};
    let result = await Chat.update(json); // 동행 처리
    // DB 쿼리 오류 시, 에러 처리
    if(result.length == 0)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.WITH_FAIL));
        return;
    }

    res.status(statusCode.OK).send(utils.successTrue(responseMessage.WITH_SUCCESS));
});

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

    // 날짜 포맷 변경, 게시글 작성자의 이미지 추가
    for(var i in result){
        const ret_img = await Chat.readBoardImg(result[i].boardIdx); // 게시글 작성자의 이미지 추가
        result[i].startDate = moment(result[i].startDate, 'YYYY-MM-DD').format('YY.MM.DD');
        result[i].endDate = moment(result[i].endDate, 'YYYY-MM-DD').format('YY.MM.DD');
        result[i].withDate = moment(result[i].withDate, 'YYYY-MM-DD').format('YY.MM.DD');
        result[i].boardImg = ret_img[0].userImg;
    }

    res.status(statusCode.OK).send(utils.successTrue(responseMessage.CHAT_READ_ALL_SUCCESS, result));
});

router.get('/check', authUtil.validToken, async (req, res) => {
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
    let result = await Chat.check(userIdx);
    // DB 쿼리 오류 시, 에러 처리
    if(result.length == 0)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.CHAT_READ_ALL_FAIL));
        return;
    }

    // 동행 평가를 수행할 지역의 배경 이미지 추가
    for(var i in result){
        result_img = await Chat.img(result[i].regionCode)
        result[i].regionImgE = result_img[0].regionImgE;
    }
    
    res.status(statusCode.OK).send(utils.successTrue(responseMessage.CHAT_READ_ALL_SUCCESS, result));
});

module.exports = router;