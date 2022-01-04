"use strict";
const cheerio = require("cheerio");
const util = use("App/Utils/util");
const BaseParser = use("App/Parsers/BaseParser");
const Manga = use("App/Models/Manga");
const Chapter = use("App/Models/Chapter");
const Database = use("Database");
const Log = use('App/Utils/Log');

class MangaParser extends BaseParser {
    async init(html, input) {
        const $ = cheerio.load(html);
        this.crawlUrl = input.crawl_url;
        this.siteUrl = 'https://truyendep.net/';
        return await this.parse($);
    }

    async parse($) {
        let infoCover = $(".truyen_info_left");
        let info = $('.truyen_info_right');
        let image = $(infoCover).find(".wp-post-image");
        let data = {};
        if (image) {
            data.image = $(image)
                .attr("src");
        }
        data.name = this.parseInfo($, info, "h1.entry-title");
        data.slug = util.slug(data.name);
        data.authors = this.parseInfo(
            $,
            info,
            "li:nth-child(2) a",
            "multiple"
        );
        data.categories = this.parseInfo(
            $,
            info,
            "li:nth-child(3) a",
            "multiple"
        );
        let status = this.parseInfo($, info, "li:nth-child(4) a");
        data.status = status == 'Đang tiến hành' ? 'ACTIVE' : 'COMPLETED';
        data.translators = this.parseInfo($, info, "li:nth-child(5) a", 'multiple');
        data.view = 0;
        data.description = '';
        data.chapters = [];
        let listChapters = $('.chapter-list .row');
        if (listChapters) {
            let chapters = [];
            listChapters.each((index, element) => {
                let ele = $(element).find('a');
                if (ele) {
                    let name = $(ele).text();
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

        console.log('manga data', data);

        return [];
    }

    async saveManga(manga, data) {
        let keys = ['name', 'slug', 'status', 'image', 'description', 'view'];
        for (let key of keys) {
            if (manga[key] != data[key]) {
                manga[key] = data[key];
            }
        }
        await manga.save();
    }

    async saveData(data) {
        let manga = await Manga.query().where((query) => {
            query.where('crawl_url', this.crawlUrl)
                .orWhere('slug', data.slug);
        }).first();
        if (manga) {
            await this.saveManga(manga, data);
        } else {
            manga = new Manga();
            manga.name = data.name;
            manga.slug = data.slug;
            manga.image = data.image;
            manga.status = data.status;
            manga.description = data.description;
            manga.crawl_url = data.crawl_url;
            manga.view = data.view;
            await manga.save();
            for (let item of data.categories) {
                await this.saveRelation(manga.id, item, 'category', 'category_n_manga', 'category_id');
            }
            for (let item of data.authors) {
                await this.saveRelation(manga.id, item, 'author', 'manga_n_author', 'author_id');
            }
            for (let item of data.translators) {
                await this.saveRelation(manga.id, item, 'translator', 'manga_n_translator', 'translator_id');
            }
        }
        let chapters = await this.saveChapters(manga, data);

        Log.info('parsed manga: ', manga.name);

        return chapters;
    }

    async getNewChapters (manga, chapters, checkField) {
        let chapterByField = {};
        let fields = [];
        for (let item of chapters) {
            fields.push(item[checkField]);
            chapterByField[item[checkField]] = item;
        }
        let newChapters = [];

        try {
            let ignoreChapters = await Database.table('chapter').whereIn(checkField, fields).where('manga_id', manga.id).select(checkField);
            let ignoreFields = ignoreChapters.map(item => item[checkField]);
            let ignoreUrlFields = {};
            for (let field of ignoreFields) {
                ignoreUrlFields[field] = 1;
            }
            for (let field of fields) {
                if (!ignoreUrlFields[field]) {
                    newChapters.push(chapterByField[field]);
                }
            }
            
        } catch (error) {
            Log.error('getNewChapters ', error);
        }

        return newChapters;
    }

    async saveChapters (manga, data) {
        let newChapters = await this.getNewChapters(manga, data.chapters, 'crawl_url');
        newChapters = await this.getNewChapters(manga, newChapters, 'slug');
        Log.info('newChapters ', newChapters);
        for (let item of newChapters) {
            item.manga_id = manga.id;
            await Database.table('chapter').insert(item);
        }

        return newChapters;
    }

    async saveOneToManyRelation(mangaId, data, table) {
        let obj = await Database.table(table)
            .where('crawl_url', data.crawl_url)
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
            Log.error(error.message);
        }

        return retVal;
    }

    getListenerAfterParse() {
        return 'ChapterListener';
    }
}

module.exports = MangaParser;
