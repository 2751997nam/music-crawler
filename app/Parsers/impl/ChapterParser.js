"use strict";
const cheerio = require("cheerio");
const util = require("../../Utils/util");
const BaseParser = require("../BaseParser");
const Chapter = use("App/Models/Chapter");
const Database = use("Database");

class ChapterParser extends BaseParser {
    async init(html, input) {
        const $ = cheerio.load(html);
        this.siteUrl = 'https://manhwa18.net/';
        this.crawlUrl = input.crawl_url;
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
            console.log('parse chapter error: ', this.crawlUrl);
        }
    }

    async saveChapter(images) {
        let chapter = await Chapter.findBy('crawl_url', this.crawlUrl);
        if (chapter) {
            chapter.images = JSON.stringify(images);
            chapter.status = 'ACTIVE';
            await chapter.save();
        }
        console.log('parsed chapter: ', chapter.name);

    }
}

module.exports = ChapterParser;
