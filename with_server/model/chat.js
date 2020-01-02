const pool = require('../module/db/pool');

const cron = require('node-cron');
const moment = require('moment');
const moment_timezone = require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

const table1 = 'Chat';
const table2 = 'Board';
const table3 = 'User';

module.exports = {
    create : async (json) => {
        // 채팅 신청자, 게시글 작성자, 게시글 idx, room ID를 받고 채팅방 정보를 생성한다.
        const fields = 'senderIdx, receiverIdx, boardIdx, roomId';
        const questions = `"${json.senderIdx}", "${json.receiverIdx}", "${json.boardIdx}", "${json.roomId}"`;
        let result = await pool.queryParam_None(`INSERT INTO ${table1}(${fields}) VALUES(${questions})`);
        return result;
    },

    readAll : async (userIdx) => {
        /*
        나와 연결된 채팅방의 정보들을(게시글 idx, room ID, 상대 이미지, 이름, 지역명, 제목, 내용, 
        동행날짜, 시작날짜, 끝나는 날짜, 동행 플래그) 출력한다.
        */
        var result = await pool.queryParam_None(`
        SELECT Chat.boardIdx, roomId, userImg, name, regionName, title, content, withDate, startDate, endDate, withFlag FROM Chat LEFT JOIN User ON Chat.senderIdx = User.userIdx 
        LEFT JOIN Board ON Chat.boardIdx = Board.boardIdx 
        WHERE (senderIdx = ${userIdx} OR receiverIdx = ${userIdx}) AND User.userIdx != ${userIdx}
        UNION
        SELECT Chat.boardIdx, roomId, userImg, name, regionName, title, content, withDate, startDate, endDate, withFlag FROM Chat LEFT JOIN User ON Chat.receiverIdx = User.userIdx 
        LEFT JOIN Board ON Chat.boardIdx = Board.boardIdx 
        WHERE (senderIdx = ${userIdx} OR receiverIdx = ${userIdx}) AND User.userIdx != ${userIdx}`);
        return result;
    },

    readBoardImg : async (boardIdx) => {
        // boardIdx를 받아 게시글 작성자의 이미지를 출력한다.
        const result = await pool.queryParam_None(`SELECT userImg FROM ${table2} NATURAL JOIN ${table3} WHERE boardIdx = ${boardIdx}`);
        return result;
    },

    checkRoom : async (json) => {
        // 이미 채팅방이 존재하는지 확인한다.
        const result = await pool.queryParam_None(`SELECT chatIdx FROM ${table1} WHERE boardIdx = '${json.roomId}'`)
        return result;     
    },

    update : async (json) => {
        // 동행을 수락하면 채팅방 내용을 수정한다.
        const conditions = [];
        if (json.withDate) conditions.push(`withDate = '${json.withDate}'`);
        if (json.withTime) conditions.push(` withTime = '${json.withTime}'`)
        conditions.push(` withFlag = 1`)
        const setStr = conditions.length > 0 ? `SET ${conditions.join(',')}` : '';
        const result = await pool.queryParam_None(`UPDATE ${table1} ${setStr} WHERE boardIdx = ${json.boardIdx} AND senderIdx = ${json.senderIdx} AND receiverIdx = ${json.receiverIdx}`);
        return result;
    },

    check : async(userIdx) => {
        // 동행 평가가 필요한지 검사한다.
        const today_time = moment().format('YYYY-MM-DD');
        var result = await pool.queryParam_None(`
        SELECT User.userIdx, name, regionCode FROM Chat LEFT JOIN User ON Chat.senderIdx = User.userIdx 
        LEFT JOIN Board ON Chat.boardIdx = Board.boardIdx 
        WHERE (senderIdx = ${userIdx} OR receiverIdx = ${userIdx}) AND User.userIdx != ${userIdx} AND withDate < '${today_time}'
        UNION
        SELECT User.userIdx, name, regionCode FROM Chat LEFT JOIN User ON Chat.receiverIdx = User.userIdx 
        LEFT JOIN Board ON Chat.boardIdx = Board.boardIdx 
        WHERE (senderIdx = ${userIdx} OR receiverIdx = ${userIdx}) AND User.userIdx != ${userIdx} AND withDate < '${today_time}'`);
        return result;
    },

    img : async(regionCode) => {
        // 평가 시, 상응하는 코드의 배경 이미지를 출력한다.
        const result = await pool.queryParam_None(`SELECT regionImgE FROM Region where regionCode = ${regionCode}`); 
        return result;
    }
}

