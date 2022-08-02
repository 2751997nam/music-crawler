"use strict";

const util = require("../../Utils/util");
const BaseCrawler = require("../BaseCrawler");
const singers = require("../../../json/singers.json");

const Database = use("Database");

const Config = use('Config');

class LinkCrawler extends BaseCrawler {
    async init(filter = null) {
        let uniqueSingers = {};
        for (let item of singers) {
            item.crawl_url = item.crawl_url.replace(/\s+/g, '%20');
            uniqueSingers[item.crawl_url] = item;
        }

        let items = Object.values(uniqueSingers);
        for (let item of items) {
            let query = Database.table("crawl_link");
            query.where('crawl_url', item.crawl_url)
            query.where('target_type', item.target_type);
            let first = await query.first();
            if (!first) {
                console.log('insert', item.crawl_url);
                await Database.table("crawl_link").insert(item);
            }
        }
    }
}

module.exports = LinkCrawler;
