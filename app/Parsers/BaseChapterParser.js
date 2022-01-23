"use strict";
const cheerio = require("cheerio");
const util = use("App/Utils/util");
const BaseParser = use("App/Parsers/BaseParser");
const Chapter = use("App/Models/Chapter");
const Database = use("Database");
const Log = use('App/Utils/Log');

class BaseChapterParser extends BaseParser {
    async saveChapter(images) {
        let chapter = await Chapter.query()
            .where((query) => {
                query.where('crawl_url', this.crawlUrl)
                    .orWhere('slug', this.input.slug);
            })
            .where('manga_id', this.input.manga_id).select('*').first();
        if (chapter) {
            chapter.images = JSON.stringify(images);
            chapter.status = 'ACTIVE';
            await chapter.save();
        }
        Log.info('parsed chapter: ', chapter.name);
        return chapter;
    }
}

module.exports = BaseChapterParser;