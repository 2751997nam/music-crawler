"use strict";
const cheerio = require("cheerio");
const util = use("App/Utils/util");
const BaseParser = use("App/Parsers/BaseParser");
const Manga = use("App/Models/Manga");
const Chapter = use("App/Models/Chapter");
const Database = use("Database");
const Log = use('App/Utils/Log');

class MangaParser extends BaseParser {
    getDB() {
        return Database.connection('mysql_vi');
    }

    table(table) {
        return this.getDB().table(table);
    }

    async init(html, input) {
        const $ = cheerio.load(html);
        this.crawlUrl = input.crawl_url;
        this.siteUrl = 'https://saytruyen.net/';
        return await this.parse($);
    }

    async parse($) {
        let infoCover = $(".summary_image .img-responsive");
        let info = $('.profile-manga');
        let image = $(infoCover).attr('src');
        let data = {};
        if (image) {
            data.image = image;
        }
        data.name = this.parseInfo($, info, ".post-title h1");
        data.slug = util.slug(data.name);
        data.alt_name = this.parseInfo($, info, ".summary_content .post-content .post-content_item:nth-child(3) .summary-content");
        data.authors = this.parseInfo(
            $,
            info,
            ".summary_content .post-content .post-content_item:nth-child(4) .author-content a",
            "multiple"
        );
        data.categories = this.parseInfo(
            $,
            info,
            ".summary_content .post-content .post-content_item:nth-child(8) .author-content a",
            "multiple"
        );
        let status = this.parseInfo($, info, ".summary_content .post-content .post-content_item:nth-child(7) .summary-content");
        data.status = status == 'OnGoing' ? 'ACTIVE' : 'COMPLETED';
        data.translators = [];
        let view = this.parseInfo($, info, '.summary_content .post-content .post-content_item:nth-child(5) .summary-content');
        view = view.trim();
        data.view = view;
        let description = $('.c-page-content .description-summary .summary__content');
        if (description) {
            data.description = $(description).html();
        }
        data.chapters = [];
        let listChapters = $('.list-chapter ul.box-list-chapter li.wp-manga-chapter');
        if (listChapters) {
            let chapters = [];
            listChapters.each((index, element) => {
                let ele = $(element).find('a');
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
        let manga = await Manga.DBConnection('mysql_vi').query().where((query) => {
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
            await manga.DBConnection('mysql_vi').save();
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
            let ignoreChapters = await this.table('chapter').whereIn(checkField, fields).where('manga_id', manga.id).select(checkField);
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
            await this.table('chapter').insert(item);
        }

        return newChapters;
    }

    async saveOneToManyRelation(mangaId, data, table) {
        let obj = await this.table(table)
            .where('crawl_url', data.crawl_url)
            .first();
        if (!obj) {
            data.manga_id = mangaId;
            await this.table(table).insert(data);
        } else {
            await this.table(table).where('slug', data.slug).update(data);
        }
    }

    async saveRelation(mangaId, name, table, pivot, column) {
        let slug = util.slug(name);
        let objID = await this.table(table)
            .where('slug', slug)
            .first();
        if (!objID) {
            objID = await this.table(table).insert({
                name: name,
                slug: slug,
            });
        } else {
            objID = objID.id;
        }
        let pivotObj = await this.table(pivot)
            .where('manga_id', mangaId)
            .where(column, objID)
            .first();
        if (!pivotObj) {
            let data = {};
            data.manga_id = mangaId;
            data[column] = objID;
            await this.table(pivot).insert(data);
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
