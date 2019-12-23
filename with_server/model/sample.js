const pool = require('../module/db/pool');
const table = 'blog';

module.exports = {
    create: async (json) => {
        const fields = 'name, url, userIdx';
        const questions = `"${json.name}","${json.url}", "${json.userIdx}"`;
        const result = await pool.queryParam_None(`INSERT INTO ${table}(${fields})VALUES(${questions})`)
        return result;
    },
    read: async (blogIdx) => {
        const result = await pool.queryParam_None(`SELECT * FROM ${table} WHERE blogIdx = ${blogIdx}`)
        return result;
    },
    readAll: async () => {
        const result = await pool.queryParam_None(`SELECT * FROM ${table}`)
        return result;
    },
    update: async (json) => {
        const result = await pool.queryParam_None(`UPDATE ${table} SET name = '${json.name}', url = '${json.url}' where blogIdx = '${json.blogIdx}' and userIdx = '${json.userIdx}'`)
        return result;
    },
    remove: async (json) => {
        const result = await pool.queryParam_None(`DELETE FROM ${table} WHERE blogIdx = '${json.blogIdx}' and userIdx = '${json.userIdx}'`)
        return result;
    }
}
