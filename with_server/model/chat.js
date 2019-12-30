const statusCode = require('../module/utils/statusCode');
const responseMessage = require('../module/utils/responseMessage');
const authUtil = require('../module/utils/utils');

const pool = require('../module/db/pool');

const cron = require('node-cron');
const moment = require('moment');
const moment_timezone = require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

const table1 = 'Chat';
const table2 = 'Board';
const table3 = 'User';

module.exports = {
    create : async(json) => {
        // 나라, 대륙, 제목, 내용, 작성시간, 동행시작시간, 동행종료시간, 작성자인덱스, 활성화유무, 동행자 수, 동성필터여부
        const date = await pool.queryParam_None(`SELECT startDate, endDate FROM ${table2} WHERE boardIdx = ${json.boardIdx}`);
        const withStartDate = date[0].startDate;
        const withEndDate = date[0].endDate;
        const fields = 'senderIdx, receiverIdx, boardIdx, withStartDate, withEndDate';
        const questions = `"${json.senderIdx}", "${json.receiverIdx}", "${json.boardIdx}", "${withStartDate}", "${withEndDate}"`;
        let result = await pool.queryParam_None(`INSERT INTO ${table1}(${fields}) VALUES(${questions})`);
        return result;
    },

    readAll : async(myIdx) => {
        let chat_all = await pool.queryParam_None(`SELCET *`);
    },

    read : async(json) => {
    },

    update : async(json) => {
        const conditions = [];

        if (json.withStartDate) conditions.push(`withStartDate = '${json.withStartDate}'`);
        if (json.withEndDate) conditions.push(` withEndDate = '${json.withEndDate}'`);
        conditions.push(` withFlag = '1'`)
        const setStr = conditions.length > 0 ? `SET ${conditions.join(',')}` : '';
        const result = await pool.queryParam_None(`UPDATE ${table1} ${setStr} WHERE boardIdx = ${json.boardIdx} AND senderIdx = ${json.senderIdx} AND receiverIdx = ${json.receiverIdx}`);
        return result;
    }
}

