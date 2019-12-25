const pool = require('../module/db/pool');
const table = 'User';

const user = {
    signup : async (json) => {
        //아이디, 비번, 이름, 생일, 성별, 프로필사진
        const fields = 'userId, password, salt, name, birth, gender, userImg';
        const questions = `"${json.userId}","${json.finalPw}","${json.salt}","${json.name}","${json.birth}","${json.gender}","${json.userImg}"`;        
        const result = await pool.queryParam_None(`INSERT INTO ${table}(${fields})VALUES(${questions})`)
        return result;
    },
    checkUser : async (userId) => {
        //존재하는 회원인지 확인    
        const result = await pool.queryParam_None(`SELECT * FROM ${table} WHERE userId = "${userId}"`)
        return result;     
    }
}

module.exports = user;