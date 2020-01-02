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

        if (json.intro) conditions.push(`intro = '${json.intro}'`);
        if (json.userImg) conditions.push(`userImg = '${json.userImg}'`);
        if (json.userBgImg) conditions.push(`userBgImg = '${json.userBgImg}'`);
        
        const setStr = conditions.length > 0 ? `SET ${conditions.join(',')}` : '';
        const result = await pool.queryParam_None(`UPDATE ${table1} ${setStr} WHERE userIdx = '${userIdx}'`)
        return result;
            
    },

    readAll: async(userIdx) => {
        const result = await pool.queryParam_None(`SELECT * FROM ${table2} WHERE userIdx = '${userIdx}'`)
        return result;
    },

    like : async(userIdx, roomId) => {
        await pool.queryParam_None(`UPDATE ${table3} LEFT JOIN ${table1} ON ${table3}.userIdx = ${table1}.userIdx SET ${table3}.evalFlag = 3, ${table1}.likeNum = ${table1}.likeNum + 1 WHERE ${table3}.userIdx != ${userIdx} AND ${table3}.roomId ='${roomId}'`);        
        return;
    },
    
    dislike : async(userIdx, roomId) => {
        await pool.queryParam_None(`UPDATE ${table3} LEFT JOIN ${table1} ON ${table3}.userIdx = ${table1}.userIdx SET ${table3}.evalFlag = 3, ${table1}.dislikeNum = ${table1}.dislikeNum + 1 WHERE ${table3}.userIdx != ${userIdx} AND ${table3}.roomId ='${roomId}'`);
        return;
    },
    noEvaluation : async(userIdx, roomId) => {
        //const fields = 'name, birth, gender, userImg, userBgImg, intro, likeNum, dislikeNum'
        await pool.queryParam_None(`UPDATE ${table3} LEFT JOIN ${table1} ON ${table3}.userIdx = ${table1}.userIdx SET ${table3}.evalFlag = 3 WHERE ${table3}.userIdx != ${userIdx} AND ${table3}.roomId ='${roomId}'`);      
        return;
    },
};
