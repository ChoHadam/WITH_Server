const statusCode = require('../module/utils/statusCode');
const responseMessage = require('../module/utils/responseMessage');
const authUtil = require('../module/utils/utils');
const db = require('../module/db/pool');
const table = 'user';

const user = {
    signup : async(json) => {
        //아이디, 비번, 이름, 생일, 성별, 프로필사진
        const fields = 'userId,password,salt,name,birth,gender,img';
        const questions = `?,?,?,?,?,?`;       
        const values = [json.userId,json.password,json.salt,json.name,json.birth,json.gender,json.img];        
        //const values = [`"${json.userId}","${json.password}","${json.name}","${json.birth},","${json.gender}," `];        
        const signupQuery = `INSERT INTO ${table}(${fields}) VALUES(${questions})`;
        const result = await db.queryParam_Parse(signupQuery, values);
        return result;
    },
    checkUser : async(userId) =>{
        //존재하는 회원인지 확인          
        const checkUserQuery = `SELECT * FROM ${table} WHERE userID = ${userId}`;
        const result = await db.queryParam_None(checkUserQuery);
        return result;
    },
    signin : async(json) => {
        //아이디,비번
        
    }
}

module.exports = user;