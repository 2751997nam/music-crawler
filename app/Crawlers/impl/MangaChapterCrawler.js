"use strict";

const BaseCrawler = require("../BaseCrawler");

const Database = use("Database");
const Config = use('Config');

class MangaChapterCrawler extends BaseCrawler {
    async init() {
        let mangas = await Database.table("manga").where('status', '!=', 'Completed').select('*');
        this.initQueue();
        for (let item of mangas) {
            this.addJob("MangaChapterListener", item);
        }
    }
}

module.exports = MangaChapterCrawler;
