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
    readRegion: async (regionCode) => {
        // regionCode Parsing
        var region = regionCode.substr(0,2);
        var semi_region = regionCode.substr(2,2);
        var country = regionCode.substr(4,2);
        var query = `SELECT regionCode, regionName FROM Region WHERE regionCode LIKE `;
        if(country == "00")
        {
            if(semi_region == "00")
            {
                // 대분류에서 찾기
                query += `'${region}%'`;
            }
            else
            {
                // 중분류에서 찾기
                query += `'${region}${semi_region}%'`;
            }
        }
        const result = await pool.queryParam_None(query);
        return result; 
    }
};
