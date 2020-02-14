const jwt = require('jsonwebtoken');
require('dotenv').config();
//const secretOrPrivateKey = 'jwtSecretKey'; 원래꺼
//const secretOrPrivateKey = process.env.JWT_SECRET_KEY;   ************확인필요**************

const options = {
    algorithm: "HS256",
    expiresIn: "1d",
    issuer: "withDev"
}

const refreshOptions = {
    algorithm: "HS256",
    expiresIn: "1d",
    issuer: "withDev"
}
module.exports = {
    sign: (user) => {
        const payload = {
            userIdx : user.userIdx,
            name : user.name,
            gender : user.gender
        };
        const result = {
            token: jwt.sign(payload, process.env.JWT_SECRET_KEY, options)           
        };

        return result;
    },    

    verify: (token) => {

        let decoded;
        try{
            decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);
        } catch (err){
            if (err.message === 'jwt expired') {//유효기간 만료
                console.log('expired token');
                return -3;
            } else if (err.message === 'invalid token') {//잘못된 token
                console.log('invalid token');
                return -2;
            } else {
                console.log("error");
                return -2;
            }
        }
        return decoded;//error가 없을 시에 decoded로 return을 한다. 
        }

    } 
