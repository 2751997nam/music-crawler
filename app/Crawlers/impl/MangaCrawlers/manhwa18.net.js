const parser = require('xml2json');
const BaseMangaCrawler = require("../../BaseMangaCrawler");

class MangaCrawler extends BaseMangaCrawler {
    init() {
        this.getCrawlUrls();
    }

    getCrawlUrls = async () => {
        let crawlUrls = [];
        let url = 'https://manhwa18.net/sitemap.xml';
        let xml = await this.getXml(url);
        let result = JSON.parse(parser.toJson(xml,{reversible: true}));
        let urls = result.urlset.url.slice(2);
        for (let item of urls) {
            let crawlUrl = item.loc.$t;
            crawlUrls.push(crawlUrl);
            this.addJob('MangaListener', {crawl_url: crawlUrl, domain: this.getDomain(crawlUrl)}, {priority: 20});
        }

        return crawlUrls;
    }
}

module.exports = MangaCrawler;