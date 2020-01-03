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
        const fields = 'userIdx, boardIdx, roomId';
        const questions = `"${json.userIdx}", "${json.boardIdx}", "${json.roomId}"`;
        let result = await pool.queryParam_None(`INSERT INTO ${table1}(${fields}) VALUES(${questions})`);
        return result;
    },

    readAll : async (userIdx) => {
        /*
        나와 연결된 채팅방의 정보들을(게시글 idx, room ID, 상대 이미지, 이름, 지역명, 제목, 내용, 
        동행날짜, 시작날짜, 끝나는 날짜, 동행 플래그) 출력한다.
        */
        var board_list = [];
        var result = await pool.queryParam_None(`
        SELECT Chat.userIdx, Chat.boardIdx, roomId, userImg, name, regionName, title, withDate, startDate, endDate, withFlag, evalFlag 
        FROM Chat 
            LEFT JOIN Board ON Chat.boardIdx = Board.boardIdx 
            LEFT JOIN User ON Chat.userIdx = User.userIdx 
        WHERE roomId LIKE '____%${userIdx}%' AND Chat.userIdx != ${userIdx}
        ORDER BY Chat.boardIdx ASC`);
        console.log(result);
        for(var i in result){
            board_list.push(result[i].boardIdx);
            result[i].startDate = moment(result[i].startDate, 'YYYY-MM-DD').format('YY.MM.DD');
            result[i].endDate = moment(result[i].endDate, 'YYYY-MM-DD').format('YY.MM.DD');
            result[i].withDate = moment(result[i].withDate, 'YYYY-MM-DD').format('YY.MM.DD');
        }
        var result_sub = await pool.queryParam_None(`
        SELECT userImg, regionImgE FROM Board 
        NATURAL JOIN User NATURAL JOIN Region
        WHERE boardIdx in (${board_list})`);
        for(var i in result){
            result[i].writerImg = result_sub[i].userImg;
            result[i].regionImgE = result_sub[i].regionImgE;
        }

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
        const result = await pool.queryParam_None(`UPDATE ${table1} ${setStr} WHERE roomId = '${json.roomId}'`);
        return result;
    }
}

cron.schedule('0 12 * * *', async function(){     
    // 매일 자정에 날짜를 확인해 마감처리 한다.      
    var currentTime = moment().format('YYYY-MM-DD');    
    await pool.queryParam_None(`UPDATE ${table1} LEFT JOIN Board ON ${table1}.boardIdx = ${table2}.boardIdx SET evalFlag = '2' WHERE withFlag = 1 AND endDate < '${currentTime}' AND evalFlag = '1'`);    
});