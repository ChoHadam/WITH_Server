const express = require('express');
const router = express.Router({mergeParams: true});

const utils = require('../../module/utils/utils');
const responseMessage = require('../../module/utils/responseMessage');
const statusCode = require('../../module/utils/statusCode');

const Bulletin = require('../../model/board');

// 게시글 생성하기
router.post('/', async (req, res) => {
    const {country, region, title, content, startDate, endDate, userIdx, withNum, filter} = req.body;
    if(!country || !region || !title || !content || !startDate || !endDate || !userIdx || !withNum || !filter)
    {
      const missParameters = Object.entries({country, region, title, content, startDate, endDate, userIdx, withNum, filter})
        .filter(it => it[1] == undefined).map(it => it[0]).join(',');

      res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.NULL_VALUE));
      return;
    }

    const result = await Bulletin.create(req.body);

    if(result.length == 0)
    {
      res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_CREATE_FAIL));
      return;
    }

    res.status(statusCode.OK).send(utils.successTrue(responseMessage.BOARD_CREATE_SUCCESS));
});

// 게시글 전체 보기
//router.get("/:filter", async (req, res) => {
router.get("/", async (req, res) => {
  // const filter = req.params.filter;

  // if(filter.length == 0)
  // {
  //   res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.OUT_OF_VALUE));
  //   return;
  // }

  //const result = await Bulletin.readAll(filter);

  const result = await Bulletin.readAll();
  
  if(result.length == 0)
  {
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_READ_FAIL));
    return;
  }

  res.status(statusCode.OK).send(utils.successTrue(responseMessage.BOARD_READ_SUCCESS, result));
});

// 게시글 하나 보기
router.get("/:bltIdx", async(req, res) => {
  const bltIdx = req.params.bltIdx;

  if(!bltIdx)
  {
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.OUT_OF_VALUE));
    return;
  }

  const result = await Bulletin.read(bltIdx);

  if(result.length == 0)
  {
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.NO_BOARD));
    return;
  }
  
  res.status(statusCode.OK).send(utils.successTrue(responseMessage.BOARD_READ_SUCCESS, result));
});

// 게시글 수정하기
router.put("/:bltIdx", async(req, res) => {
  const bltIdx = req.params.bltIdx;
  
  if(!bltIdx)
  {
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.OUT_OF_VALUE));
    return;
  }

  const result = await Bulletin.update(req.body, bltIdx);

  if(result.length == 0)
  {
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_UPDATE_FAIL));
    return;
  }

  res.status(statusCode.OK).send(utils.successTrue(responseMessage.BOARD_UPDATE_SUCCESS, result));
});

// 게시글 삭제하기 (error....)
router.delete("/", async(req, res) => {
  const result = await Bulletin.delete(req.body);
  console.log(result);
  if(result.length == 0)
  {
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_DELETE_FAIL));
    return;
  }
  
  res.status(statusCode.OK).send(utils.successTrue(responseMessage.BOARD_DELETE_SUCCESS, result));
});

module.exports = router;