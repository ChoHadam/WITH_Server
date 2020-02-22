const pool = require('../module/db/pool');

const cron = require('node-cron');
const moment = require('moment');
const moment_timezone = require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

const table1 = 'Board';
const table2 = 'User';
const table3 = 'Region';

module.exports = {
    create : async (json) => {
        // 나라, 대륙, 제목, 내용, 작성시간, 동행시작시간, 동행종료시간, 작성자인덱스, 활성화유무, 동행자 수, 동성필터여부
        const fields = 'regionCode, regionName, title, content, uploadTime, startDate, endDate, userIdx, filter';
        const regionName = await pool.queryParam_None(`SELECT regionName FROM ${table3} WHERE regionCode = '${json.regionCode}'`);
        if(json.regionCode.substr(4,2) != 00){
            const countIncrease = await pool.queryParam_None(`UPDATE ${table3} SET count = count + 1  WHERE regionCode = '${json.regionCode}'`);
        }        
        const questions = `"${json.regionCode}", "${regionName[0].regionName}", "${json.title}", "${json.content}", "${json.uploadTime}", "${json.startDate}", "${json.endDate}", "${json.userIdx}", "${json.filter}"`;
        let result = await pool.queryParam_None(`INSERT INTO ${table1}(${fields}) VALUES(${questions})`);

        return result;
    },

    readAll : async (json) => {
        // regionCode Parsing
        var region = json.regionCode.substr(0,2);
        var semi_region = json.regionCode.substr(2,2);
        var country = json.regionCode.substr(4,2);
        var query;
        const fields = 'boardIdx, regionCode, regionName, title, uploadTime, startDate, endDate, withNum, filter, userImg';

        if(country == "00"){
            if(semi_region == "00"){
                // 대분류에서 찾기
                query = `SELECT ${fields} FROM ${table1} WHERE regionCode LIKE '${region}%' AND active = 1`;
            }
            else{
                // 중분류에서 찾기
                query = `SELECT ${fields} FROM ${table1} WHERE regionCode LIKE '${region}${semi_region}%' AND active = 1`;
            }
        }
        else{
            // 나라에서 찾기
            query = `SELECT ${fields} FROM ${table1} WHERE regionCode = '${json.regionCode}' AND active = 1`;
        }

        // 날짜 필터 적용된 경우
        if(json.startDate != '0' && json.endDate != '0'){
            //query += ` AND (startDate >= '${json.startDate}' AND endDate <= '${json.endDate}')`;
            query += ` AND (startDate <= '${json.endDate}' AND endDate >= '${json.startDate}')`;
        }

        // 검색 필터 적용된 경우
        if(json.keyword != '0'){
            const decode_keyword = decodeURI(json.keyword);
            query += ` AND (title LIKE '%${decode_keyword}%' OR content LIKE '%${decode_keyword}%')`;
        }

        var front_query = query.substr(0, 116);
        var back_query = query.substr(115, query.length);
        query = front_query + `NATURAL JOIN User NATURAL JOIN Region` + back_query;

        if(json.filter!='0'){
            // 동성 필터 적용된 경우
            query += ` AND gender = ${json.gender} ORDER BY uploadTime desc`;
        }
        else{
            // 동성 필터 적용되지 않은 경우
            query += ` AND (filter = -1 OR (filter = 1 AND gender = ${json.gender})) ORDER BY uploadTime desc`;
        }

        const result = await pool.queryParam_None(query);
        
        // uploadTime "n분 전/n시간 전/n일 전"으로 수정하여 반환
        for(var i in result){
            var postTerm = moment().diff(result[i].uploadTime,"Minutes");

            if(postTerm < 1){
                result[i].uploadTime = "방금";
            }
            else if(postTerm < 60){
                result[i].uploadTime = `${postTerm}분 전`;
            }
            else if(postTerm < 1440){
                postTerm = moment().diff(result[i].uploadTime,"Hours");
                result[i].uploadTime = `${postTerm}시간 전`;
            }
            else{
                postTerm = moment().diff(result[i].uploadTime,"Days");
                result[i].uploadTime = `${postTerm}일 전`;
            }
        }
        return result;
    },

    read : async (boardIdx, userIdx) => {
        const fields = 'boardIdx, regionCode, regionName, title, content, uploadTime, startDate, endDate, active, withNum, filter, Board.userIdx, name, birth, gender, userBgImg, userImg, intro, likeNum, dislikeNum';
        var result = await pool.queryParam_None(`SELECT ${fields} FROM ${table1} NATURAL JOIN ${table2} NATURAL JOIN ${table3} WHERE boardIdx = ${boardIdx}`);
        const result_sub = await pool.queryParam_None(`SELECT withFlag FROM Chat WHERE boardIdx = ${boardIdx} AND Chat.userIdx = ${userIdx}`);
        if(result_sub.length==0){
            result[0].withFlag = -1;
        }else{
            result[0].withFlag = result_sub[0].withFlag;
        }
        // uploadTime "n분 전/n시간 전/n일 전"으로 수정하여 반환
        var postTerm = moment().diff(result[0].uploadTime,"Minutes");
        
        if(postTerm < 1){
            result[0].uploadTime = "방금";
        }
        else if(postTerm < 60){
            result[0].uploadTime = `${postTerm}분 전`;
        }
        else if(postTerm < 1440){
            postTerm = moment().diff(result[0].uploadTime,"Hours");
            result[0].uploadTime = `${postTerm}시간 전`;
        }
        else{
            postTerm = moment().diff(result[0].uploadTime,"Days");
            result[0].uploadTime = `${postTerm}일 전`;
        }

        // birth field 값 나이로 변환하여 반환.
        const birthYear = result[0].birth.split("-");
        const currentYear = moment().format('YYYY');
        const age = currentYear - birthYear[0] + 1;

        result[0].birth = age;
        return result;
    },

    update : async (json, boardIdx) => {
        const conditions = [];

        // regionCode에 맞는 regionName을 query에 추가한다.
        if (json.regionCode){
            conditions.push(`regionCode = '${json.regionCode}'`);
            const result = await pool.queryParam_None(`SELECT regionName FROM Region WHERE regionCode = ${json.regionCode}`);
            conditions.push(`regionName = '${result[0].regionName}'`);
            //conditions.push(`regionName = (SELECT regionName FROM Region WHERE regionCode = ${json.regionCode})`);
        }
        // 변경 파라미터가 존재하면 push 한다.
        if (json.title) conditions.push(`title = '${json.title}'`);
        if (json.content) conditions.push(`content = '${json.content}'`);
        if (json.startDate) conditions.push(`startDate = '${json.startDate}'`);
        if (json.endDate) conditions.push(`endDate = '${json.endDate}'`);
        if (json.filter) conditions.push(`filter = '${json.filter}'`);

        const setStr = conditions.length > 0 ? `SET ${conditions.join(',')}` : '';
        const result = await pool.queryParam_None(`UPDATE ${table1} ${setStr} WHERE boardIdx = ${boardIdx}`);
        return result;
    },

    activate : async (boardIdx, userIdx) => {
        // var activeState;
        // const query = await pool.queryParam_None(`SELECT * FROM ${table1} WHERE boardIdx = ${boardIdx} AND userIdx = ${userIdx}`);    
        // if(query[0].active == 1){
        //     activeState  = -1;
        // }
        // else{
        //     activeState  = 1;
        // }
        // const result = await pool.queryParam_None(`UPDATE ${table1} SET active = '${activeState}' WHERE boardIdx = ${boardIdx} AND userIdx = ${userIdx}`);
        // return result;

        // pool.query('CALL activate_board()', function(err, rows) {
        //     if (err)
        //         throw err;
        //     console.log('procedure success\n');
        //     console.log(rows);
            
        //     return rows;
        // })

        const result = await pool.queryParam_None(`CALL activate_board(${boardIdx}, ${userIdx})`);
        console.log(result);
        return result;
    }
}

cron.schedule('0 12 * * *', async function(){     
    // 매일 자정에 날짜를 확인해 마감처리 한다.      
    var currentTime = moment().format('YYYY-MM-DD');    
    const result = await pool.queryParam_None(`UPDATE ${table1} SET active = '-1' WHERE endDate < '${currentTime}'`);    
});

