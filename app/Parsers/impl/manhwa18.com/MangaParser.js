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
        this.siteUrl = 'https://manhwa18.com/';
        return await this.parse($);
    }

    async parse($) {
        let infoCover = $(".series-cover");
        let info = $('.series-information');
        let image = $(infoCover).find(".img-in-ratio");
        let data = {};
        if (image) {
            let style = $(image)
                .attr("style");
            let matches = style.match(/url\(\'(.*)\'\)/g);
            if (matches && matches.length > 1) {
                data.image = matches[1];
            }
        }
        data.name = $(".series-name").text().trim();
        let altName = this.parseInfo($, info, '.info-item:nth-child(1) .info-value');
        data.alt_name = altName;
        data.slug = util.slug(data.name);
        data.authors = this.parseInfo(
            $,
            info,
            ".info-item:nth-child(4) .info-value a",
            "multiple"
        );
        data.categories = this.parseInfo(
            $,
            info,
            ".info-item:nth-child(3) .info-value a",
            "multiple"
        );
        if (data.categories.length == 1 && data.categories[0] == 'Manhwa') {
            return [];
        }
        let status = this.parseInfo($, info, ".info-item:nth-child(5) .info-value a");
        data.status = status == 'On going' ? 'ACTIVE' : 'COMPLETED';
        data.translators = [];
        let translator = $(".fantrans-name").text().trim();
        if (translator) {
            data.translators.push(translator);
        }
        let view = $('.statistic-list .statistic-item:nth-child(3) .statistic-value').text().trim();
        data.view = view;
        let description = $('.summary-content');
        if (description) {
            data.description = $(description).text().trim();
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
                        crawl_url: $(element).attr('href'),
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
