const authUtil = require('../module/utils/utils');
const statusCode = require('../module/utils/statusCode');
const responseMessage = require('../module/utils/responseMessage');
const pool = require('../module/db/pool');

module.exports = {
    loadInfo: (userIdx) => {
        const table = 'User';
        const info = 'name, userImg, hashTag, intro, like,'
        const query = `SELECT ${info} FROM ${table} WHERE userIdx = '${userIdx}'`;
        return pool.queryParam_Parse(query)
            .then(result => {
                if (result.length == 0) {
                    return {
                        code: statusCode.BAD_REQUEST,
                        json: authUtil.successFalse(responseMessage.NO_USER)
                    };
                }
                return {
                    code: statusCode.OK,
                    json: authUtil.successTrue(responseMessage.MYPAGE_READ_SUCCESS, result[0])
                };
            })
            .catch(err => {
                console.log(err);
                throw err;
            });
    },

    update: ({
        intro,
        userImg,
        hashTag
    }, userIdx) => {
        const table = 'user';
        const conditions = [];
        if (intro) conditions.push(`intro = '${intro}'`);
        if (userImg) conditions.push(`userImg = '${userImg}'`);
        if (hashTag) conditions.push(`hashTag = '${hashTag}'`);
        
        const setStr = conditions.length > 0 ? `SET ${conditions.join(',')}` : '';
        const query = `UPDATE ${table} ${setStr} WHERE userIdx = ${userIdx}`;
        return pool.queryParam_None(query)
            .then(result => {
                console.log(result);
                return {
                    code: statusCode.OK,
                    json: authUtil.successTrue(responseMessage.MYPAGE_UPDATE_SUCCESS)
                };
            })
            .catch(err => {
                console.log(err);
                throw err;
            });
    },

    readAll: (userIdx) => {
        const table = 'Bulletin';
        const query = `SELECT * FROM ${table} WHERE userIdx = ${userIdx}`;

        return pool.queryParam_None(query)
            .then(result => {
                return {
                    code: statusCode.OK,
                    json: authUtil.successTrue(responseMessage.Board_READ_SUCCESS, result)
                };
            })
            .catch(err => {
                console.log(err);
                throw err;
            });
    },

    read: (bltIdx) => {
        const table = 'Bulletin';
        const query = `SELECT * FROM ${table} WHERE bltIdx = '${bltIdx}'`;
        return pool.queryParam_Parse(query)
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
};
