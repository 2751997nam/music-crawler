"use strict";
const cheerio = require("cheerio");
const util = require("../../Utils/util");
const BaseParser = require("../BaseParser");
const Manga = use("App/Models/Manga");
const Database = use("Database");

class MangaParser extends BaseParser {
    async init(html, input) {
        const $ = cheerio.load(html);
        this.crawlUrl = input.crawl_url;
        this.siteUrl = 'https://manhwa18.net/';
        console.log(input.crawl_url);
        await this.parse($);
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
        data.status = this.parseInfo($, info, "li:nth-child(5) a");
        data.translators = this.parseInfo($, info, "li:nth-child(6) a", 'multiple');
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
            await this.saveData(data);
        }
    }

    async saveManga(manga, data) {
        let keys = ['name', 'slug', 'status', 'image', 'description'];
        for (let key of keys) {
            if (manga[key] != data[key]) {
                manga[key] = data[key];
            }
        }
        await manga.save();
    }

    async saveData(data) {
        let manga = await Manga.findBy('crawl_url', this.crawlUrl);
        if (manga) {
            await this.saveManga(manga, data);
        } else {
            manga = new Manga();
            manga.name = data.name;
            manga.slug = util.slug(data.name);
            manga.image = data.image;
            manga.status = data.status;
            manga.description = data.description;
            manga.crawl_url = data.crawl_url;
            await manga.save();
        }
        for (let item of data.categories) {
            await this.saveRelation(manga.id, item, 'category', 'category_n_manga', 'category_id');
        }
        for (let item of data.authors) {
            await this.saveRelation(manga.id, item, 'author', 'author_n_manga', 'author_id');
        }
        for (let item of data.translators) {
            await this.saveRelation(manga.id, item, 'translator', 'manga_n_translator', 'translator_id');
        }
        for (let item of data.chapters) {
            await this.saveOneToManyRelation(manga.id, item, 'chapter');
        }

        console.log('parsed manga: ', manga.name);
    }

    async saveOneToManyRelation(mangaId, data, table) {
        let obj = await Database.table(table)
            .where('slug', data.slug)
            .first();
        if (!obj) {
            data.manga_id = mangaId;
            await Database.table(table).insert(data);
        } else {
            await Database.table(table).where('slug', data.slug).update(data);
        }
    }

    async saveRelation(mangaId, name, table, pivot, column) {
        let slug = util.slug(name);
        let objID = await Database.table(table)
            .where('slug', slug)
            .first();
        if (!objID) {
            objID = await Database.table(table).insert({
                name: name,
                slug: slug,
            });
        } else {
            objID = objID.id;
        }
        let pivotObj = await Database.table(pivot)
            .where('manga_id', mangaId)
            .where(column, objID)
            .first();
        if (!pivotObj) {
            let data = {};
            data.manga_id = mangaId;
            data[column] = objID;
            await Database.table(pivot).insert(data);
        }
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
            console.log(error.message);
        }

        return retVal;
    }
}

module.exports = MangaParser;
