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
        const fields = 'senderIdx, receiverIdx, boardIdx';
        const questions = `"${json.senderIdx}", "${json.receiverIdx}", "${json.boardIdx}"`;
        let result = await pool.queryParam_None(`INSERT INTO ${table1}(${fields}) VALUES(${questions})`);
        return result;
    },

    readAll : async(myIdx) => {
        const result = await pool.queryParam_None(`
        SELECT userImg, name, regionName, title, content, withDate, startDate, endDate, withFlag FROM Chat LEFT JOIN User ON Chat.senderIdx = User.userIdx 
        LEFT JOIN Board ON Chat.boardIdx = Board.boardIdx 
        WHERE (senderIdx = ${myIdx} OR receiverIdx = ${myIdx}) AND User.userIdx != ${myIdx}
        UNION
        SELECT userImg, name, regionName, title, content, withDate, startDate, endDate, withFlag FROM Chat LEFT JOIN User ON Chat.receiverIdx = User.userIdx 
        LEFT JOIN Board ON Chat.boardIdx = Board.boardIdx 
        WHERE (senderIdx = ${myIdx} OR receiverIdx = ${myIdx}) AND User.userIdx != ${myIdx}`);
        return result;
    },

    checkRoom : async(json) => {
        const result = await pool.queryParam_None(`SELECT chatIdx FROM ${table1} WHERE boardIdx = '${json.boardIdx}' AND senderIdx = '${json.senderIdx}' AND receiverIdx = '${json.receiverIdx}'`)
        return result;     
    },
    /*
    read : async(json) => {
    },
    */
    update : async(json) => {
        const conditions = [];
        if (json.withDate) conditions.push(`withDate = '${json.withDate}'`);
        if (json.withTime) conditions.push(` withTime = '${json.withTime}'`)
        conditions.push(` withFlag = 1`)
        const setStr = conditions.length > 0 ? `SET ${conditions.join(',')}` : '';
        const result = await pool.queryParam_None(`UPDATE ${table1} ${setStr} WHERE boardIdx = ${json.boardIdx} AND senderIdx = ${json.senderIdx} AND receiverIdx = ${json.receiverIdx}`);
        return result;
    }
}

