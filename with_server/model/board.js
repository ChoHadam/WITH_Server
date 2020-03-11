const pool = require('../module/db/pool');

const cron = require('node-cron');
const moment = require('moment');
const moment_timezone = require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

const table1 = 'Board';
const table2 = 'User';
const table3 = 'Region';
const table4 = 'Interest';

module.exports = {
    create : async (json) => {
        const result = await pool.queryParam_None(`CALL create_board("${json.regionCode}", "${json.title}", "${json.content}", "${json.uploadTime}", "${json.startDate}", "${json.endDate}", ${json.userIdx}, ${json.filter})`);

        // 게시글 생성하지 못한 경우
        if(result == -1)
            return result;

        result[0][0].startDate = moment(result[0][0].startDate, 'YYYY-MM-DD').format('YYYY년 MM월 DD일');
        result[0][0].endDate = moment(result[0][0].endDate, 'YYYY-MM-DD').format('YYYY년 MM월 DD일');

        // uploadTime "n분 전/n시간 전/n일 전"으로 수정하여 반환
        var postTerm = moment().diff(result[0][0].uploadTime, "Minutes");

        if(postTerm < 1) {
            result[0][0].uploadTime = "방금";
        }
        else if(postTerm < 60) {
            result[0][0].uploadTime = `${postTerm}분 전`;
        }
        else if(postTerm < 1440) {
            postTerm = moment().diff(result[0][0].uploadTime,"Hours");
            result[0][0].uploadTime = `${postTerm}시간 전`;
        }
        else {
            postTerm = moment().diff(result[0][0].uploadTime,"Days");
            result[0][0].uploadTime = `${postTerm}일 전`;
        }

        // birth를 나이로 변환하여 반환
        postTerm = moment().diff(result[0][0].birth, "Year");
        result[0][0].age = postTerm + 1;
        delete result[0][0].birth;

        return result[0][0];
    },

    readAll : async (json) => {
        // regionCode Parsing
        console.log(json.regionCode);
        var region = json.regionCode.substr(0,2);
        var semi_region = json.regionCode.substr(2,2);
        var country = json.regionCode.substr(4,2);
        var query;
        const fields = 'boardIdx, regionCode, regionName, title, uploadTime, startDate, endDate, withNum, filter, userImg, auth';
        query = `SELECT ${fields} FROM ${table1} NATURAL JOIN ${table2} NATURAL JOIN ${table3} WHERE active = 1 AND regionCode LIKE`;

        if(country == "00"){
            if(semi_region == "00"){
                // 대분류에서 찾기
                query += ` '${region}%'`;
            }
            else{
                // 중분류에서 찾기
                query += ` '${region}${semi_region}%'`;
            }
        }
        else{
            // 나라에서 찾기
            query += ` '${json.regionCode}'`;
        }

        // 날짜 필터 적용된 경우
        if(json.startDate != '0' && json.endDate != '0'){            
            query += ` AND (startDate <= '${json.endDate}' AND endDate >= '${json.startDate}' OR startDate <= '${json.EndDate}' OR endDate >= '${json.startDate}')`;
        }

        // 검색 필터 적용된 경우
        if(json.keyword != '0'){
            const decode_keyword = decodeURI(json.keyword);
            query += ` AND (title LIKE '%${decode_keyword}%' OR content LIKE '%${decode_keyword}%')`;
        }

        /*var front_query = query.substr(0, 116);
        var back_query = query.substr(115, query.length);
        query = front_query + `NATURAL JOIN User NATURAL JOIN Region` + back_query;*/

        if(json.filter != -1){
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
        const fields = 'boardIdx, regionCode, regionName, title, content, uploadTime, startDate, endDate, active, withNum, filter, Board.userIdx, name, birth, gender, userImg, interest, auth';
        var result = await pool.queryParam_None(`SELECT ${fields} FROM ${table1} NATURAL JOIN ${table2} NATURAL JOIN ${table3} WHERE boardIdx = ${boardIdx}`);
        
        if(result.length != 0) {
            const interestResult = await pool.queryParam_None(`SELECT * FROM ${table4} WHERE intIdx IN(${result[0].interest})`);
            const interestArr = new Array();
            delete result[0].interest;

            if(interestResult.length == 0)
                result[0].interest = null;
            else{
                for(var i = 0; i < interestResult.length; i++) {
                    interestArr[i] = interestResult[i].interests;
                }
                result[0].interest = interestArr;
            }
        }
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

    update : async (json, boardIdx, userIdx) => {
        const result = await pool.queryParam_None(`CALL update_board(${userIdx}, ${boardIdx}, "${json.regionCode}", "${json.title}", "${json.content}", "${json.startDate}", "${json.endDate}", "${json.filter}")`);

        if(result[0][0].result == 1) {
            result[0][0].startDate = moment(result[0][0].startDate, 'YYYY-MM-DD').format('YYYY년 MM월 DD일');
            result[0][0].endDate = moment(result[0][0].endDate, 'YYYY-MM-DD').format('YYYY년 MM월 DD일');
    
            // uploadTime "n분 전/n시간 전/n일 전"으로 수정하여 반환
            var postTerm = moment().diff(result[0][0].uploadTime, "Minutes");
    
            if(postTerm < 1) {
                result[0][0].uploadTime = "방금";
            }
            else if(postTerm < 60) {
                result[0][0].uploadTime = `${postTerm}분 전`;
            }
            else if(postTerm < 1440) {
                postTerm = moment().diff(result[0][0].uploadTime,"Hours");
                result[0][0].uploadTime = `${postTerm}시간 전`;
            }
            else {
                postTerm = moment().diff(result[0][0].uploadTime,"Days");
                result[0][0].uploadTime = `${postTerm}일 전`;
            }
    
            // birth를 나이로 변환하여 반환
            postTerm = moment().diff(result[0][0].birth, "Year");
            result[0][0].age = postTerm + 1;
            delete result[0][0].birth;
    
            return result[0][0];
        }

        return result[0][0];
    },

    activate : async (boardIdx, userIdx) => {
        const result = await pool.queryParam_None(`CALL activate_board(${boardIdx}, ${userIdx})`);
        return result[0][0].result;
    }
}

cron.schedule('0 12 * * *', async function(){     
    // 매일 자정에 날짜를 확인해 마감처리 한다.      
    var currentTime = moment().format('YYYY-MM-DD');    
    const result = await pool.queryParam_None(`UPDATE ${table1} SET active = '-1' WHERE endDate < '${currentTime}'`);    
});

