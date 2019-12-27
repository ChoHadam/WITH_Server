const pool = require('../module/db/pool');
const table1 = 'User';
const table2 = 'Board';

module.exports = {
    readProfile: async(userIdx) => {
        const fields = 'name, userImg, hashTag, intro'
        const result = await pool.queryParam_None(`SELECT ${fields} FROM ${table1} WHERE userIdx = ${userIdx}`);
        return result;
        
    },

    update: async(json, userIdx) => {
        const conditions = [];

        if (json.intro) conditions.push(`intro = '${json.intro}'`);
        if (json.userImg) conditions.push(`userImg = '${json.userImg}'`);
        if (json.hashTag) conditions.push(`hashTag = '${json.hashTag}'`);
        
        const setStr = conditions.length > 0 ? `SET ${conditions.join(',')}` : '';
        const result = await pool.queryParam_None(`UPDATE ${table1} ${setStr} WHERE userIdx = '${userIdx}'`)
        return result;
            
    },

    readAll: async(userIdx) => {
        const result = await pool.queryParam_None(`SELECT * FROM ${table2} WHERE userIdx = '${userIdx}'`)
        return result;    
    },

    read: async(bltIdx) => {
        const result = await pool.queryParam_None(`SELECT * FROM ${table2} WHERE bltIdx = '${bltIdx}'`)
        return result;    
    }
};
