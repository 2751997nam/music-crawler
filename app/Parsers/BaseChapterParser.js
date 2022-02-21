"use strict";
const axios = require("axios");
const cheerio = require("cheerio");
const util = use("App/Utils/util");
const BaseParser = use("App/Parsers/BaseParser");
const Chapter = use("App/Models/Chapter");
const Database = use("Database");
const Log = use('App/Utils/Log');
const Config = use("Config");

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
            if (Config.get('sync.enable')) {
                this.syncChapter(chapter);
            }
        }
        Log.info('parsed chapter: ', chapter.name);
        return chapter;
    }

    async syncChapter(chapter) {
        if (this.input.sync_manga_id) {
            chapter.manga_id = this.input.sync_manga_id;
        }
        chapter.token = Config.get('sync.sync_token');
        axios.post(Config.get('sync.sync_url') + '/api/save-chapter', chapter).then(res => {
            Log.info('sync chapter res: ',  JSON.stringify(res.data))
            Log.info('sync chapter ', chapter.name);
        });;
    }
}

module.exports = BaseChapterParser;