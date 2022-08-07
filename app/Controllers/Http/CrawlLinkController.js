'use strict'
const LinkCrawler = use('App/Crawlers/impl/LinkCrawler');
class CrawlLinkController {
    async crawl({params, response, view}) {
        const linkCrawler = new LinkCrawler();
        let retVal = await linkCrawler.init({});

        response.json(retVal);
    }
}

module.exports = CrawlLinkController;
