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
        this.siteUrl = 'https://manga18hot.net/';
        return await this.parse($);
    }

    async parse($) {
        let infoCover = $(".anisc-poster .manga-poster");
        let info = $('.anisc-detail');
        let image = $(infoCover).find("img");
        let data = {
            authors: [],
            translators: [],
            categories: [],
            status: 'ACTIVE',
            view: 0
        };
        if (image) {
            data.image = $(image)
                .attr("src");
            data.image = this.siteUrl + data.image;
        }
        data.name = this.parseInfo($, info, ".manga-name");
        let altName = this.parseInfo($, info, '.manga-name-or');
        data.alt_name = altName;
        data.slug = util.slug(data.name);
        data.authors = this.parseInfo(
            $,
            info,
            ".anisc-info-wrap .anisc-info .item-title:nth-child(1) a",
            "multiple"
        );
        data.categories = this.parseInfo(
            $,
            info,
            ".genres a",
            "multiple"
        );
        if (data.categories.length == 1 && data.categories[0] == 'Manhwa') {
            return [];
        }
        data.categories = data.categories.filter(item => item != 'Webtoon');
        
        let status = this.parseInfo($, info, ".anisc-info-wrap .anisc-info .item-title:nth-child(2) a");
        data.status = status == 'On Going' ? 'ACTIVE' : 'COMPLETED';
        let view = this.parseInfo($, info, '.anisc-info-wrap .anisc-info .item-title:nth-child(4) .name');
        data.view = view;
        let description = $('.description');
        if (description) {
            data.description = $(description).text().trim();
        }
        data.chapters = [];
        let listChapters = $('.chapter-item');
        if (listChapters) {
            let chapters = [];
            listChapters.each((index, element) => {
                let ele = $(element).find('.item-link');
                if (ele) {
                    let name = data.name + ' ' + $(ele).attr('title').trim();
                    chapters.push({
                        name: name,
                        slug: util.slug(name),
                        crawl_url: this.siteUrl + $(ele).attr('href'),
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
