const parser = require('xml2json');
const BaseMangaLinkCrawler = require("../../BaseMangaLinkCrawler");
const Database = use("Database");

class MangaLinkCrawler extends BaseMangaLinkCrawler {
    init(filter) {
        this.getCrawlUrls(filter);
    }

    getCrawlUrls = async (filter) => {
        let url = 'https://manhwa18.net/sitemap.xml';
        let xml = await this.getXml(url);
        let result = JSON.parse(parser.toJson(xml,{reversible: true}));
        let urls = result.urlset.url.slice(2);
        let crawlUrls = [];
        for (let item of urls) {
            crawlUrls.push(item.loc.$t);
        }
        let existedCrawlUrls = await Database.table('manga_link').whereIn('crawl_url', crawlUrls)
            .pluck('crawl_url');
        let existedCrawlUrlsCheck = {};
        for (let item of existedCrawlUrls) {
            existedCrawlUrlsCheck[item] = 1;
        }

        let newUrls = crawlUrls.filter(item => !existedCrawlUrlsCheck[item]);
        
        if (newUrls.length) {
            let insertData = [];
            for (let item of newUrls) {
                insertData.push({
                    crawl_url: item
                });
            }
            await Database.table('manga_link').insert(insertData);
        }

        return crawlUrls;
    }
}

module.exports = MangaLinkCrawler;