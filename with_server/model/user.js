const pool = require('../module/db/pool');
const table = 'User';

const user = {
    signup : async (json) => {
        //아이디, 비번, 이름, 생일, 성별, 프로필사진
        const fields = 'userId, password, salt, name, birth, gender, userImg, interest1, interest2, interest3';
        const questions = `"${json.userId}","${json.finalPw}","${json.salt}","${json.name}","${json.birth}","${json.gender}","${json.userImg}", "${json.interest1}", "${json.interest2}", "${json.interest3}" `;        
        const result = await pool.queryParam_None(`INSERT INTO ${table}(${fields})VALUES(${questions})`)
        return result;
    },
    checkUser : async (userId) => {
        //존재하는 회원인지 확인    
        const result = await pool.queryParam_None(`SELECT * FROM ${table} WHERE userId = "${userId}"`);
        return result;
    },
    returnUser : async (userIdx) => {
        // userIdx에 해당하는 유저 정보 반환
        const result = await pool.queryParam_None(`SELECT * FROM ${table} WHERE userIdx = ${userIdx}`);
        return result;
    }
}

module.exports = user;