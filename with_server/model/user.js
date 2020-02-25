const pool = require('../module/db/pool');
const table = 'User';

const user = {
    signup : async (json) => {
        //아이디, 비번, 이름, 생일, 성별, 프로필사진
        const fields = 'userId, password, salt, name, birth, gender, userImg, interest1, interest2, interest3';
        var questions = `"${json.userId}","${json.finalPw}","${json.salt}","${json.name}","${json.birth}","${json.gender}","${json.userImg}" `;
        if (json.interest1) questions +=`,"${json.interest1}"`
        else questions += `, null `
        if (json.interest2) questions +=`,"${json.interest2}"`
        else questions += `, null `
        if (json.interest3) questions +=`,"${json.interest3}"`
        else questions += `, null`    
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
    },
    changePw : async (json) => {
        //임시 비밀번호 사용자 이메일로 전송후 디비 업데이트
        const setStr = `SET password = '${json.tempPw}', salt = '${json.salt}'`
        const result = await pool.queryParam_None(`UPDATE ${table1} ${setStr} WHERE userIdx = '${json.userIdx}'`)
        return result;
    }
}

module.exports = user;