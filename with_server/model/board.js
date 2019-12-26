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
        // uploadTime에 현재 서울 시각 저장
        var newDate = moment().format('YYYY-MM-DD HH:mm:ss');
        json.uploadTime = newDate;

        // 나라, 대륙, 제목, 내용, 작성시간, 동행시작시간, 동행종료시간, 작성자인덱스, 활성화유무, 동행자 수, 동성필터여부
        const fields = 'regionCode, title, content, uploadTime, startDate, endDate, userIdx, withNum, filter';
        const questions = `"${json.regionCode}", "${json.title}", "${json.content}", "${json.uploadTime}", "${json.startDate}", "${json.endDate}", "${json.userIdx}", "${json.withNum}", "${json.filter}"`;
        const result = await pool.queryParam_None(`INSERT INTO ${table}(${fields}) VALUES(${questions})`);
        return result;
    },

    //readAll : async(filter) => {
    readAll : async(regionCode) => {
        // regionCode Parsing
        var region = regionCode.substr(0,2);
        var semi_region = regionCode.substr(2,2);
        var country = regionCode.substr(4,2);
        var result;

        if(country == "00")
        {
            if(semi_region == "00")
            {
                // 대분류에서 찾기
                result = await pool.queryParam_None(`SELECT * FROM ${table} WHERE regionCode LIKE '${region}____' AND active = 1`);
            }

            else
            {
                // 중분류에서 찾기
                result = await pool.queryParam_None(`SELECT * FROM ${table} WHERE regionCode LIKE '${region}${semi_region}__' AND active = 1`);
            }
        }

        else
        {
            // 나라에서 찾기
            result = await pool.queryParam_None(`SELECT * FROM ${table} WHERE regionCode = '${regionCode}' AND active = 1`);
        }

        return result;
    },

    read : async(bltIdx) => {
        const result = await pool.queryParam_None(`SELECT * FROM ${table} WHERE active = 1 AND bltIdx = '${bltIdx}'`);
        return result;
    },

    update : async(json, bltIdx) => {
        const conditions = [];

        if (json.regionCode) conditions.push(`regionCode = '${json.regionCode}'`);
        if (json.title) conditions.push(`title = '${json.title}'`);
        if (json.content) conditions.push(`content = '${json.content}'`);
        if (json.uploadTime) conditions.push(`uploadTime = '${json.uploadTime}'`);
        if (json.startDate) conditions.push(`startDate = '${json.startDate}'`);
        if (json.endDate) conditions.push(`endDate = '${json.endDate}'`);
        if (json.active) conditions.push(`active = '${json.active}'`);
        if (json.withNum) conditions.push(`withNum = '${json.withNum}'`);
        if (json.filter) conditions.push(`filter = '${json.filter}'`);

        const setStr = conditions.length > 0 ? `SET ${conditions.join(',')}` : '';
        const result = await pool.queryParam_None(`UPDATE ${table} ${setStr} WHERE bltIdx = ${bltIdx}`);
        return result;
    },

    search : async(keyword) => {
        const result = await pool.queryParam_None(`SELECT * FROM ${table} WHERE (title LIKE '%${keyword}%' OR content LIKE '%${keyword}%') AND active = 1`)
        return result;
    },

    delete : async(json) => {
        const conditions = Object.entries(json).map(it => `${it[0]} = '${it[1]}'`).join(',');
        const whereStr = conditions.length > 0 ? `WHERE ${conditions}` : '';
        const result = await pool.queryParam_None(`DELETE FROM ${table} ${whereStr}`)
        return result;
    }
}