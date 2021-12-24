'use strict'

const Config = use('Config');
const got = require('got');
const util = require('../../Utils/util');
const Manga = use('App/Models/Manga');
const MangaCrawlerManager = use('App/Crawlers/impl/MangaCrawlerManager');

class CrawlMangaController {
    async crawl({request, response}) {
        const query = request._qs;
        const crawler = new MangaCrawlerManager();
        let filter = {};
        if (query.all) {
            filter.all = query.all;
        }
        else if (query.manga_ids) {
            const crawlUrls = await Manga.query().whereIn('id', query.manga_ids.split(',')).pluck('crawl_url');
            if (crawlUrls) {
                filter.crawlUrls = crawlUrls;
            }
        }

        crawler.init(filter);

        response.json({status: 'successful', result: []});
    }
}

module.exports = CrawlMangaController;
