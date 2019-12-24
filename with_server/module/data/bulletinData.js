module.exports =
    (origin_bltData) => {
        bltData = {
            "bltIdx" : origin_bltData.bltIdx,
            "country" : origin_bltData.country,
            "region" : origin_bltData.region,
            "title" : origin_bltData.title,
            "content" : origin_bltData.content,
            "uploadDate" : origin_bltData.uploadDate,
            "startDate" : origin_bltData.startDate,
            "endDate" : origin_bltData.endDate,
            "userIdx" : origin_bltData.userIdx,
            "active" : origin_bltData.active,
            "with" : origin_bltData.with,
            "filter" : origin_bltData.filter
        }
        return bltData;
    }