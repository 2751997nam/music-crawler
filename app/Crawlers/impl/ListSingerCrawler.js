"use strict";

const util = require("../../Utils/util");
const BaseCrawler = require("../BaseCrawler");

const Database = use("Database");

const Config = use('Config');

class ListSingerCrawler extends BaseCrawler {
    async init(filter = null) {
        let query = Database.table("crawl_link");
        query.where('target_type', 'list_singer')
        // query.where('created_at', '>=', '2022-08-02 04:00:00');
        let links = await query.where('status', 'ACTIVE')
            // .limit(1)
            .select('*');
        for (let item of links) {
            item.crawl_id = item.id;
            item.domain = this.getDomain(item.crawl_url);
            this.addJob("ListSingerListener", item);
        }
    }
}

module.exports = ListSingerCrawler;
