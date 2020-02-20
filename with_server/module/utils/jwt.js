const jwt = require('jsonwebtoken');
const {secretOrPrivateKey, secretOrRefreshKey} = require('../../config/secretKey');

const options = {
    algorithm: "HS256",
    expiresIn: "1d",
    issuer: "withDev"
}

const refreshOptions = {
    algorithm: "HS256",
    expiresIn: "1y",
    issuer: "withDev"
}
module.exports = {
    sign: (user) => {
        const accessPayload = {
            userIdx : user.userIdx,
            name : user.name,
            gender : user.gender
        };

        const refreshPayload = {
            userIdx : user.userIdx
        };

        const result = {
            accessToken: jwt.sign(accessPayload, secretOrPrivateKey, options),
            refreshToken: jwt.sign(refreshPayload, secretOrRefreshKey, refreshOptions)
        };

        return result;
    },

    renew: (user) => {
        const accessPayload = {
            userIdx : user.userIdx,
            name : user.name,
            gender : user.gender
        };

        const result = {
            accessToken: jwt.sign(accessPayload, secretOrPrivateKey, options),
        };

        return result;
    },

    verify: (accessToken) => {
        let decoded;
        try{
            decoded = jwt.verify(accessToken,secretOrPrivateKey);
        } catch (err){
            if (err.message === 'jwt expired') {//유효기간 만료
                return -3;
            } else if (err.message === 'invalid token') {//잘못된 token
                return -2;
            } else {
                return -2;
            }
        }
        return decoded;//error가 없을 시에 decoded로 return을 한다. 
    },

    verifyRefresh: (refreshToken) => {
        let decoded;
        try{
            decoded = jwt.verify(refreshToken,secretOrRefreshKey);
        } catch (err){
            if (err.message === 'jwt expired') {//유효기간 만료
                return -3;
            } else if (err.message === 'invalid token') {//잘못된 token
                return -2;
            } else {
                return -2;
            }
        }
        return decoded;//error가 없을 시에 decoded로 return을 한다. 
    }
} 
