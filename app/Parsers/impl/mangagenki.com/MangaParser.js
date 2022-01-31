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
        this.siteUrl = 'https://mangagenki.com/';
        return await this.parse($);
    }

    async parse($) {
        let infoCover = $(".thumbook");
        let info = $('.infox');
        let image = $(infoCover).find(".thumb > img");
        let data = {
            authors: [],
            translators: [],
            categories: [],
            status: 'ACTIVE',
            view: 0
        };
        if (image) {
            data.image = $(image)
                .attr("data-lazy-src");
            data.image = data.image;
        }
        data.name = this.parseInfo($, info, "h1.entry-title");
        let altName = this.parseInfo($, info, 'div.wd-full:nth-child(3) span');
        data.alt_name = altName;
        data.slug = util.slug(data.name);

        let elements = $(info).find('.flex-wrap .fmed');
        for (let element of elements) {
            let text = $(element).text().trim();
            if (text.includes('Author')) {
                let value = text.replace('Author', '').trim();
                data.authors = [value];
            } else if (text.includes('Posted By')) {
                let value = text.replace('Posted By', '').trim();
                data.translators = [value];
            }
        }
        data.categories = this.parseInfo(
            $,
            info,
            ".wd-full .mgen a",
            "multiple"
        );

        elements = $(infoCover).find('.tsinfo .imptdt');

        for (let element of elements) {
            let text = $(element).text().trim();
            if (text.includes('Status')) {
                let value = text.replace('Status', '').trim();
                data.status = value == 'Ongoing' ? 'ACTIVE' : 'COMPLETED';
            } else if (text.includes('Type')) {
                let value = text.replace('Type', '').trim();
                data.categories.unshift(value);
            }
        }

        let description = $('.detail_reviewContent P');
        if (description) {
            data.description = $(description).text().trim();
        }
        data.chapters = [];
        let listChapters = $('#chapterlist li');
        if (listChapters) {
            let chapters = [];
            listChapters.each((index, element) => {
                let ele = $(element).find('a');
                if (ele) {
                    let name = data.name + ' ' + $(ele).find('.chapternum').text();
                    chapters.push({
                        name: name,
                        slug: util.slug(name),
                        crawl_url: $(ele).attr('href'),
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
