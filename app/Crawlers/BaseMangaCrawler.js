const got = require('got');
const Log = use('App/Utils/Log');
const BaseCrawler = require('./BaseCrawler');

class BaseMangaCrawler extends BaseCrawler {
    getXml = async (url) => {
        return await new Promise((resolve, reject) => {
            got(url).then(response => {
                resolve(response.body);
            }).catch(error => {
                Log.error('error ', error);
                reject('');
            });
        });
    }
}

module.exports = BaseMangaCrawler;