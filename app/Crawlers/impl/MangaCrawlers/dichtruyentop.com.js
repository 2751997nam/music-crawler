const parser = require('xml2json');
const BaseMangaCrawler = require("../../BaseMangaCrawler");

class MangaCrawler extends BaseMangaCrawler {
    init() {
        this.getCrawlUrls();
    }

    getCrawlUrls = async () => {
        return [];
        let crawlUrls = [];
        let url = 'https://dichtruyentop.com/sitemap.xml';
        let xml = await this.getXml(url);
        let result = JSON.parse(parser.toJson(xml, {reversible: true}));
        let sitemaps = result.sitemapindex.sitemap;
        for (let sitemap of sitemaps) {
            if (sitemap.loc.$t.indexOf('type=comic') > 0) {
                xml = await this.getXml(sitemap.loc.$t);
                result = JSON.parse(parser.toJson(xml, {reversible: true}));
                let urls = result.urlset.url;
                for (let item of urls) {
                    this.addJob('MangaListener', {crawl_url: item.loc.$t, domain: this.getDomain(item.loc.$t)}, {priority: 40});
                    crawlUrls.push(item.loc.$t);
                }
            }
        }

        let crawlUrl = 'https://manytoon.com/comic/naughty-little-secret-2/';
        this.addJob('MangaListener', {crawl_url: crawlUrl, domain: this.getDomain(crawlUrl)}, {priority: 40});

        return crawlUrls;
    }
}

module.exports = MangaCrawler;