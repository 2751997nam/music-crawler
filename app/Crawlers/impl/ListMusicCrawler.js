"use strict";

const BaseCrawler = require("../BaseCrawler");

const Database = use("Database");

const Config = use('Config');

class ListMusicCrawler extends BaseCrawler {
    async init(filter = null) {
        let query = Database.table("crawl_link");
        query.where('target_type', 'singer');
        let links = await query.where('status', 'ACTIVE').select('*');
        for (let item of links) {
            item.domain = this.getDomain(item.crawl_url);
            this.addJob("ListMusicListener", item);
        }
    }
}

module.exports = ListMusicCrawler;
