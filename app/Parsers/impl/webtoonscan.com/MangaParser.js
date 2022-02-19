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
        this.siteUrl = 'https://webtoonscan.com';
        return await this.parse($);
    }

    async parse($) {
        let infoCover = $(".summary_image");
        let info = $('.summary_content_wrap > .summary_content > .post-content');
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
            data.image = data.image;
        }
        data.name = $(".post-title h1");
        let altName = this.parseInfo($, info, '.post-content_item:nth-child(2) .summary-content');
        data.alt_name = altName.trim().replace('Updating...', '');
        data.slug = util.slug(data.name);
        data.authors = this.parseInfo(
            $,
            info,
            '.post-content_item:nth-child(3) .summary-content .author-content a',
            "multiple"
        );
        data.categories = this.parseInfo(
            $,
            info,
            '.post-content_item:nth-child(5) .summary-content .genres-content a',
            "multiple"
        );

        let status = $(".summary_content_wrap > .summary_content > .post-status .post-content_item:nth-child(2) .summary-content").trim();
        data.status = status == 'Completed' ? 'COMPLETED' : 'ACTIVE';
        data.translators = [];
        let translator = this.parseInfo(
            $,
            info,
            '.post-content_item:nth-child(4) .summary-content .artist-content a',
            "multiple"
        );

        let description = $('.dsct');
        if (description) {
            data.description = $(description).text().trim();
        }

        data.chapters = [];
        let listChapters = $('#chapterlist .row-content-chapter li');
        if (listChapters) {
            let chapters = [];
            listChapters.each((index, element) => {
                let ele = $(element).find('a');
                if (ele) {
                    let name = data.name + ' ' + $(ele).text().trim();
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
        console.log(data);
        return [];
        if (data) {
            data.crawl_url = this.crawlUrl;
            return await this.saveData(data);
        }

        return [];
    }
}

module.exports = MangaParser;
