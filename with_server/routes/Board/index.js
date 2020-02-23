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
    startDate = moment(startDate, 'YY.MM.DD').format('YYYY-MM-DD');
    endDate = moment(endDate, 'YY.MM.DD').format('YYYY-MM-DD');
    if(!regionCode || !title || !content || !startDate || !endDate || !filter)
    {
      const missParameters = Object.entries({regionCode, title, content, startDate, endDate, filter})
        .filter(it => it[1] == undefined).map(it => it[0]).join(',');
      console.log(missParameters)

      res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.X_NULL_VALUE(missParameters)));
      return;
    }
    
    // uploadTime에 현재 서울 시각 저장
    const uploadTime = moment().format('YYYY-MM-DD HH:mm:ss');

    // Token 통해서 userIdx 취득
    const userIdx = req.decoded.userIdx;

    const json = {regionCode, title, content, uploadTime, startDate, endDate, userIdx, filter};
  
    var result = await Board.create(json);
    result = await Board.read(result.insertId, userIdx);

    if(result.length == 0)
    {
      res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_CREATE_FAIL));
      return;
    }

    result[0].startDate = moment(result[0].startDate, 'YYYY-MM-DD').format('YY.MM.DD');
    result[0].endDate = moment(result[0].endDate, 'YYYY-MM-DD').format('YY.MM.DD');
    
    //뱃지 계산   
    const prop = (result[0].likeNum / (result[0].likeNum + result[0].dislikeNum)) * 100;
        
    if(parseInt(prop)>=70 && parseInt(prop)<80 ){
      badge = 1;
    }else if(parseInt(prop)>=80 && parseInt(prop)<90 ){
      badge = 2;
    }else if(parseInt(prop)>=90 && parseInt(prop)<=100 ){
      badge = 3;
    }else{
      badge = 0;
    }
    
    result[0].withFlag = -1;
    result[0].badge = badge;

    // 클라이언트에서 필요없는 정보 제거
    delete result[0].regionCode;
    delete result[0].likeNum;
    delete result[0].dislikeNum;
    delete result[0].withNum;
    delete result[0].uploadTime;
        
    res.status(statusCode.OK).send(utils.successTrue(responseMessage.BOARD_CREATE_SUCCESS, result));
});

// 게시글 전체 보기
router.get("/region/:regionCode/startDates/:startDate/endDates/:endDate/keywords/:keyword/filters/:filter", authUtil.validToken, async (req, res) => {
  var {regionCode, startDate, endDate, keyword, filter} = req.params;
  const {userIdx, gender} = req.decoded;

  if(startDate !='0' && endDate != '0')
  {
    startDate = moment(startDate, 'YY.MM.DD').format('YYYY-MM-DD');
    endDate = moment(endDate, 'YY.MM.DD').format('YYYY-MM-DD');
  }

  if(!regionCode)
  {
    res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.NULL_VALUE));
    return;
  }

  const json = {regionCode, startDate, endDate, userIdx, filter, keyword, gender};
  let result = await Board.readAll(json);

  if(result.length == 0)
  {
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_READ_ALL_FAIL));
    return;
  }

  for(var i in result)
  {
    result[i].startDate = moment(result[i].startDate, 'YYYY-MM-DD').format('YY.MM.DD');
    result[i].endDate = moment(result[i].endDate, 'YYYY-MM-DD').format('YY.MM.DD');
  }

  res.status(statusCode.OK).send(utils.successTrue(responseMessage.BOARD_READ_ALL_SUCCESS, result));
});

// 게시글 하나 보기
router.get("/:boardIdx", authUtil.validToken, async(req, res) => {
  const boardIdx = req.params.boardIdx;
  const userIdx = req.decoded.userIdx;

  if(!boardIdx || !userIdx)
  {
    res.status(statusCode.NO_CONTENT).send(utils.successFalse(responseMessage.NULL_VALUE));
    return;
  }

  var result = await Board.read(boardIdx, userIdx);

  if(result.length == 0)
  {
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.NO_BOARD));
    return;
  }

  result[0].startDate = moment(result[0].startDate, 'YYYY-MM-DD').format('YY.MM.DD');
  result[0].endDate = moment(result[0].endDate, 'YYYY-MM-DD').format('YY.MM.DD');

  //뱃지 계산   
  const prop = (result[0].likeNum / (result[0].likeNum + result[0].dislikeNum)) * 100;
    
  if(parseInt(prop)>=70 && parseInt(prop)<80 ){
      badge = 1;
  }else if(parseInt(prop)>=80 && parseInt(prop)<90 ){
      badge = 2;
  }else if(parseInt(prop)>=90 && parseInt(prop)<=100 ){
      badge = 3;
  }else{
      badge = 0;
  }
  result[0].badge = badge;
  
  //클라에서 필요없는 정보 제거
  delete result[0].likeNum;
  delete result[0].dislikeNum;
  delete result[0].regionCode;
  delete result[0].withNum
  delete result[0].uploadTime;

  res.status(statusCode.OK).send(utils.successTrue(responseMessage.BOARD_READ_SUCCESS, result[0]));
});

// 게시글 수정하기
router.put("/edit/:boardIdx", authUtil.validToken, async(req, res) => {
  const userIdx = req.decoded.userIdx;
  const boardIdx = req.params.boardIdx;
  
  if(!boardIdx || !userIdx)
  {
    res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.NULL_VALUE));
    return;
  }

  var {regionCode, title, content, startDate, endDate, filter} = req.body;

  if(startDate)
  {
    startDate = moment(startDate, 'YY.MM.DD').format('YYYY-MM-DD');
  }

  if(endDate)
  {
    endDate = moment(endDate, 'YY.MM.DD').format('YYYY-MM-DD');
  }

  const result = await Board.update(req.body, boardIdx, userIdx);

  if(result == 0)
  {
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.BOARD_UPDATE_FAIL));
    return;
  }

  res.status(statusCode.OK).send(utils.successTrue(statusCode.OK, responseMessage.BOARD_UPDATE_SUCCESS, result));
});

// 게시글 삭제하기 (error....)
router.delete("/:boardIdx", async(req, res) => {
  const boardIdx = req.params.boardIdx;
  
  if(!boardIdx)
  {
    res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.NULL_VALUE));
    return;
  }  

  const result = await Board.delete(boardIdx);

  if(result.length == 0)
  {
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_DELETE_FAIL));
    return;
  }
  res.status(statusCode.OK).send(utils.successTrue(responseMessage.BOARD_DELETE_SUCCESS, result));
});

// 마감 풀기
router.put("/activate/:boardIdx", authUtil.validToken, async(req, res) => {
  const userIdx = req.decoded.userIdx;
  const boardIdx = req.params.boardIdx;

  if(!userIdx || !boardIdx)
  {
    res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
    return;
  }  
  
  const result = await Board.activate(boardIdx, userIdx);
  if(!result || result == 0)
  {
    res
    .status(statusCode.INTERNAL_SERVER_ERROR)
    .send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.BOARD_ACTIVATE_FAIL));
    return;
  }

  res.status(statusCode.OK).send(utils.successTrue(statusCode.OK, responseMessage.BOARD_ACTIVATE_SUCCESS, result));
});

module.exports = router;