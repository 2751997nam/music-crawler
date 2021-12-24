const { exec } = require('child_process');
const Log = use('App/Utils/Log');
const parser = require('xml2json');

class CrawlUrl {
    getCrawlUrls = async () => {
        let crawlUrls = [];
        let url = 'https://manhwa18.net/sitemap.xml';
        let xml = await new Promise((resolve, reject) => {
            exec("curl --location --request GET '" + url + "'", function (error, stdout, stderr) {
                if (error) {
                    Log.error('error ', error);
                    reject(stderr);
                } else {
                    resolve(stdout);
                }
            })
        });
        let result = JSON.parse(parser.toJson(xml,{reversible: true}));
        let urls = result.urlset.url.slice(2);
        for (let item of urls) {
            crawlUrls.push(item.loc.$t);
        }

        return crawlUrls;
    }
}

module.exports = CrawlUrl;