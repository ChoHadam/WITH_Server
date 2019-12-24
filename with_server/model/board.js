const authUtil = require('../module/utils/utils');
const statusCode = require('../module/utils/statusCode');
const responseMessage = require('../module/utils/responseMessage');
const pool = require('../module/db/pool');

module.exports = {
    create: ({
        country,
        region,
        title,
        content,
        startDate,
        endDate,
        userIdx,
        withNum,
        filter
    }) => {
        const table = 'Bulletin';
        const fields = 'country, region, title, content, startDate, endDate, userIdx, withNum, filter';
        const questions = `?, ?, ?, ?, ?, ?, ?, ?, ?`;
        const query = `INSERT INTO ${table}(${fields}) VALUES(${questions})`;
        const values = [country, region, title, content, startDate, endDate, userIdx, withNum, filter];
        return pool.queryParam_Parse(query, values)
            .then(result => {
                console.log(result);
                const bltIdx = result.bltIdx;
                return {
                    code: statusCode.OK,
                    json: authUtil.successTrue(responseMessage.BOARD_CREATE_SUCCESS, bltIdx)
                };
            })
            .catch(err => {
                // ER_NO_REFERENCED_ROW_2 : 참조받는 테이블의 데이터를 먼저 삽입해서 발생한 오류(참조키는 항상 부모키에 해당하는 값만 넣을 수 있다)
                if (err.errno == 1452) {
                    console.log(err.errno, err.code);
                    return {
                        code: statusCode.BAD_REQUEST,
                        json: authUtil.successFalse([responseMessage.BOARD_CREATE_FAIL, responseMessage.NO_USER].join(','))
                    };
                }
                console.log(err);
                throw err;
            });
    },
    readAll: () => {
        const table = 'Bulletin';
        const query = `SELECT * FROM ${table}`
        return pool.queryParam_None(query)
            .then(result => {
                return {
                    code: statusCode.OK,
                    json: authUtil.successTrue(responseMessage.BOARD_READ_SUCCESS, result)
                };
            })
            .catch(err => {
                console.log(err);
                throw err;
            });
    },
    read: ({
        bltIdx
    }) => {
        const table = 'Bulletin';
        const query = `SELECT * FROM ${table} WHERE bltIdx = '${bltIdx}'`;
        return pool.queryParam_None(query)
            .then(result => {
                if (result.length == 0) {
                    return {
                        code: statusCode.BAD_REQUEST,
                        json: authUtil.successFalse(responseMessage.NO_BOARD)
                    };
                }
                return {
                    code: statusCode.OK,
                    json: authUtil.successTrue(responseMessage.BOARD_READ_SUCCESS, result[0])
                };
            })
            .catch(err => {
                console.log(err);
                throw err;
            });
    },
    update: ({
        bltIdx,
        country,
        region,
        title,
        content,
        startDate,
        endDate,
        userIdx,
        withNum,
        filter
        
    }) => {
        const table = 'Bulletin';
        //const values = [bltIdx, country, region, title, content, startDate, endDate, userIdx, withNum, filter];
        const conditions = [];

        if (country) conditions.push(`country = '${country}'`);
        if (region) conditions.push(`region = '${region}'`);
        if (title) conditions.push(`title = '${title}'`);
        if (content) conditions.push(`content = '${content}'`);
        if (startDate) conditions.push(`startDate = '${startDate}'`);
        if (endDate) conditions.push(`endDate = '${endDate}'`);
        if (withNum) conditions.push(`withNum = '${withNum}'`);
        if (filter) conditions.push(`filter = '${filter}'`);
        const setStr = conditions.length > 0 ? `SET ${conditions.join(',')}` : '';
        const query = `UPDATE ${table} ${setStr} WHERE bltIdx = ${bltIdx}`;
        const tableLength = `SELECT count(*) FROM ${table}`
        const user = `SELECT userIdx FROM ${table} WHERE bltIdx = ${bltIdx}`;
        return pool.queryParam_None(query)
            .then(result => {
                if (bltIdx >= tableLength){
                    resolve({
                        code: statusCode.BAD_REQUEST,
                        json: authUtil.successFalse(responseMessage.NO_BOARD)   
                    });
                    return;
                }
                if(userIdx != user){
                    resolve({
                        code: statusCode.FORBIDDEN,
                        json: authUtil.successFalse(responseMessage.MISS_MATCH_ID)
                    });
                return;
                }
                console.log(result);
                return {
                    code: statusCode.OK,
                    json: authUtil.successTrue(responseMessage.BOARD_UPDATE_SUCCESS)
                };
            })
            .catch(err => {
                console.log(err);
                throw err;
            });
    },
    delete: (whereJson = {}) => {
        const table = 'Bulletin';
        const conditions = Object.entries(whereJson).map(it => `${it[0]} = '${it[1]}'`).join(',');
        const whereStr = conditions.length > 0 ? `WHERE ${conditions}` : '';
        const query = `DELETE FROM ${table} ${whereStr}`
        return pool.queryParam_None(query)
            .then(result => {
                console.log(result);
                return {
                    code: statusCode.OK,
                    json: authUtil.successTrue(responseMessage.BOARD_DELETE_SUCCESS)
                };
            })
            .catch(err => {
                console.log(err);
                throw err;
            });
    },
};
