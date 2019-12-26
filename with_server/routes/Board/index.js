const express = require('express');
const router = express.Router({mergeParams: true});

const utils = require('../../module/utils/utils');
const responseMessage = require('../../module/utils/responseMessage');
const statusCode = require('../../module/utils/statusCode');

const Board = require('../../model/board');


// 게시글 생성하기
router.post('/', async (req, res) => {
    const {regionCode, title, content, startDate, endDate, userIdx, withNum, filter} = req.body;
    if(!regionCode || !title || !content || !startDate || !endDate || !userIdx || !withNum || !filter)
    {
      const missParameters = Object.entries({regionCode, title, content, startDate, endDate, userIdx, withNum, filter})
        .filter(it => it[1] == undefined).map(it => it[0]).join(',');

      res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.NULL_VALUE));
      return;
    }
    
    const result = await Board.create(req.body);

    if(result.length == 0)
    {
      res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_CREATE_FAIL));
      return;
    }

    res.status(statusCode.OK).send(utils.successTrue(responseMessage.BOARD_CREATE_SUCCESS));
});

// 게시글 전체 보기
//router.get("/:filter", async (req, res) => {
router.get("/region/:regionCode", async (req, res) => {
  // const filter = req.params.filter;

  // if(filter.length == 0)
  // {
  //   res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.OUT_OF_VALUE));
  //   return;
  // }

  //const result = await Board.readAll(filter);
  const regionCode = req.params.regionCode;

  if(!regionCode)
  {
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.OUT_OF_VALUE));
    return;
  }

  const result = await Board.readAll(regionCode);
  
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