"use strict";
const cheerio = require("cheerio");
const util = use("App/Utils/util");
const BaseParser = use("App/Parsers/BaseParser");
const Chapter = use("App/Models/Chapter");
const Database = use("Database");
const Log = use('App/Utils/Log');

class ChapterParser extends BaseParser {
    async init(html, input) {
        const $ = cheerio.load(html);
        this.siteUrl = 'https://manhwa18.net/';
        this.crawlUrl = input.crawl_url;
        this.input = input;
        this.parse($);
    }

    async parse($) {
        let elements = $('.chapter-img');
        let images = [];
        if (elements) {
            let index = 0;
            for (let element of elements) {
                let image = {
                    image_url: $(element).attr('src'),
                    original_url: $(element).attr('data-original'),
                }

                images.push(image);
            }
        }
        if (images.length) {
            await this.saveChapter(images);
        } else {
            Log.info('parse chapter error: ', this.crawlUrl);
        }
    }

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

    }
}

module.exports = ChapterParser;
