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
        this.siteUrl = 'https://truyendep.net/';
        this.crawlUrl = input.crawl_url;
        this.input = input;
        return await this.parse($);
    }

    async parse($) {
        let element = $('#content-chap-0');
        let content  = $(element).text();

        let json = content.replace('var content=', '').replace(';', '');
        let urls = JSON.parse(json);
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
            let chapter = await this.saveChapter(images);
            return [chapter];
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
        return chapter;
    }

    getOptionAfterParse() {
        return {
            priority: 1,
            delay: 30000
        }
    }

    getListenerAfterParse() {
        return 'ImageListener2';
    }
}

module.exports = ChapterParser;
