"use strict";

const BaseCrawler = require("../BaseCrawler");

const Database = use("Database");
const Config = use('Config');

class MangaChapterCrawler extends BaseCrawler {
    async init() {
        return ;
        let mangas = await Database.table("manga").where('status', '=', 'ACTIVE').select('*');
        for (let item of mangas) {
            item.domain = this.getDomain(item.crawl_url);
            this.addJob("MangaChapterListener", item);
        }
    }
}

module.exports = MangaChapterCrawler;
