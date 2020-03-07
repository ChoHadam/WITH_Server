const statusCode = require('../../module/utils/statusCode');
const responseMessage = require('../../module/utils/responseMessage');
const utils = require('../../module/utils/utils');
const jwt = require('./jwt');

const authMiddleware = {
    //미들웨어로 token이 있는지 없는지 확인하고 token이 있다면 jwt.verify함수를 이용해서 토큰 hash를 확인하고 토큰에 들어있는 정보 해독
    validToken: async(req, res, next) => {
        const token = req.headers.token;
        if(!token){
            return res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.EMPTY_TOKEN));
        } else{
            const user = jwt.verify(token);
              
            if(user == -3) {
                return res.status(statusCode.FORBIDDEN).send(utils.successFalse(statusCode.FORBIDDEN, responseMessage.EXPIRED_TOKEN));
            }
            else if(user == -2) {
                return res.status(statusCode.FORBIDDEN).send(utils.successFalse(statusCode.FORBIDDEN, responseMessage.INVALID_TOKEN));
            }

            req.decoded = user;            
            next();
        }
    },

    validRefreshToken: async(req, res, next) => {
        const token = req.headers.token;
        if(!token){
            return res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.EMPTY_TOKEN));
        } else{
            const user = jwt.verifyRefresh(token);
              
            if(user == -3) {
                return res.status(statusCode.FORBIDDEN).send(utils.successFalse(statusCode.FORBIDDEN, responseMessage.EXPIRED_TOKEN));
            }
            else if(user == -2) {
                return res.status(statusCode.FORBIDDEN).send(utils.successFalse(statusCode.FORBIDDEN, responseMessage.INVALID_TOKEN));
            }

            req.decoded = user;            
            next();
        }
    }
};

module.exports = authMiddleware;