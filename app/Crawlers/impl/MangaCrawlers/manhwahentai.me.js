const { exec } = require('child_process');
const Log = use('App/Utils/Log');
const parser = require('xml2json');
const got = require('got');

class CrawlUrl {
    getCrawlUrls = async () => {
        return [];
        let crawlUrls = [];
        let url = 'https://manhwahentai.me/sitemap.xml';
        let xml = await this.getXml(url);
        if (xml) {
            let result = JSON.parse(parser.toJson(xml,{reversible: true}));
            let urls = result.sitemapindex.sitemap;
            let sitemapUrls = [];
            for (let item of urls) {
                if (item.loc.$t.indexOf('sitemap-pt-wp-manga') > 0) {
                    sitemapUrls.push(item.loc.$t);
                }
            }
            
            for (let sitemapUrl of sitemapUrls) {
                let xmlstr = await this.getXml(sitemapUrl);
                if (xmlstr) {
                    let sitemap = JSON.parse(parser.toJson(xmlstr,{reversible: true}));
                    let urls = sitemap.urlset.url;
                    for (let item of urls) {
                        crawlUrls.push(item.loc.$t);
                    }
                }
            }
        }
        return crawlUrls;
    }

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

module.exports = CrawlUrl;