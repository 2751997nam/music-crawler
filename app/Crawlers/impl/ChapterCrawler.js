"use strict";

const BaseCrawler = require("../BaseCrawler");

const Database = use("Database");

const Config = use('Config');

class ChapterCrawler extends BaseCrawler {
    async init(filter = null) {
        let query = Database.table("chapter");
        let status = 'PENDING';
        if (filter && !filter.all) {
            if (filter.manga_id) {
                query.where('manga_id', filter.manga_id);
            }
            if (filter.chapter_id) {
                query.where('id', filter.chapter_id);
            }

            if (filter.status) {
                status = filter.status;
            }
        }
        let chapters = await query.where('status', status).select('*');
        for (let item of chapters) {
            item.domain = this.getDomain(item.crawl_url);
            this.addJob("ChapterListener", item);
        }
    }
}

module.exports = ChapterCrawler;
