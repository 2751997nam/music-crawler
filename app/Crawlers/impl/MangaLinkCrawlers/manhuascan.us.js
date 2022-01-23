const parser = require('xml2json');
const BaseMangaLinkCrawler = require("../../BaseMangaLinkCrawler");

class MangaLinkCrawler extends BaseMangaLinkCrawler {
    init(filter) {
        this.getCrawlUrls(filter);
    }

    getCrawlUrls = async (filter) => {
        return;
        let url = 'https://manhuascan.us/sitemap_manga.xml';
        let xml = await this.getXml(url);
        let result = JSON.parse(parser.toJson(xml,{reversible: true}));
        let urls = result.sitemapindex.sitemap;
        for (let item of urls) {
            if (item.loc.$t.indexOf('/manga/') > 0) {
                let xml = await this.getXml(item.loc.$t);
                let result = JSON.parse(parser.toJson(xml,{reversible: true}));
                let crawlUrls = result.urlset.url.slice(2);
                for (let crawlUrl of crawlUrls) {
                }
            }
        }

        return crawlUrls;
    }
}

module.exports = MangaLinkCrawler;