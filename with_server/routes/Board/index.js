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

// 게시글 전체 보기
router.get("/region/:regionCode/startDates/:startDate/endDates/:endDate/keywords/:keyword/filters/:filter", authUtil.validToken, async (req, res) => {
  var {regionCode, startDate, endDate, keyword, filter} = req.params;
  const {userIdx, gender} = req.decoded;
  if(startDate !='0' && endDate != '0'){
    startDate = moment(startDate, 'YY.MM.DD').format('YYYY-MM-DD');
    endDate = moment(endDate, 'YY.MM.DD').format('YYYY-MM-DD');
  }
  if(!regionCode)
  {
    res.status(statusCode.NO_CONTENT).send(utils.successFalse(responseMessage.NULL_VALUE));
    return;
  }
  const json = {regionCode, startDate, endDate, userIdx, filter, keyword, gender};
  let result = await Board.readAll(json);

  if(result.length == 0)
  {
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_READ_ALL_FAIL));
    return;
  }

  for(var i in result){
    result[i].startDate = moment(result[i].startDate, 'YYYY-MM-DD').format('YY.MM.DD');
    result[i].endDate = moment(result[i].endDate, 'YYYY-MM-DD').format('YY.MM.DD');
  }

  res.status(statusCode.OK).send(utils.successTrue(responseMessage.BOARD_READ_ALL_SUCCESS, result));
});

// 게시글 하나 보기
router.get("/:boardIdx", async(req, res) => {
  const boardIdx = req.params.boardIdx;

  if(!boardIdx)
  {
    res.status(statusCode.NO_CONTENT).send(utils.successFalse(responseMessage.NULL_VALUE));
    return;
  }

  var result = await Board.read(boardIdx);

  if(result.length == 0)
  {
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.NO_BOARD));
    return;
  }

  result[0].startDate = moment(result[0].startDate, 'YYYY-MM-DD').format('YY.MM.DD');
  result[0].endDate = moment(result[0].endDate, 'YYYY-MM-DD').format('YY.MM.DD');
  
  res.status(statusCode.OK).send(utils.successTrue(responseMessage.BOARD_READ_SUCCESS, result));
});

// 게시글 수정하기
router.put("/edit/:boardIdx", authUtil.validToken, async(req, res) => {
  const boardIdx = req.params.boardIdx;
  
  if(!boardIdx)
  {
    res.status(statusCode.NO_CONTENT).send(utils.successFalse(responseMessage.NULL_VALUE));
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
  
  const result = await Board.update(req.body, boardIdx);
  /*
  if(result.length == 0)
  {
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.EVALUATE_FAIL));
    return;
  }
  */

  res.status(statusCode.OK).send(utils.successTrue(responseMessage.BOARD_UPDATE_SUCCESS, result));
});

// 게시글 삭제하기 (error....)
router.delete("/:boardIdx", async(req, res) => {
  const boardIdx = req.params.boardIdx;

  if(!boardIdx)
  {
    res.status(statusCode.NO_CONTENT).send(utils.successFalse(responseMessage.NULL_VALUE));
    return;
  }

  const result = await Board.delete(boardIdx);

  if(result.length == 0){
    res
    .status(statusCode.INTERNAL_SERVER_ERROR)
    .send(utils.successFalse(responseMessage.BOARD_DELETE_FAIL));
    return;
  }
  res.status(statusCode.OK)
  .send(utils.successTrue(responseMessage.BOARD_DELETE_SUCCESS));
});

// 마감 풀기
router.put("/activate/:boardIdx", authUtil.validToken, async(req, res) => {
  const userIdx = req.decoded.userIdx;
  const result = await Board.activate(req.body, boardIdx, userIdx);

  res.status(statusCode.OK).send(utils.successTrue(responseMessage.BOARD_UPDATE_SUCCESS, result));
});

/*
// 동행 평가하기 - 좋아요+1
router.put("/like", authUtil.validToken, async(req, res) => {
  const userIdx = req.decoded.userIdx;
  
  if(!userIdx)
>>>>>>> 3b9221400ab44178dadca75db5d151717971989b
  {
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.OUT_OF_VALUE));
    return;
  }

  const result = await Board.like(userIdx);

  res.status(statusCode.OK).send(utils.successTrue(responseMessage.EVALUATE_SUCCESS, result));
});

// 동행 평가하기 - 싫어요+1
router.put("/dislike", authUtil.validToken, async(req, res) => {
  const userIdx = req.decoded.userIdx;
  
  if(!userIdx)
  {
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.OUT_OF_VALUE));
    return;
  }

  const result = await Board.dislike(userIdx);

  res.status(statusCode.OK).send(utils.successTrue(responseMessage.EVALUATE_SUCCESS, result));
});

*/

// 게시글 삭제하기 (error....)

module.exports = router;