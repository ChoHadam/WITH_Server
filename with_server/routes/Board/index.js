const express = require('express');
const router = express.Router({mergeParams: true});

const utils = require('../../module/utils/utils');
const responseMessage = require('../../module/utils/responseMessage');
const statusCode = require('../../module/utils/statusCode');

const moment = require('moment');
const moment_timezone = require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");
const authUtil = require('../../module/utils/authUtil');
const Board = require('../../model/board');

// 게시글 생성하기
router.post('/', authUtil.validToken, async (req, res) => {
    var {regionCode, title, content, startDate, endDate, filter} = req.body;
    const userIdx = req.decoded.userIdx;
    const gender = req.decoded.gender;

    if(gender == 0){
      res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.LOOK_AROUND_TOKEN));
      return;
    }

    if(!regionCode || !title || !content || !startDate || !endDate || !filter) {
      const missParameters = Object.entries({regionCode, title, content, startDate, endDate, filter})
      .filter(it => it[1] == undefined).map(it => it[0]).join(',');

      res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.X_NULL_VALUE(missParameters)));
      return;
    }
    
    // uploadTime에 현재 서울 시각 저장
    const uploadTime = moment().format('YYYY-MM-DD HH:mm:ss');
    startDate = moment(startDate, 'YY.MM.DD').format('YYYY-MM-DD');
    endDate = moment(endDate, 'YY.MM.DD').format('YYYY-MM-DD');

    const json = {regionCode, title, content, uploadTime, startDate, endDate, userIdx, filter};
  
    var result = await Board.create(json);
    
    if(result.result == -1) {
      res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.NO_X("regionCode")));
      return;
    }
    else if(result.length == 0) {
      res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.BOARD_CREATE_FAIL));
      return;
    }

    res.status(statusCode.OK).send(utils.successTrue(statusCode.OK, responseMessage.BOARD_CREATE_SUCCESS, result));
});

// 게시글 전체 보기
router.get("/region/:regionCode/startDates/:startDate/endDates/:endDate/keywords/:keyword/filters/:filter", authUtil.validToken, async (req, res) => {
  var {regionCode, startDate, endDate, keyword, filter} = req.params;
  const {userIdx, gender} = req.decoded;

  if(gender == 0)  filter = -1; //둘러보기 유저 필터적용 안됨

  if(startDate !='0' && endDate != '0')
  {
    startDate = moment(startDate, 'YY.MM.DD').format('YYYY-MM-DD');
    endDate = moment(endDate, 'YY.MM.DD').format('YYYY-MM-DD');
  }

  if(!regionCode)
  {
    res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.X_NULL_VALUE("regionCode")));
    return;
  }

  const json = {regionCode, startDate, endDate, userIdx, filter, keyword, gender};
  let result = await Board.readAll(json);

  if(result.length == 0)
  {
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.BOARD_READ_ALL_FAIL));
    return;
  }

  for(var i in result)
  {
    result[i].startDate = moment(result[i].startDate, 'YYYY-MM-DD').format('YYYY.M.D');
    result[i].endDate = moment(result[i].endDate, 'YYYY-MM-DD').format('YYYY.M.D');
  }

  res.status(statusCode.OK).send(utils.successTrue(statusCode.OK,responseMessage.BOARD_READ_ALL_SUCCESS, result));
});

// 게시글 하나 보기
router.get("/:boardIdx", authUtil.validToken, async(req, res) => {
  const boardIdx = req.params.boardIdx;
  const userIdx = req.decoded.userIdx;
  const gender = req.decoded.gender;

  if(gender == 0){
    res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.LOOK_AROUND_TOKEN));
    return;
  }

  if(!boardIdx || !userIdx)
  {
    res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    return;
  }

  var result = await Board.read(boardIdx, userIdx);

  if(result.length == 0)
  {
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.BOARD_READ_FAIL));
    return;
  }

  if(userIdx == result[0].userIdx)
    result[0].writer = 1;
  else
    result[0].writer = 0;

  result[0].startDate = moment(result[0].startDate, 'YYYY-MM-DD').format('YYYY.M.D');
  result[0].endDate = moment(result[0].endDate, 'YYYY-MM-DD').format('YYYY.M.D');  
  
  //클라에서 필요없는 정보 제거 
  delete result[0].regionCode;

  res.status(statusCode.OK).send(utils.successTrue(statusCode.OK,responseMessage.BOARD_READ_SUCCESS, result));
});

// 게시글 수정하기
router.put("/edit/:boardIdx", authUtil.validToken, async(req, res) => {
  const userIdx = req.decoded.userIdx;
  const boardIdx = req.params.boardIdx;
  const gender = req.decoded.gender;

  if(gender == 0){
    res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.LOOK_AROUND_TOKEN));
    return;
  }
  
  if(!userIdx || !boardIdx) {
    res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.NULL_VALUE));
    return;
  }

  var {regionCode, title, content, startDate, endDate, filter} = req.body;

  if(startDate) {
    startDate = moment(startDate, 'YY.MM.DD').format('YYYY-MM-DD');
  }

  if(endDate) {
    endDate = moment(endDate, 'YY.MM.DD').format('YYYY-MM-DD');
  }

  const result = await Board.update(req.body, boardIdx, userIdx);

  if(result.result == -1) {
    res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.NO_BOARD));
    return;
  }
  else if(result.result == -2) {
    res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.MISS_MATCH_ID));
    return;
  }
  else if(result.result == 1) {
    delete result.result;
    res.status(statusCode.OK).send(utils.successTrue(statusCode.OK, responseMessage.BOARD_UPDATE_SUCCESS, result));
    return;
  }
  else {
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.BOARD_UPDATE_FAIL));
    return;
  }
});

// 게시글 삭제하기 (error....)
router.delete("/:boardIdx", async(req, res) => {
  const boardIdx = req.params.boardIdx;
  
  if(!boardIdx) {
    res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.NULL_VALUE));
    return;
  }  

  const result = await Board.delete(boardIdx);

  if(result.length == 0) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_DELETE_FAIL));
    return;
  }
  res.status(statusCode.OK).send(utils.successTrue(responseMessage.BOARD_DELETE_SUCCESS, result));
});

// 마감 풀기
router.put("/activate/:boardIdx", authUtil.validToken, async(req, res) => {
  const userIdx = req.decoded.userIdx;
  const boardIdx = req.params.boardIdx;
  const gender = req.decoded.gender;

  if(gender == 0){
    res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.LOOK_AROUND_TOKEN));
    return;
  }

  if(!userIdx || !boardIdx) {
    res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    return;
  }  
  
  const result = await Board.activate(boardIdx, userIdx);

  if(result == -1) {
    res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.NO_BOARD));
    return;
  }
  else if(result == -2) {
    res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.MISS_MATCH_ID));
    return;
  }
  else if (result == 1) {
    res.status(statusCode.OK).send(utils.successTrue(statusCode.OK, responseMessage.BOARD_ACTIVATE_SUCCESS, result));
    return;
  }
  else {
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.BOARD_ACTIVATE_FAIL));
    return;
  }
});

module.exports = router;