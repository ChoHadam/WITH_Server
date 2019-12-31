const pool = require('../module/db/pool');
const table1 = 'User';
const table2 = 'Region';
const table3 = 'Board';

module.exports = {
    recommend: async (regionCode) => {
        var region = String(regionCode).substr(0,2);
        const fields = 'regionNameEng, regionImg';
        result =  await pool.queryParam_None(`SELECT ${fields} FROM ${table2} WHERE regionCode LIKE '%${region}%' ORDER BY count desc LIMIT 6`)
        return result;
    },
    readMate: async (userIdx) => {
        const fields = 'name, userImg';
        const result = await pool.queryParam_None(`SELECT ${fields} FROM ${table1} WHERE userIdx = '${userIdx}'`);
        return result;    
    },
    readBoard: async (boardIdx) => {
        const fields = 'boardIdx, name, userImg, regionName, title';
        const result = await pool.queryParam_None(`SELECT ${fields} title FROM ${table3} LEFT JOIN ${table1} ON Board.userIdx = User.userIdx WHERE boardIdx = '${boardIdx}'`);
        return result;    
    },
    readRegion: async (regionCode) => {
        // regionCode Parsing
        var region = regionCode.substr(0,2);
        var semi_region = regionCode.substr(2,2);
        var country = regionCode.substr(4,2);
        
        const fields = 'regionCode, regionName, regionImg';
        var query = `SELECT ${fields} FROM Region WHERE regionCode LIKE `;
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
