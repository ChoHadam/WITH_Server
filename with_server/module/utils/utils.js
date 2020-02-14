// authUtil.js
const Utils = {
    successTrue: (statusCode, message, data) => {
        return {
            statusCode : statusCode,
            message: message,
            data: data
        }
    },
    successFalse: (statusCode, message, data) => {
        return {
            statusCode : statusCode,
            message: message,
            data: null
        }
    },
}
module.exports = Utils