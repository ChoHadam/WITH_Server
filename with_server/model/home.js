const pool = require('../module/db/pool');
const table1 = 'User';
const table2 = 'Region';
const table3 = 'Board';

module.exports = {
    recommend: async (regionCode) => {
        var region = String(regionCode).substr(0,2);
        result =  await pool.queryParam_None(`SELECT regionName FROM ${table2} WHERE regionCode LIKE '%${region}%' ORDER BY count LIMIT 6`)
        return result;
    },
    readMate: async (userIdx) => {
        const result = await pool.queryParam_None(`SELECT name, userImg FROM ${table1} WHERE userIdx = '${userIdx}'`);
        return result;    
    },
    readBoard: async (boardIdx) => {
        const result = await pool.queryParam_None(`SELECT name, userImg, regionCode, title FROM ${table3} LEFT JOIN ${table1} ON Board.userIdx = User.userIdx WHERE boardIdx = '${boardIdx}'`);
        return result;    
    },
    readAllRegion: async () => {
        const result = await pool.queryParam_None(`SELECT * FROM Region`);
        return result; 
    }
};
