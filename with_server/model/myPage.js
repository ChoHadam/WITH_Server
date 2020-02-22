const pool = require('../module/db/pool');
const table1 = 'User';
const table2 = 'Board';
const table3 = 'Chat';

module.exports = {
    readProfile: async(userIdx) => {
        const fields = 'userImg, name, birth, gender, userId, interest1, interest2, interest3'
        const result = await pool.queryParam_None(`SELECT ${fields} FROM ${table1} WHERE userIdx = '${userIdx}'`);
        return result;
        
    },

    update: async(json, userIdx) => {
        const conditions = [];
        //console.log(json);
        
        if (json.userImg) conditions.push(`userImg = '${json.userImg}'`);
        
        if (json.interest1)
        {
            conditions.push(`interest1 = '${json.interest1}'`);
        }
        else
        {
            conditions. push(`interest1 = Null`)
        }
        
        if (json.interest2)
        {
            conditions.push(`interest2 = '${json.interest2}'`);
        }
        else
        {
            conditions. push(`interest2 = Null`)
        }
        
        if (json.interest3)
        {
            conditions.push(`interest3 = '${json.interest3}'`);
        }
        else
        {
            conditions. push(`interest3 = Null`)
        }
        
        const setStr = conditions.length > 0 ? `SET ${conditions.join(',')}` : '';
        const result = await pool.queryParam_None(`UPDATE ${table1} ${setStr} WHERE userIdx = '${userIdx}'`)
        return result;
            
    },

    readAll: async(userIdx) => {
        const result = await pool.queryParam_None(`SELECT * FROM ${table2} WHERE userIdx = '${userIdx}'`)
        return result;
    },

    confirmUser : async (userIdx) => {
        //존재하는 회원인지 확인    
        const result = await pool.queryParam_None(`SELECT * FROM ${table1} WHERE userIdx = "${userIdx}"`)
        return result;  
    },   

    changePw : async(json) =>{
        const setStr = `SET password = '${json.finalPw}', salt = '${json.salt}'`
        const result = await pool.queryParam_None(`UPDATE ${table1} ${setStr} WHERE userIdx = ${json.userIdx}`); 
        
        return result;
    }

};
