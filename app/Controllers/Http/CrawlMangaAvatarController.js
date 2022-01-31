'use strict'

const Config = use('Config');
const got = require('got');
const util = require('../../Utils/util');
const Manga = use('App/Models/Manga');
const MangaAvatarCrawler = use('App/Crawlers/impl/MangaAvatarCrawler');


class CrawlMangaAvatarController {
    async crawl({request, response}) {
        const query = request._qs;
        const crawler = new MangaAvatarCrawler();
        // let filter = {};
        // if (query.all) {
        //     filter.all = query.all;
        // }
        // else if (query.manga_ids) {
        //     const crawlUrls = await Manga.query().whereIn('id', query.manga_ids.split(',')).pluck('image_url');
        //     if (crawlUrls) {
        //         filter.crawlUrls = crawlUrls;
        //     }
        // }

        // if (query.domain) {
        //     filter.domain = query.domain;
        // }

        crawler.init({});

        response.json({status: 'successful', result: []});
    }
}

module.exports = CrawlMangaAvatarController;
