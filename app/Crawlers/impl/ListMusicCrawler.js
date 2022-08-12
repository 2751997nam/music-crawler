"use strict";

const util = require("../../Utils/util");
const BaseCrawler = require("../BaseCrawler");

const Database = use("Database");

const Config = use('Config');

class ListMusicCrawler extends BaseCrawler {
    async init(filter = null) {
        let query = Database.table("crawl_link");
        query.where('target_type', 'singer')
        query.where('id', '>=', 276048)
        // query.where('created_at', '>=', '2022-08-02 04:00:00');
        let links = await query.where('status', 'ACTIVE')
            // .limit(1)
            .select('*');
        for (let item of links) {
            console.log('singer', item.crawl_url);
            item.crawl_id = item.id;
            item.domain = this.getDomain(item.crawl_url);
            this.addJob("ListMusicListener", item);
        }

        query = Database.table("crawl_link");
        query.where('target_type', 'singer_search')
        query.where('id', '>=', 276048)
        // query.where('created_at', '>=', '2022-08-02 04:00:00');
        links = await query.where('status', 'ACTIVE')
            // .where('id', 13261)
            // .limit(1)
            .select('*');
        for (let item of links) {
            console.log('singer_search', item.crawl_url);
            item.crawl_id = item.id;
            item.crawl_url += '&page_music=1';
            item.domain = this.getDomain(item.crawl_url);
            this.addJob("ListMusicSearchListener", item);
        }
    }
}

module.exports = ListMusicCrawler;
