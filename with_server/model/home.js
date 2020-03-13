const pool = require('../module/db/pool');
const table1 = 'User';
const table2 = 'Region';
const table3 = 'Board';
const table4 = 'Home_img';

module.exports = {
    readRegion: async () => {
        var continent = new Object();
        continent.europe = new Object();
        continent.asia = new Object();
        continent.north_america = new Object();
        continent.south_america = new Object();
        continent.oceania = new Object();
        continent.africa = new Object();
        continent.korea = new Object();
        /* - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
        continent.europe.all = new Object();
        continent.europe.east = new Object();
        continent.europe.west = new Object();
        continent.europe.north = new Object();
        continent.europe.south = null;
        
        continent.asia.all = new Object();
        continent.asia.east = new Object();
        continent.asia.west = new Object();
        continent.asia.north = new Object();
        continent.asia.south = new Object();
        
        continent.north_america.all = new Object();
        continent.north_america.east = null;
        continent.north_america.west = null;
        continent.north_america.north = null;
        continent.north_america.south = null;
        
        continent.south_america.all = new Object();
        continent.south_america.east = null;
        continent.south_america.west = null;
        continent.south_america.north = null;
        continent.south_america.south = null;
        
        continent.oceania.all = new Object();
        continent.oceania.east = null;
        continent.oceania.west = null;
        continent.oceania.north = null;
        continent.oceania.south = null;
        
        continent.africa.all = new Object();
        continent.africa.east = new Object();
        continent.africa.west = null;
        continent.africa.north = new Object();
        continent.africa.south = new Object();
        
        continent.korea.all = new Object();
        continent.korea.east = null;
        continent.korea.west = null;
        continent.korea.north = null;
        continent.korea.south = null;
        /* - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
        continent.europe.all.name = "전체";
        continent.europe.all.country = new Array();
        continent.europe.east.name = "동유럽";
        continent.europe.east.country = new Array();
        continent.europe.west.name = "서유럽";
        continent.europe.west.country = new Array();
        continent.europe.north.name = "북유럽";
        continent.europe.north.country = new Array();
        
        continent.asia.all.name = "전체";
        continent.asia.all.country = new Array();
        continent.asia.east.name = "동남아시아";
        continent.asia.east.country = new Array();
        continent.asia.west.name = "서남아시아";
        continent.asia.west.country = new Array();
        continent.asia.north.name = "동북아시아";
        continent.asia.north.country = new Array();
        continent.asia.south.name = "남부아시아";
        continent.asia.south.country = new Array();
        
        continent.north_america.all.name = "전체";
        continent.north_america.all.country = new Array();
        
        continent.south_america.all.name = "전체";
        continent.south_america.all.country = new Array();
        
        continent.oceania.all.name = "전체";
        continent.oceania.all.country = new Array();
        
        continent.africa.all.name = "전체";
        continent.africa.all.country = new Array();
        continent.africa.east.name = "동아프리카";
        continent.africa.east.country = new Array();
        continent.africa.north.name = "북아프리카";
        continent.africa.north.country = new Array();
        continent.africa.south.name = "남아프리카";
        continent.africa.south.country = new Array();
        
        continent.korea.all.name = "전체";
        continent.korea.all.country = new Array();
        /* - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


        var jsonData = JSON.stringify(continent);
        const result = await pool.queryParam_None(`SELECT regionName, regionCode FROM ${table2}`);
        
        if(result.length == 0)
            return -1;

        for(var i = 0; i < result.length; i++) {
            var input = new Object();
            input.name = result[i].regionName;
            input.code = result[i].regionCode;

            var top = result[i].regionCode.substr(0,2);
            var middle = result[i].regionCode.substr(2,2);
            var bottom = result[i].regionCode.substr(4,2);

            if(top == "01") {
                // 유럽
                if(middle == "00") {
                    continent.europe.all.country.push(input);
                }
                else if(middle == "01") {
                    // 서유럽
                    continent.europe.west.country.push(input);
                }
                else if(middle == "02") {
                    // 동유럽
                    continent.europe.east.country.push(input);
                }
                else if(middle == "03") {
                    // 북유럽
                    continent.europe.north.country.push(input);
                }
            }
            else if(top == "02") {
                // 아시아
                if(middle == "00") {
                    continent.asia.all.country.push(input);
                }
                else if(middle == "01") {
                    // 동북아시아
                    continent.asia.north.country.push(input);
                }
                else if(middle == "02") {
                    // 동남아시아
                    continent.asia.east.country.push(input);
                }
                else if(middle == "03") {
                    // 남부아시아
                    continent.asia.south.country.push(input);
                }
                else if(middle == "04") {
                    // 서남아시아
                    continent.asia.west.country.push(input);
                }
            }
            else if(top == "03") {
                // 북미
                continent.north_america.all.country.push(input);
            }
            else if(top == "04") {
                // 남미
                continent.south_america.all.country.push(input);
            }
            else if(top == "05") {
                // 오세아니아
                continent.oceania.all.country.push(input);
            }
            else if(top == "06") {
                // 아프리카
                if(middle == "00") {
                    continent.africa.all.country.push(input);
                }
                else if(middle == "01") {
                    // 북아프리카
                    continent.africa.north.country.push(input);
                }
                else if(middle == "02") {
                    // 남아프리카
                    continent.africa.south.country.push(input);
                }
                else if(middle == "03") {
                    // 동아프리카
                    continent.africa.east.country.push(input);
                }
            }
            else if(top == "07") {
                // 국내
                continent.korea.all.country.push(input);
            }
        }
        
        return continent; 
    },

    bgImage : async()  => {
        const result = await pool.queryParam_None(`SELECT imgUrl FROM ${table4}`);
        return result;
    },

    regionInfo : async(regionCode)  => {
        const fields = 'regionNameEng, regionImgH'
        const result = await pool.queryParam_None(`SELECT ${fields} FROM ${table2} WHERE regionCode = ${regionCode}`);
        return result;
    }
};
