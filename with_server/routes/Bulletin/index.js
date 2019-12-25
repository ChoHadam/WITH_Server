const express = require('express');
const router = express.Router({mergeParams: true});

const utils = require('../../module/utils/utils');
const responseMessage = require('../../module/utils/responseMessage');
const statusCode = require('../../module/utils/statusCode');

const Bulletin = require('../../model/board');


// 게시글 생성하기
router.post('/', async (req, res, next) => {
    Bulletin.create(req.body).then(({
      code,
      json
    }) => {
      res.status(code).send(json);
    }).catch(err => {
      console.log(err);
      res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_CREATE_FAIL));
    });
  });

// 게시글 전체 보기
router.get("/", async (req, res, next) => {
    Bulletin.readAll().then(({
        code,
        json
    }) => {
    res.status(code).send(json);
  })
  .catch(err => {
    console.log(err);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_READ_FAIL));
  });
});

// 게시글 하나 보기
router.get("/:bltIdx",async(req, res) => {  
    Bulletin.read(req.params.bltIdx).then(({
        code,
        json
    }) => {
        res.status(code).send(json);
    })
    .catch(err => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_READ_FAIL));
    });
});

// 게시글 수정하기
router.put("/:bltIdx", async(req, res, next) => {
    Bulletin.update(req.body, req.params.bltIdx).then(({
        code,
        json
    }) => {
        res.status(code).send(json);
    })
    .catch(err => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_UPDATE_FAIL));
    });
});

// 게시글 삭제하기
router.delete("/", async(req, res, next) => {
    Bulletin.delete(req.body).then(({
        code,
        json
      }) => {
        res.status(code).send(json);
      }).catch(err => {
        console.log(err);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_DELETE_FAIL));
      });
});

module.exports = router;