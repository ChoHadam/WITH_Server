const pool = require('../module/db/pool');
const table1 = 'User';
const table2 = 'Region';
const table3 = 'Board'
module.exports = {
    recommend: async(userIdx) => {
        const record = await pool.queryParam_None(`SELECT record FROM ${table1} WHERE userIdx = '${userIdx}'`);
        var region = String(record).substr(0,2);
        var semi_region = String(record).substr(2,2);
        var country = String(record).substr(4,2);
        var result;
        
        // 모든 분류 출력
        if(region == "00")
        {
            result =  await pool.queryParam_None(`SELECT * FROM ${table2} ORDER BY count LIMIT 6`)
        }
        else result = await pool.queryParam_None(`SELECT * FROM ${table2} WHERE regionCode LIKE '${region}____' ORDER BY count LIMIT 6`);
    },

    readMate: async(userIdx) => {
        const result = await pool.queryParam_None(`SELECT name, userImg FROM ${table1} WHERE userIdx = '${userIdx}'`);
        return result;    
    }
};
