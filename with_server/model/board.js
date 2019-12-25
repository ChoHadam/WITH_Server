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

        // 나라, 대륙, 제목, 내용, 작성시간, 동행시작시간, 동행종료시간, 작성자인덱스, 활성화유무, 동행자 수, 동성필터여부
        const fields = 'country, region, title, content, uploadTime, startDate, endDate, userIdx, active, withNum, filter';
        const questions = `"${json.country}", "${json.region}", "${json.title}", "${json.content}", "${json.uploadTime}", "${json.startDate}", "${json.endDate}", "${json.userIdx}", "${json.active}", "${json.withNum}", "${json.filter}"`;
        const result = await pool.queryParam_None(`INSERT INTO ${table}(${fields}) VALUES(${questions})`);
        return result;
    },

    //readAll : async(filter) => {
    readAll : async() => {
        // // 동성필터 적용한 경우
        // if(filter == 1)
        // {
        //     const result = await pool.queryParam_None(`SELECT bltIdx FROM Bulletin, User WHERE Bulletin.userIdx = User.userIdx AND User.gender = ${gender}`);
        //     return result;
        // }
        // // 동성필터 적용하지 않은 경우
        // else
        // {
        //     const result = await pool.queryParam_None(`SELECT bltIdx FROM Bulletin, User WHERE Bulletin.filter = 0 UNION SELECT bltIdx FROM Bulletin, User WHERE Bulletin.filter = 1 AND Bulletin.userIdx = User.userIdx AND User.gender = ${gender}`);
        //     return result;
        // }

        const result = await pool.queryParam_None(`SELECT * FROM ${table}`);
        return result;
    },

    read : async(bltIdx) => {
        const result = await pool.queryParam_None(`SELECT * FROM ${table} WHERE bltIdx = '${bltIdx}'`);
        return result;
    },

    update : async(json, bltIdx) => {
        const conditions = [];

        if (json.country) conditions.push(`country = '${json.country}'`);
        if (json.region) conditions.push(`region = '${json.region}'`);
        if (json.title) conditions.push(`title = '${json.title}'`);
        if (json.content) conditions.push(`content = '${json.content}'`);
        if (json.uploadTime) conditions.push(`uploadTime = '${json.uploadTime}'`);
        if (json.startDate) conditions.push(`startDate = '${json.startDate}'`);
        if (json.endDate) conditions.push(`endDate = '${json.endDate}'`);
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