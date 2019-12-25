module.exports =
    (origin_countryData) => {
        countryData = {
            "countryIdx" : origin_countryData.countryIdx,
            "country" : origin_countryData.country,
            "region" : origin_countryData.region
        }
        return countryData;
    }