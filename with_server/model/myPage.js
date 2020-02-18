const pool = require('../module/db/pool');
const table1 = 'User';
const table2 = 'Board';
const table3 = 'Chat';

module.exports = {
    readProfile: async(userIdx) => {
        const fields = 'name, birth, gender, userImg, userBgImg, intro, likeNum, dislikeNum'
        const result = await pool.queryParam_None(`SELECT ${fields} FROM ${table1} WHERE userIdx = '${userIdx}'`);
        return result;
        
    },

    update: async(json, userIdx) => {
        const conditions = [];
        //console.log(json.intro.intro);
        //console.log(json);

        if (json.userBgImg) conditions.push(`userBgImg = '${json.userBgImg}'`);
        if (json.userImg) conditions.push(`userImg = '${json.userImg}'`);
        if (json.intro) conditions.push(`intro = '${json.intro}'`);
        
        const setStr = conditions.length > 0 ? `SET ${conditions.join(',')}` : '';
        const result = await pool.queryParam_None(`UPDATE ${table1} ${setStr} WHERE userIdx = '${userIdx}'`)
        return result;
            
    },

    readAll: async(userIdx) => {
        const result = await pool.queryParam_None(`SELECT * FROM ${table2} WHERE userIdx = '${userIdx}'`)
        return result;
    },

    confirmUser : async (userIdx) => {
        //존재하는 회원인지 확인    
        const result = await pool.queryParam_None(`SELECT * FROM ${table1} WHERE userIdx = "${userIdx}"`)
        return result;     
    },
    changePw : async(json) =>{
        const setStr = `SET password = '${json.finalPw}', salt = '${json.salt}'`
        const result = await pool.queryParam_None(`UPDATE ${table1} ${setStr} WHERE userIdx = ${json.userIdx}`); 
        
        return result;
    }
};
