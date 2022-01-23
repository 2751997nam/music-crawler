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
        this.siteUrl = 'https://manhwa18.net/';
        return await this.parse($);
    }

    async parse($) {
        let infoCover = $(".info-cover");
        let info = $('.manga-info');
        let image = $(infoCover).find("img");
        let data = {};
        if (image) {
            data.image = $(image)
                .attr("src");
            data.image = this.siteUrl + data.image;
        }
        data.name = this.parseInfo($, info, "h3");
        let altName = this.parseInfo($, info, 'li:nth-child(1)');
        altName = altName.replace('Other names: ', '').trim();
        data.alt_name = altName;
        data.slug = util.slug(data.name);
        data.authors = this.parseInfo(
            $,
            info,
            "li:nth-child(3) a",
            "multiple"
        );
        data.categories = this.parseInfo(
            $,
            info,
            "li:nth-child(4) a",
            "multiple"
        );
        if (data.categories.length == 1 && data.categories[0] == 'Manhwa') {
            return [];
        }
        let status = this.parseInfo($, info, "li:nth-child(5) a");
        data.status = status == 'Completed' ? 'COMPLETED' : 'ACTIVE';
        data.translators = this.parseInfo($, info, "li:nth-child(6) a", 'multiple');
        let view = this.parseInfo($, info, 'li:nth-child(7)');
        view = view.replace('Views: ', '').trim();
        data.view = view;
        let description = $('.summary-content');
        if (description) {
            data.description = $(description).html();
        }
        data.chapters = [];
        let listChapters = $('ul.list-chapters a');
        if (listChapters) {
            let chapters = [];
            listChapters.each((index, element) => {
                let ele = $(element).find('li .chapter-name');
                if (ele) {
                    let name = data.name + ' ' + $(ele).text();
                    chapters.push({
                        name: name,
                        slug: util.slug(name),
                        crawl_url: this.siteUrl + $(element).attr('href'),
                        sorder: listChapters.length - index - 1,
                    });
                }
            })
            data.chapters = chapters.reverse();
        }
        if (data) {
            data.crawl_url = this.crawlUrl;
            return await this.saveData(data);
        }

        return [];
    }
}

module.exports = MangaParser;
