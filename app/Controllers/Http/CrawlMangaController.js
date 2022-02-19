'use strict'

const Config = use('Config');
const got = require('got');
const util = require('../../Utils/util');
const Manga = use('App/Models/Manga');
const MangaCrawler = use('App/Crawlers/impl/MangaCrawler');
const Database = use('Database');


class CrawlMangaController {
    async crawl({request, response}) {
        const query = request._qs;
        const crawler = new MangaCrawler();
        let filter = {};
        if (query.all) {
            filter.all = query.all;
        }
        else if (query.manga_ids) {
            const crawlUrls = await Manga.query().whereIn('id', query.manga_ids.split(',')).pluck('crawl_url');
            if (crawlUrls) {
                filter.crawlUrls = crawlUrls;
            }
        } else if (query.ids) {
            const crawlUrls = await Database.table('manga_link').whereIn('id', query.ids.split(',')).pluck('crawl_url');
            if (crawlUrls) {
                filter.crawlUrls = crawlUrls;
            }
        } else if (query.fromId) {
            const crawlUrls = await Database.table('manga_link').where('id', '>=', query.fromId).pluck('crawl_url');
            if (crawlUrls) {
                filter.crawlUrls = crawlUrls;
            }
        }

        if (query.domain) {
            filter.domain = query.domain;
        }

        crawler.init(filter);

        response.json({status: 'successful', result: []});
    }
}

module.exports = CrawlMangaController;
