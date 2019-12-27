const express = require('express');
const router = express.Router({mergeParams: true});
const utils = require('../../module/utils/utils');
const responseMessage = require('../../module/utils/responseMessage');
const statusCode = require('../../module/utils/statusCode');
const Mypage = require('../../model/myPage');
const authUtil = require('../../module/utils/authUtil');

// 마이페이지 보기
router.get("/",authUtil.validToken, async(req, res) => {
    const userIdx = req.decoded.userIdx;
    if(!userIdx)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.OUT_OF_VALUE));
        return;
    }

    const result = await Mypage.readProfile(userIdx);
    /*
    if(result.length == 0)
    {
        res.status(statusCode.BAD_REQUEST).send(utils.successFalse(responseMessage.NO_USER));
        return;
    }
    */

    res.status(statusCode.OK).send(utils.successTrue(responseMessage.MYPAGE_READ_SUCCESS, result));
});

// 마이페이지 수정하기
router.put("/",authUtil.validToken ,async(req, res) => {
    const userIdx = req.decoded.userIdx;
    const intro = req.body.intro;

    if(!userIdx)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.OUT_OF_VALUE));
        return;
    }
    

    const result = await Mypage.update(req.body, userIdx);
    
    if(result.length == 0)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.MYPAGE_UPDATE_FAIL));
        return;
    }
    
    res.status(statusCode.OK).send(utils.successTrue(responseMessage.MYPAGE_UPDATE_SUCCESS, result));

});
// 내가 쓴 게시글 전체 보기
router.get("/boards", authUtil.validToken,async (req, res) => {
    const userIdx = req.decoded.userIdx;
    
    if(!userIdx)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.OUT_OF_VALUE));
        return;
    }

    const result = await Mypage.readAll(userIdx);
    
    if(result.length == 0)
    {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(responseMessage.BOARD_READ_ALL_FAIL));
        return;
    }
    

    res.status(statusCode.OK).send(utils.successTrue(responseMessage.BOARD_READ_ALL_SUCCESS, result));
});


module.exports = router;