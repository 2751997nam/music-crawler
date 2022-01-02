"use strict";
const cheerio = require("cheerio");
const util = use("App/Utils/util");
const BaseParser = use("App/Parsers/BaseParser");
const Manga = use("App/Models/Manga");
const Chapter = use("App/Models/Chapter");
const Database = use("Database");
const Log = use('App/Utils/Log');

class MangaChapterParser extends BaseParser {
    async init(html, input) {
        const $ = cheerio.load(html);
        this.crawlUrl = input.crawl_url;
        this.siteUrl = 'https://manhwa18.net/';
        return await this.parse($);
    }

    async parse($) {
        let data = {};
        let info = $('.manga-info');
        data.name = this.parseInfo($, info, "h3");
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
        let retVal = [];
        if (data) {
            data.crawl_url = this.crawlUrl;
            retVal = await this.saveData(data);
        }
        Log.info('parsed manga chapter: ', data.name);

        return retVal;
    }

    async saveData(data) {
        let manga = await Manga.findBy('crawl_url', this.crawlUrl);
        let chapterBySlug = {};
        let slugs = [];
        for (let item of data.chapters) {
            slugs.push(item.slug);
            chapterBySlug[item.slug] = item;
        }
        let ignoreSlugs = await Chapter.query().whereIn('slug', slugs).pluck('slug');
        let ignoreSlugKeys = {};
        for (let slug of ignoreSlugs) {
            ignoreSlugKeys[slug] = 1;
        }
        let newChapters = [];
        for (let slug of slugs) {
            if (!ignoreSlugKeys[slug]) {
                newChapters.push(chapterBySlug[slug]);
            }
        }
        Log.info('newChapters ', newChapters);
        for (let item of newChapters) {
            await this.saveOneToManyRelation(manga.id, item, 'chapter');
        }

        return newChapters;
    }

    async saveOneToManyRelation(mangaId, data, table) {
        data.manga_id = mangaId;
        await Database.table(table).insert(data);
    }

    parseInfo($, container, selector, type = "single") {
        let retVal = type == "single" ? "" : [];
        try {
            let elements = $(container).find(selector);
            if (type == "single" && elements) {
                retVal = $(elements).text();
            } else if (elements) {
                elements.each((index, element) => {
                    retVal.push($(element).html());
                });
            }
        } catch (error) {
            Log.error(error.message);
        }

        return retVal;
    }

    getListenerAfterParse() {
        return 'ChapterListener';
    }
}

module.exports = MangaChapterParser;
