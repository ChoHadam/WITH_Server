const pool = require('../module/db/pool');
const table1 = 'User';
const table2 = 'Region';
const table3 = 'Board';

module.exports = {
    recommend: async (regionCode) => {
        // 사용자가 찾고자 하는 지역에서 인기가 많은 6가지 국가를 추천한다.
        var region = String(regionCode).substr(0,2);
        
        if(region == "00")
            region = "0";
            
        const fields = 'regionNameEng, count, regionImgS';
        result =  await pool.queryParam_None(`SELECT ${fields} FROM ${table2} WHERE regionCode LIKE '${region}%' AND regionCode NOT LIKE '${region}00%' AND regionCode NOT LIKE '${region}%00' ORDER BY count desc LIMIT 6`)
        return result;
    },
    
    readMate: async (userIdx) => {
        const fields = 'name, userImg, withDate, withTime';
        const result = await pool.queryParam_None(`
        SELECT ${fields} FROM Chat LEFT JOIN User ON Chat.senderIdx = User.userIdx 
        WHERE (senderIdx = ${userIdx} OR receiverIdx = ${userIdx}) AND User.userIdx != ${userIdx} AND withFlag = 1
        UNION
        SELECT ${fields} FROM Chat LEFT JOIN User ON Chat.receiverIdx = User.userIdx 
        WHERE (senderIdx = ${userIdx} OR receiverIdx = ${userIdx}) AND User.userIdx != ${userIdx} AND withFlag = 1
        ORDER BY withDate DESC, withTime DESC`);
        return result;    
    },

    readBoard: async (boardIdx) => {
        const fields = 'boardIdx, name, userImg, regionName, title';
        const result = await pool.queryParam_None(`SELECT ${fields} FROM ${table3} LEFT JOIN ${table1} ON Board.userIdx = User.userIdx WHERE boardIdx = '${boardIdx}'`);
        return result;    
    },

    readRegion: async (regionCode) => {
        // regionCode Parsing
        var region = regionCode.substr(0,2);
        var semi_region = regionCode.substr(2,2);
        var country = regionCode.substr(4,2);
        
        const fields = 'regionCode, regionName, regionImgS';
        var query = `SELECT ${fields} FROM ${table2} WHERE regionCode LIKE `;
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
    },
    bgImage : async()  => {
        const result = await pool.queryParam_None(`SELECT regionImgH FROM ${table2} WHERE regionImgH is not null`);
        return result;    

    }
};
