const express = require('express');
const router = express.Router({mergeParams: true});

const utils = require('../../module/utils/utils');
const responseMessage = require('../../module/utils/responseMessage');
const statusCode = require('../../module/utils/statusCode');

const moment = require('moment');
const moment_timezone = require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");
const authutil = require('../../module/utils/authUtil');
const Board = require('../../model/board');


// 게시글 생성하기
router.post('/', authutil.validToken, async (req, res) => {
    const {regionCode, title, content, startDate, endDate, withNum, filter} = req.body;
    if(!regionCode || !title || !content || !startDate || !endDate || !withNum || !filter)
    {
      const missParameters = Object.entries({regionCode, title, content, startDate, endDate, withNum, filter})
        .filter(it => it[1] == undefined).map(it => it[0]).join(',');

      res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.NULL_VALUE));
      return;
    }
    
    // uploadTime에 현재 서울 시각 저장
    const uploadTime = moment().format('YYYY-MM-DD HH:mm:ss');

    // Token 통해서 userIdx 취득
    const userIdx = req.decoded.userIdx;
    console.log(userIdx);

    const json = {regionCode, title, content, uploadTime, startDate, endDate, userIdx, withNum, filter};

    const result = await Board.create(json);

    if(result.length == 0)
    {
      res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_CREATE_FAIL));
      return;
    }

    res.status(statusCode.OK).send(utils.successTrue(responseMessage.BOARD_CREATE_SUCCESS));
});

// 게시글 전체 보기
router.get("/board/region/:regionCode/startDates/:startDate/endDates/:endDate/keywords/:keyword/filters/:filter", authutil.validToken, async (req, res) => {
  const regionCode = req.params.regionCode;
  const startDate = req.params.startDate;
  const endDate = req.params.endDate;
  const keyword = req.params.keyword;
  const filter = req.params.filter;
  const gender = req.decoded.gender;

  if(!regionCode)
  {
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.OUT_OF_VALUE));
    return;
  }

  const json = {regionCode, title, content, uploadTime, startDate, endDate, userIdx, withNum, filter, keyword, gender};

  const result = await Board.readAllFilter(json);

  if(result.length == 0)
  {
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_READ_FAIL));
    return;
  }

  res.status(statusCode.OK).send(utils.successTrue(responseMessage.BOARD_READ_SUCCESS, result));
});

// 게시글 하나 보기
router.get("/:boardIdx", async(req, res) => {
  const boardIdx = req.params.boardIdx;

  if(!boardIdx)
  {
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.OUT_OF_VALUE));
    return;
  }

  const result = await Board.read(boardIdx);

  if(result.length == 0)
  {
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.NO_BOARD));
    return;
  }
  
  res.status(statusCode.OK).send(utils.successTrue(responseMessage.BOARD_READ_SUCCESS, result));
});

// 게시글 수정하기
router.put("/:boardIdx", async(req, res) => {
  const boardIdx = req.params.boardIdx;
  
  if(!boardIdx)
  {
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.OUT_OF_VALUE));
    return;
  }

  const result = await Board.update(req.body, boardIdx);

  if(result.length == 0)
  {
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_UPDATE_FAIL));
    return;
  }

  res.status(statusCode.OK).send(utils.successTrue(responseMessage.BOARD_UPDATE_SUCCESS, result));
});

// 게시글 검색하기
router.get("/search/:keyword", async(req, res) => {
  const keyword = req.params.keyword;

  if(!keyword)
  {
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.OUT_OF_VALUE));
    return;
  }

  const result = await Board.search(keyword);

  if(result.length == 0)
  {
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.SEARCH_FAIL));
    return;
  }

  res.status(statusCode.OK).send(utils.successTrue(responseMessage.SEARCH_SUCCESS, result));
})

// 게시글 삭제하기 (error....)
router.delete("/", async(req, res) => {
  const result = await Board.delete(req.body);
  console.log(result);
  if(result.length == 0)
  {
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_DELETE_FAIL));
    return;
  }
  
  res.status(statusCode.OK).send(utils.successTrue(responseMessage.BOARD_DELETE_SUCCESS, result));
});

module.exports = router;