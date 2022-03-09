"use strict";
const cheerio = require("cheerio");
const util = use("App/Utils/util");
const BaseChapterParser = use("App/Parsers/BaseChapterParser");
const Chapter = use("App/Models/Chapter");
const Database = use("Database");
const Log = use('App/Utils/Log');
const axios = require('axios');

class ChapterParser extends BaseChapterParser {
    async init(html, input) {
        let $ = cheerio.load(html);
        this.siteUrl = 'https://manga18hot.net';
        this.crawlUrl = input.crawl_url;
        this.input = input;
        return await this.parse($);
    }

    async parse($) {
        let readingId = $('#wrapper').attr('data-reading-id');
        let url = 'https://manga18hot.net/app/manga/controllers/cont.getChapter.php?mode=vertical&quality=high&hozPageSize=1&chapter=' + readingId;

        let html = await axios.get(url)
            .then(response => {
                if (response.data.status) {
                    return response.data.html;
                }
                return null;
            }).catch(err => {
                console.log(err);
                return null;
            });
        if (html) {
            $ = cheerio.load(html);
        } else {
            return;
        }

        let elements = $('#vertical-content .iv-card');
        let images = [];
        if (elements) {
            let index = 0;
            for (let element of elements) {
                let image = {
                    image_url: $(element).attr('data-url').trim(),
                    original_url: $(element).attr('data-url').trim(),
                }

                images.push(image);
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
