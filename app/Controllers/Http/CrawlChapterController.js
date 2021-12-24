'use strict'

const Config = use('Config');
const got = require('got');
const util = require('../../Utils/util');
const Chapter = use('App/Models/Chapter');
const ChapterCrawler = use('App/Crawlers/impl/ChapterCrawler');

class CrawlChapterController {
    async crawl({request, response}) {
        const query = request._qs;
        const crawler = new ChapterCrawler();
        let filter = {};
        if (query.all) {
            filter.all = query.all;
        } else {
            filter.all = false;
        }
        if (query.manga_id) {
            filter.manga_id = query.manga_id;
        }
        if (query.chapter_id) {
            filter.chapter_id = query.chapter_id;
        }
        crawler.init(filter);

        response.json({status: 'successful', result: []});
    }
}

module.exports = CrawlChapterController;
