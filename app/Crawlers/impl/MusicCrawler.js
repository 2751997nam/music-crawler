"use strict";

const BaseCrawler = require("../BaseCrawler");

const Database = use("Database");

const Config = use('Config');
const DateTime = require('date-and-time');

class MusicCrawler extends BaseCrawler {
    async init(filter = null) {
        let query = Database.from("crawl_link");
        query.where('target_type', 'music');
        let links = await query.where('status', 'ACTIVE')
            // .where('created_at', '<=', DateTime.format(new Date(), 'YY-MM-DD HH:mm::ss'))
            .limit(10000)
            .orderBy('id', 'asc')
            .select('*');
        for (let item of links) {
            item.domain = this.getDomain(item.crawl_url);
            item.music_id = item.target_id;
            this.addJob("MusicListener", item);
        }
    }
}

module.exports = MusicCrawler;
