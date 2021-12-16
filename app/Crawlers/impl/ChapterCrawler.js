"use strict";

const BaseCrawler = require("../BaseCrawler");

const Database = use("Database");

const Config = use('Config');

class ChapterCrawler extends BaseCrawler {
    async init() {
        let chapters = await Database.table("chapter").where('status', 'PENDING').select('*');
        this.initQueue();
        for (let item of chapters) {
            this.addJob("ChapterListener", item);
        }

        // let chapters = await Database.table("chapter").where('status', 'ACTIVE').select('*');
        // for (let chapter of chapters) {
        //     let images = await Database.table("chapter_image").where('chapter_id', chapter.id).orderBy('sorder', 'asc').select('image_url', 'original_url');
        //     let chapterImages = JSON.stringify(images);
        //     await Database.table("chapter").where('id', chapter.id).update({images: chapterImages})
        // }
    }
}

module.exports = ChapterCrawler;
