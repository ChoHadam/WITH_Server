const pool = require('../module/db/pool');
const table = 'User';
const table2 = 'Interest';

const user = {
    signup : async (json) => {
        //아이디, 비번, 이름, 생일, 성별, 프로필사진        
        let interest = 0;
        if(json.interest != '0'){   
            if(String(json.interest).includes(',')){                  ////와인,야경,쇼핑 / 와인,쇼핑                 
                json.interest = String(json.interest).split(',').join('","');
            }
            json.interest = `"${json.interest}"`;  //쿼리 형식 맞추기            
            const result = await pool.queryParam_None(`SELECT * FROM ${table2} WHERE interests IN(${interestStr})`); //select * 한게 select intIdx보다 빨라서 *로 바꿈

            var i = 0;
            while(i < result.length){
                interest += result[i].intIdx;
                i++;
                if(i == result.length) break;
                interest += ',';
            }
            interest = `"${interest}"`;            
            }
        else{
            interest = null;
        }            
        const fields = 'userId, password, salt, name, birth, gender, userImg, interest';
        var questions = `"${json.userId}","${json.finalPw}","${json.salt}","${json.name}","${json.birth}","${json.gender}","${json.userImg}", ${interest}`;

        const final = await pool.queryParam_None(`INSERT INTO ${table}(${fields})VALUES(${questions})`)
        return final;

    },
    checkUser : async (userId) => {
        //존재하는 회원인지 확인
        const result = await pool.queryParam_None(`SELECT * FROM ${table} WHERE userId = "${userId}"`);
        return result;
    },
    returnUser : async (userIdx) => {
        // userIdx에 해당하는 유저 정보 반환
        const result = await pool.queryParam_None(`SELECT * FROM ${table} WHERE userIdx = ${userIdx}`);
        return result;
    }
}

module.exports = user;

