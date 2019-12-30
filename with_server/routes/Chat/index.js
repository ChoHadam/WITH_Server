const express = require('express');
const router = express.Router({mergeParams: true});

const utils = require('../../module/utils/utils');
const responseMessage = require('../../module/utils/responseMessage');
const statusCode = require('../../module/utils/statusCode');

const moment = require('moment');
const moment_timezone = require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

const authUtil = require('../../module/utils/authUtil');
const Chat = require('../../model/Chat');

router.post('/', authUtil.validToken, async (req, res) => {
    const {receiverIdx, boardIdx} = req.body;
    const senderIdx = req.decoded.userIdx;
    if(!senderIdx || !receiverIdx || !boardIdx)
    {
        const missParameters = Object.entries({senderIdx, receiverIdx, boardIdx})
        .filter(it => it[1] == undefined).map(it => it[0]).join(',');
        res
        .status(statusCode.BAD_REQUEST)
        .send(utils.successFalse(responseMessage.X_NULL_VALUE(missParameters)));
        return;
    }
    const json = {senderIdx, receiverIdx, boardIdx};
    let result = await Chat.create(json);
    if(result.length == 0)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.CHAT_CREATE_FAIL));
        return;
    }
    res.status(statusCode.OK).send(utils.successTrue(responseMessage.CHAT_CREATE_SUCCESS, result));
});

router.put('/', authUtil.validToken, async (req, res) => {
    const {receiverIdx, boardIdx, withStartDate, withEndDate} = req.body;
    const senderIdx = req.decoded.userIdx;
    if(!senderIdx || !receiverIdx || !boardIdx || !withStartDate || !withEndDate)
    {
        const missParameters = Object.entries({senderIdx, receiverIdx, boardIdx, withStartDate, withEndDate})
        .filter(it => it[1] == undefined).map(it => it[0]).join(',');
        res
        .status(statusCode.BAD_REQUEST)
        .send(utils.successFalse(responseMessage.X_NULL_VALUE(missParameters)));
        return;
    }
    const json = {senderIdx, receiverIdx, boardIdx, withStartDate, withEndDate};
    let result = await Chat.update(json);
    if(result.length == 0)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.WITH_FAIL));
        return;
    }
    res.status(statusCode.OK).send(utils.successTrue(responseMessage.WITH_SUCCESS, result));
});

router.get('/', authUtil.validToken, async (req, res) => {
    const myIdx = req.decoded.userIdx;
    if(!myIdx)
    {
        const missParameters = Object.entries({myIdx})
        .filter(it => it[1] == undefined).map(it => it[0]).join(',');
        res
        .status(statusCode.BAD_REQUEST)
        .send(utils.successFalse(responseMessage.X_NULL_VALUE(missParameters)));
        return;
    }
    let result = await Chat.readAll(myIdx);
    if(result.length == 0)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.CHAT_READ_FAIL));
        return;
    }
    res.status(statusCode.OK).send(utils.successTrue(responseMessage.CHAT_READ_SUCCESS, result));
});

/*
router.post('/', authUtil.validToken, async (req, res) => {
    var {regionCode, title, content, startDate, endDate, filter} = req.body;
    startDate = moment(startDate, 'YY.MM.DD').format('YYYY-MM-DD');
    endDate = moment(endDate, 'YY.MM.DD').format('YYYY-MM-DD');
    if(!regionCode || !title || !content || !startDate || !endDate || !filter)
    {
        const missParameters = Object.entries({regionCode, title, content, startDate, endDate, filter})
        .filter(it => it[1] == undefined).map(it => it[0]).join(',');
        console.log(missParameters)

        res.status(statusCode.NO_CONTENT).send(utils.successFalse(responseMessage.X_NULL_VALUE(missParameters)));
        return;
    }
    
    // uploadTime에 현재 서울 시각 저장
    const uploadTime = moment().format('YYYY-MM-DD HH:mm:ss');

    // Token 통해서 userIdx 취득
    const userIdx = req.decoded.userIdx;

    const json = {regionCode, title, content, uploadTime, startDate, endDate, userIdx, filter};

    let result = await Board.create(json);

    if(result.length == 0)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_CREATE_FAIL));
        return;
    }
    result[0].startDate = moment(result[0].startDate, 'YYYY-MM-DD').format('YY.MM.DD');
    result[0].endDate = moment(result[0].endDate, 'YYYY-MM-DD').format('YY.MM.DD');
    res.status(statusCode.OK).send(utils.successTrue(responseMessage.BOARD_CREATE_SUCCESS, result));
});
*/

module.exports = router;