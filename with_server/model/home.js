const pool = require('../module/db/pool');
const table1 = 'User';
const table2 = 'Region';
const table3 = 'Board';
const table4 = 'Home_img';

module.exports = {
    readRegion: async () => {
        const result = await pool.queryParam_None(`SELECT regionName FROM ${table2}`);
        return result; 
    },

    bgImage : async()  => {
        const result = await pool.queryParam_None(`SELECT imgUrl FROM ${table4}`);
        return result;
    }
};
