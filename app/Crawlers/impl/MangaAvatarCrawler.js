"use strict";

const BaseCrawler = require("../BaseCrawler");

const Database = use("Database");

class MangaAvatarCrawler extends BaseCrawler {
    async init(filter = null) {
        let fromId = 0;
        const crawl = async () => {
            let mangas = await Database.table("manga").where('image', 'like', '%http%').where('id', '>', fromId).limit(10).select('*');
            for (let item of mangas) {
                let domain = this.getDomain(item.image);
                console.log('downloading', {id: item.id, slug: item.slug, crawl_url: item.image});
                this.addJob("MangaAvatarListener", {id: item.id, slug: item.slug, crawl_url: item.image});
                fromId = item.id;
            }
        }
        crawl();
        setInterval(async () => {
            crawl();
        }, 15000);
    }
}

module.exports = MangaAvatarCrawler;
