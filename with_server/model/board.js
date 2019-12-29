const statusCode = require('../module/utils/statusCode');
const responseMessage = require('../module/utils/responseMessage');
const authUtil = require('../module/utils/utils');

const pool = require('../module/db/pool');
const moment = require('moment');
const moment_timezone = require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

const table = 'Board';

module.exports = {
    create : async(json) => {
        // 나라, 대륙, 제목, 내용, 작성시간, 동행시작시간, 동행종료시간, 작성자인덱스, 활성화유무, 동행자 수, 동성필터여부
        const fields = 'regionCode, title, content, uploadTime, startDate, endDate, userIdx, filter';
        const questions = `"${json.regionCode}", "${json.title}", "${json.content}", "${json.uploadTime}", "${json.startDate}", "${json.endDate}", "${json.userIdx}", "${json.filter}"`;
        let result = await pool.queryParam_None(`INSERT INTO ${table}(${fields}) VALUES(${questions})`);
        result = await pool.queryParam_None(`SELECT * FROM ${table} WHERE userIdx = ${json.userIdx} ORDER BY uploadTime DESC LIMIT 1`);
        return result;
    },

    readAll : async(json) => {
        // regionCode Parsing
        var region = json.regionCode.substr(0,2);
        var semi_region = json.regionCode.substr(2,2);
        var country = json.regionCode.substr(4,2);
        var query;
        
        const fields = 'boardIdx, regionCode, title, uploadTime, startDate, endDate, withNum, filter, userImg';
        if(country == "00")
        {
            if(semi_region == "00")
            {
                // 대분류에서 찾기
                query = `SELECT ${fields} FROM ${table} WHERE regionCode LIKE '${region}%' AND active = 1`;
            }
            else
            {
                // 중분류에서 찾기
                query = `SELECT ${fields} FROM ${table} WHERE regionCode LIKE '${region}${semi_region}%' AND active = 1`;
            }
        }
        else
        {
            // 나라에서 찾기
            query = `SELECT ${fields} FROM ${table} WHERE regionCode = '${regionCode}' AND active = 1`;
        }

        // 날짜 필터 적용된 경우
        if(json.startDate!='0' && json.endDate!='0')
        {
            query += ` AND (startDate >= '${json.startDate}' AND endDate <= '${json.endDate}')`;
        }
        // 검색 필터 적용된 경우

        if(json.keyword!='0')
        {
            query += ` AND (title LIKE '%${json.keyword}%' OR content LIKE '%${json.keyword}%')`;
        }

        var front_query = query.substr(0, 104);
        var back_query = query.substr(103, query.length);
        query = front_query + `NATURAL JOIN User NATURAL JOIN Region` + back_query;

        // 동성 필터 적용된 경우
        if(json.filter!='0')
        {
            query += ` AND gender = ${json.gender} ORDER BY uploadTime desc`;
        }
        // 동성 필터 적용되지 않은 경우
        else
        {
            query += ` AND (filter = -1 OR (filter = 1 AND gender = ${json.gender})) ORDER BY uploadTime desc`;
        }
        console.log(query);
        const result = await pool.queryParam_None(query);

        return result;
    },

    read : async(boardIdx) => {
        const fields = 'boardIdx, regionCode, title, content, startDate, endDate, Board.userIdx, name, birth, gender, userImg, intro';

        const result = await pool.queryParam_None(`SELECT ${fields} FROM ${table} LEFT JOIN User ON Board.userIdx = User.userIdx WHERE active = 1 AND boardIdx = '${boardIdx}'`);
        
        // birth field 값 나이로 변환하여 반환.
        const birthYear = result[0].birth.split("-");
        const currentYear = moment().format('YYYY');
        const age = currentYear - birthYear[0] + 1;

        result[0].birth = age;
        return result;
    },

    update : async(json, boardIdx) => {
        const conditions = [];

        if (json.regionCode) conditions.push(`regionCode = '${json.regionCode}'`);
        if (json.title) conditions.push(`title = '${json.title}'`);
        if (json.content) conditions.push(`content = '${json.content}'`);
        if (json.startDate) conditions.push(`startDate = '${json.startDate}'`);
        if (json.endDate) conditions.push(`endDate = '${json.endDate}'`);
        if (json.filter) conditions.push(`filter = '${json.filter}'`);

        const setStr = conditions.length > 0 ? `SET ${conditions.join(',')}` : '';
        const result = await pool.queryParam_None(`UPDATE ${table} ${setStr} WHERE boardIdx = ${boardIdx}`);
        return result;
    },

    activate : async(boardIdx) => {
        const result = await pool.queryParam_None(`UPDATE ${table} SET active = '1' WHERE boardIdx = ${boardIdx}`);
        return result;
    },

    delete : async(boardIdx) => {
        /*const conditions = Object.entries(json).map(it => `${it[0]} = '${it[1]}'`).join(',');
        const whereStr = conditions.length > 0 ? `WHERE ${conditions}` : '';
        const result = await pool.queryParam_None(`DELETE FROM ${table} ${whereStr}`)*/
        const result = await pool.queryParam_None(`DELETE FROM ${table} WHERE boardIdx = ${boardIdx}`);
        return result;
    }
}