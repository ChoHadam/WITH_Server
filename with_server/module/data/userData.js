module.exports =
    (origin_userData) => {
        userData = {
            "userIdx" : origin_userData.userIdx,
            "userId" : origin_userData.userId,
            "password" : origin_userData.password,
            "salt" : origin_userData.salt,
            "name" : origin_userData.name,
            "birth" : origin_userData.birth,
            "gender" : origin_userData.gender,
            "userImg" : origin_userData.userImg,
            "hashTag" : origin_userData.hashTag,
            "intro" : origin_userData.intro,
            "like" : origin_userData.like,
            "active" : origin_userData.active
        }
        return userData;
    }