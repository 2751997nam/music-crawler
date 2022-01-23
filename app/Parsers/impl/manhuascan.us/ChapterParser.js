"use strict";
const cheerio = require("cheerio");
const util = use("App/Utils/util");
const BaseChapterParser = use("App/Parsers/BaseChapterParser");
const Chapter = use("App/Models/Chapter");
const Database = use("Database");
const Log = use('App/Utils/Log');

class ChapterParser extends BaseChapterParser {
    async init(html, input) {
        const $ = cheerio.load(html);
        this.siteUrl = 'https://manhuascan.us/';
        this.crawlUrl = input.crawl_url;
        this.input = input;
        return await this.parse($);
    }

    async parse($) {
        let elements = $('#readerarea > img');
        let images = [];
        if (elements) {
            let index = 0;
            for (let element of elements) {
                let imageUrl = $(element).attr('src');
                if (imageUrl) {
                    let image = {
                        image_url: imageUrl,
                        original_url: imageUrl,
                    }
                    images.push(image);
                }

            }
        }
        if (images.length) {
            let chapter = await this.saveChapter(images);
            chapter.manga_name = this.input.manga_name;
            let result = [];
            result.push(JSON.parse(JSON.stringify(chapter)));
            return result;
        } else {
            Log.info('parse chapter error: ', this.crawlUrl);
        }
    }
}

module.exports = ChapterParser;
