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
        this.siteUrl = 'https://manga18.info/';
        return await this.parse($);
    }

    async parse($) {
        let infoCover = $(".info-cover");
        let info = $('.manga-info');
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
        data.name = this.parseInfo($, info, "h3");
        let altName = this.parseInfo($, info, 'li:nth-child(2)');
        altName = altName.replace('Other names: ', '').trim();
        data.alt_name = altName.replace('Updating', '');
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
        data.categories = data.categories.filter(item => item != 'Webtoon');
        
        let status = this.parseInfo($, info, "li:nth-child(5) a");
        data.status = status == 'Completed' ? 'COMPLETED' : 'ACTIVE';
        let view = this.parseInfo($, info, 'li:nth-child(7)');
        view = view.replace('Views: ', '').trim();
        data.view = view.replace('.', '').replace('K', '0').replace('M', '000');
        let description = $('.summary-content p:first-child');
        if (description) {
            data.description = $(description).text().trim();
        }
        data.chapters = [];
        let listChapters = $('.list-chapters a');
        if (listChapters) {
            let chapters = [];
            listChapters.each((index, element) => {
                let ele = $(element).find('li .chapter-name');
                if (ele) {
                    let name = data.name + ' ' + $(ele).text().trim();
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
