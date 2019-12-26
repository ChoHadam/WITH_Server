const statusCode = require('../module/utils/statusCode');
const responseMessage = require('../module/utils/responseMessage');
const authUtil = require('../module/utils/utils');

const pool = require('../module/db/pool');
const moment = require('moment');
const moment_timezone = require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

const table = 'Bulletin';

module.exports = {
    create : async(json) => {
        // uploadTime에 현재 서울 시각 저장
        var newDate = moment().format('YYYY-MM-DD HH:mm:ss');
        json.uploadTime = newDate;

        // region, country 정보만 왔을 경우 (region, semi_region 채우기)
        if(!json.semi_region && json.country)
        {
            const find_result = await pool.queryParam_None(`SELECT semi_region FROM Country WHERE country = '${json.country}'`);
            json.semi_region = find_result[0].semi_region;
        }

        // region, semi_region 정보만 왔을 경우
        else if(!json.country && json.semi_region)
        {
            json.country = "";
        }

        // region 정보만 왔을 경우
        else
        {
            json.semi_region = "";
            json.country = "";
        }

        // 나라, 대륙, 제목, 내용, 작성시간, 동행시작시간, 동행종료시간, 작성자인덱스, 활성화유무, 동행자 수, 동성필터여부
        const fields = 'country, semi_region, region, title, content, uploadTime, startDate, endDate, userIdx, active, withNum, filter';
        const questions = `"${json.country}", "${json.semi_region}", "${json.region}", "${json.title}", "${json.content}", "${json.uploadTime}", "${json.startDate}", "${json.endDate}", "${json.userIdx}", "${json.active}", "${json.withNum}", "${json.filter}"`;
        const result = await pool.queryParam_None(`INSERT INTO ${table}(${fields}) VALUES(${questions})`);
        return result;
    },

    //readAll : async(filter) => {
    readAll : async() => {
        /*console.log(req.headers.region);
        if(req.headers.country)
        {
            country = req.headers.country;
            result = await pool.queryParam_None(`SELECT * FROM ${table} WHERE country = '${country}'`)
        }

        else if(req.headers.semi_region)
        {
            semi_region = req.headers.semi_region;
            result = await pool.queryParam_None(`SELECT * FROM ${table} WHERE semi_region = '${semi_region}'`)
        }
        
        else
        {
            result = await pool.queryParam_None(`SELECT * FROM ${table} WHERE region = '${region}'`)
        }*/

        const result = await pool.queryParam_None(`SELECT * FROM ${table} WHERE active = 1`);
        return result;
    },

    read : async(bltIdx) => {
        const result = await pool.queryParam_None(`SELECT * FROM ${table} WHERE active = 1 AND bltIdx = '${bltIdx}'`);
        return result;
    },

    update : async(json, bltIdx) => {
        const conditions = [];

        if(json.country)
        {
            const find_result = await pool.queryParam_None(`SELECT region, semi_region FROM Country WHERE country = '${json.country}'`);
            json.semi_region = find_result[0].semi_region;
            json.region = find_result[0].region;

            conditions.push(`country = '${json.country}'`);
            conditions.push(`semi_region = '${json.semi_region}'`);
            conditions.push(`region = '${json.region}'`);
        }

        else if(json.semi_region)
        {
            const find_result = await pool.queryParam_None(`SELECT region FROM Country WHERE semi_region = '${json.semi_region}'`);
            json.region = find_result[0].region;
            json.country = "";

            conditions.push(`country = '${json.country}'`);
            conditions.push(`semi_region = '${json.semi_region}'`);
            conditions.push(`region = '${json.region}'`);
        }

        else if(json.region)
        {
            json.semi_region = "";
            json.country = "";

            conditions.push(`country = '${json.country}'`);
            conditions.push(`semi_region = '${json.semi_region}'`);
            conditions.push(`region = '${json.region}'`);
        }

        // if (json.country) conditions.push(`country = '${json.country}'`);
        // if (json.semi_region) conditions.push(`region = '${json.semi_region}'`);
        // if (json.region) conditions.push(`region = '${json.region}'`);
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

    delete : async(json) => {
        const conditions = Object.entries(json).map(it => `${it[0]} = '${it[1]}'`).join(',');
        const whereStr = conditions.length > 0 ? `WHERE ${conditions}` : '';
        const result = await pool.queryParam_None(`DELETE FROM ${table} ${whereStr}`)
        return result;
    }
}