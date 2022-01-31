"use strict";

const BaseCrawler = require("../BaseCrawler");

const Database = use("Database");

const Config = use('Config');

class MangaCrawler extends BaseCrawler {
    async init(filter = null) {
        let links = [];
        if (filter && filter.crawlUrls && filter.crawlUrls.length > 0) {
            for (let url of filter.crawlUrls) {
                links.push({
                    crawl_url: url
                });
            }
        } else {
            let query = Database.table("manga_link");
            let status = 'ACTIVE';
            if (filter && !filter.all) {
                if (filter.ids) {
                    query.whereIn('id', filter.ids);
                }
    
                if (filter.status) {
                    status = filter.status;
                }
            }
            links = await query.where('status', status).orderBy('sorder', 'desc').select('*');
        }
        for (let item of links) {
            item.domain = this.getDomain(item.crawl_url);
            this.addJob("MangaListener", item, {priority: 20});
        }
    }
}

module.exports = MangaCrawler;
