"use strict";
const cheerio = require("cheerio");
const util = use("App/Utils/util");
const BaseParser = use("App/Parsers/BaseParser");
const Manga = use("App/Models/Manga");
const Chapter = use("App/Models/Chapter");
const Database = use("Database");
const Log = use('App/Utils/Log');
const Config = use("Config");
const axios = require('axios');
const fse = require('fs-extra');

class BaseMangaParser extends BaseParser {
    async saveManga(manga, data) {
        let keys = ['description', 'alt_name'];
        let isUpdate = false;
        for (let key of keys) {
            if (!manga[key] && data[key]) {
                manga[key] = data[key];
                isUpdate = true;
            }
        }
        // if (data.status != manga.status && data.status == 'COMPLETED') {
        //     manga.status = data.status;
        //     isUpdate = true;
        // }
        if (isUpdate) {
            await manga.save();
        }

        return isUpdate;
    }

    async saveData(data) {
        let manga = await Manga.query().where((query) => {
            query.where('crawl_url', this.crawlUrl)
                .orWhere('slug', data.slug);
        }).first();
        let syncId = null;
        if (manga) {
            let isUpdate = await this.saveManga(manga, data);
            if (isUpdate && Config.get('sync.enable')) {
                syncId = await this.syncManga(manga);
            }
        } else {
            manga = new Manga();
            manga.name = data.name;
            manga.alt_name = data.alt_name;
            manga.slug = data.slug;
            manga.image = await this.downloadImage(data.image, data);
            manga.status = data.status;
            manga.description = data.description;
            manga.crawl_url = data.crawl_url;
            manga.view = data.view;
            await manga.save();
            for (let item of data.categories) {
                await this.saveRelation(manga.id, item, 'category', 'manga_n_category', 'category_id');
            }
            for (let item of data.authors) {
                await this.saveRelation(manga.id, item, 'author', 'manga_n_author', 'author_id');
            }
            for (let item of data.translators) {
                await this.saveRelation(manga.id, item, 'translator', 'manga_n_translator', 'translator_id');
            }
            data.id = manga.id;
            data.image = manga.image;
            if (Config.get('sync.enable')) {
                syncId = await this.syncManga(data);
            }
        }
        let chapters = await this.saveChapters(manga, data);

        for (let i = 0; i < chapters.length; i++) {
            chapters[i].manga_name = manga.name;
            chapters[i].sync_manga_id = syncId;
        }

        Log.info('parsed manga: ', manga.name);

        return chapters;
    }

    async downloadImage (url, manga) {
        let basePath = '/images/avatars/' + manga.slug + '.jpg';
        let path = './public' + basePath;

        axios(Config.get('sync.download_image_url'), {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            data: {
                url: url,
                path: basePath,
                token: Config.get('sync.sync_token')
            }
        })

        axios({
            url,
            responseType: 'stream',
        }).then(async response => {
            fse.outputFileSync(path, '');
            return new Promise((resolve, reject) => {
                response.data.pipe(fse.createWriteStream(path, {
                    flags: 'w'
                }))
                .on('error',(error)=>{
                    console.log(error)
                    reject(false);
                })
                .on('finish', function (err) {
                    resolve(true);
                });
            })
        }).catch(error => {
            console.log(error);
            Log.info('downloadImage ', error);
            return false;
        });

        return basePath;
    }

    async syncManga(data) {
        let manga = {
            id: data.id,
            name: data.name,
            alt_name: data.alt_name,
            slug: data.slug,
            image: data.image,
            status: data.status,
            description: data.description,
            crawl_url: data.crawl_url,
            view: data.view,
            categories: data.categories,
            authors: data.authors,
            translators: data.translators,
        };
        manga.token = Config.get('sync.sync_token');
        let syncUrl = Config.get('sync.sync_url') + '/api/save-manga';
        return axios.post(syncUrl, manga).then(res => {
            Log.info('sync manga res: ',  JSON.stringify(res.data))
            Log.info('sync manga ', manga.name);
            if (res.data.status && res.data.status == 'successful' && res.data.result) {
                return res.data.result.id;
            }
        }).catch(error => {
            console.log('sync error', error);
            return null;
        })
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
        newChapters = await this.getNewChapters(manga, newChapters, 'sorder');
        if (newChapters.length) {
            Log.info('newChapters ', newChapters);
        }
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
                    retVal.push($(element).text().trim());
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

module.exports = BaseMangaParser