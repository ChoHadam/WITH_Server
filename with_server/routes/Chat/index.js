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
let iconv = require('iconv-lite');

router.post('/', authUtil.validToken, async (req, res) => {
    const {receiverIdx, boardIdx, roomId} = req.body;
    const senderIdx = req.decoded.userIdx;
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
    const check = await Chat.checkRoom(json);
    if(!check.length==0)
    {
        res.status(statusCode.OK).send(utils.successFalse(responseMessage.ALREADY_CHAT));
        return;
    }
    let result = await Chat.create(json);
    if(result.length == 0)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.CHAT_CREATE_FAIL));
        return;
    }
    res.status(statusCode.OK).send(utils.successTrue(responseMessage.CHAT_CREATE_SUCCESS));
});

router.put('/', authUtil.validToken, async (req, res) => {
    let {receiverIdx, boardIdx, withDate} = req.body;
    const senderIdx = req.decoded.userIdx;
    if(!senderIdx || !receiverIdx || !boardIdx || !withDate)
    {
        const missParameters = Object.entries({senderIdx, receiverIdx, boardIdx, withDate})
        .filter(it => it[1] == undefined).map(it => it[0]).join(',');
        res
        .status(statusCode.BAD_REQUEST)
        .send(utils.successFalse(responseMessage.X_NULL_VALUE(missParameters)));
        return;
    }
    const withTime = moment().format('YYYY-MM-DD HH:mm:ss');
    withDate = moment(withDate, 'YY.MM.DD').format('YYYY-MM-DD');
    const json = {senderIdx, receiverIdx, boardIdx, withDate, withTime};
    let result = await Chat.update(json);
    if(result.length == 0)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.WITH_FAIL));
        return;
    }
    res.status(statusCode.OK).send(utils.successTrue(responseMessage.WITH_SUCCESS));
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
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.CHAT_READ_ALL_FAIL));
        return;
    }
    for(var i in result){
        result[i].startDate = moment(result[i].startDate, 'YYYY-MM-DD').format('YY.MM.DD');
        result[i].endDate = moment(result[i].endDate, 'YYYY-MM-DD').format('YY.MM.DD');
        result[i].withDate = moment(result[i].withDate, 'YYYY-MM-DD').format('YY.MM.DD');
    }
    res.status(statusCode.OK).send(utils.successTrue(responseMessage.CHAT_READ_ALL_SUCCESS, result));
});

router.get('/check', authUtil.validToken, async (req, res) => {
    const userIdx = req.decoded.userIdx;
    if(!userIdx)
    {
        const missParameters = Object.entries({myIdx})
        .filter(it => it[1] == undefined).map(it => it[0]).join(',');
        res
        .status(statusCode.BAD_REQUEST)
        .send(utils.successFalse(responseMessage.X_NULL_VALUE(missParameters)));
        return;
    }
    let result = await Chat.check(userIdx);
    if(result.length == 0)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.CHAT_READ_ALL_FAIL));
        return;
    }
    for(var i in result){
        result_img = await Chat.img(result[i].regionCode)
        result[i].regionImgE = result_img[0].regionImgE;
    }
    res.status(statusCode.OK).send(utils.successTrue(responseMessage.CHAT_READ_ALL_SUCCESS, result));
});

module.exports = router;