"use strict";

const BaseCrawler = require("../BaseCrawler");

const Database = use("Database");

const Config = use('Config');
const Manga = use('App/Models/Manga');
const Redis = require('../../Utils/Redis');

class ImageCrawler extends BaseCrawler {
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

        query.join('manga', 'manga.id', 'chapter.manga_id');
        query.where('manga.view', '>=', 1000);
        // query.orderBy('manga.view', 'desc');
        query.orderBy('chapter.id', 'asc');
        query.select(['chapter.*', 'manga.name as manga_name']);

        let hasNext = true;
        let offset = 0;
        let limit = 1;
        let lastId = 0;
        let tries = 0;
        
        const crawl = async (interval) => {
            let chapters = await query.where('parse_status', status).where('chapter.id', '>=', lastId).limit(limit);
            hasNext = false;

            for (let item of chapters) {
                if (lastId === item.id) {
                    tries++;
                } else {
                    tries = 0;
                }
                lastId = item.id;
                hasNext = true;
                item.domain = this.getDomain(item.crawl_url);
                this.addJobImage("ImageListener", item, {priority: 20, jobId: 'chapter-image-' + item.id});
            }

            offset += limit;

            if (!hasNext) {
                clearInterval(interval);
            }

            if (tries >= 5) {
                tries = 0;
                lastId++;
            }
        }

        await crawl(0);

        let interval = setInterval(async () => {
            await crawl(interval);
        }, 45000);
    }
}

module.exports = ImageCrawler;
