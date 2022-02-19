"use strict";
const cheerio = require("cheerio");
const util = use("App/Utils/util");
const BaseMangaParser = use("App/Parsers/BaseMangaParser");
const Manga = use("App/Models/Manga");
const Chapter = use("App/Models/Chapter");
const Database = use("Database");
const Log = use('App/Utils/Log');

class MangaParser extends BaseMangaParser {
    async init(html, input) {
        const $ = cheerio.load(html);
        this.crawlUrl = input.crawl_url;
        this.siteUrl = 'https://lewdmanhwa.com/';
        return await this.parse($);
    }

    async parse($) {
        let infoCover = $(".post-thumbnail");
        let info = $('.comics-info');
        let image = $(infoCover).find("img");
        let data = {};
        if (image) {
            data.image = $(image)
                .attr("src");
            data.image = data.image;
        }
        data.name = $('.entry-title').text().trim();
        data.alt_name = '';
        data.slug = util.slug(data.name);
        data.authors = this.parseInfo(
            $,
            info,
            ".author a",
            "multiple"
        );
        data.categories = this.parseInfo(
            $,
            info,
            ".tags a",
            "multiple"
        );
        data.status = 'ACTIVE';
        data.translators = [];
        data.view = 0;
        let description = $('.entry-content');
        if (description) {
            data.description = $(description).text().trim();
        }
        data.chapters = [];
        let listChapters = $('.chapter-list-items a');
        if (listChapters) {
            let chapters = [];
            listChapters.each((index, element) => {
                let ele = $(element).find('.chapter-name');
                if (ele) {
                    let name = data.name + ' ' + $(ele).text();
                    chapters.push({
                        name: name,
                        slug: util.slug(name),
                        crawl_url: $(element).attr('href'),
                        sorder: index,
                    });
                }
            })
        }

        if (data) {
            data.crawl_url = this.crawlUrl;
            return await this.saveData(data);
        }

        return [];
    }
}

module.exports = MangaParser;
