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
        var result = await pool.queryParam_None(`UPDATE ${table3} c INNER JOIN ${table1} u ON c.userIdx = u.userIdx SET c.evalFlag = 3, u.likeNum = u.likeNum + 1  WHERE NOT u.userIdx = '${userIdx}' AND c.roomId ='${roomId}'`);        
        return result;
    },
    
    dislike : async(userIdx, roomId) => {
        var result = await pool.queryParam_None(`UPDATE ${table3} c INNER JOIN ${table1} u ON c.userIdx = u.userIdx SET c.evalFlag = 3, u.dislikeNum = u.dislikeNum + 1  WHERE NOT u.userIdx = '${userIdx}' AND c.roomId ='${roomId}'`);
        return result;
    },
    noEvaluation : async(userIdx) => {
        //const fields = 'name, birth, gender, userImg, userBgImg, intro, likeNum, dislikeNum'
        const result = await pool.queryParam_None(`SELECT roomId FROM ${table3} WHERE roomId LIKE '%${userIdx}'`);
        console.log(result);

        var other = [];
        for ( var i in result ) {
            arr = result[i].roomId.split('_');
            other.push(arr[2]);       
        }
        var others = other.join(',')

        await pool.queryParam_None(`UPDATE ${table3} SET evalFlag =3 WHERE userIdx IN(${others}) and roomId LIKE '%${userIdx}'`);       
        return result; 
    },
};
