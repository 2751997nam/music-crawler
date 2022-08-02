"use strict";
const cheerio = require("cheerio");
const util = use("App/Utils/util");
const Database = use("Database");
const Log = use('App/Utils/Log');
const Author = use("App/Models/Author");
const Category = use("App/Models/Category");
const Album = use("App/Models/Album");
const Contributor = use("App/Models/Contributor");

class MusicParser {
    async init(html, input) {
        const $ = cheerio.load(html);
        this.crawlUrl = input.crawl_url;
        console.log('MusicParser', input.crawl_url);
        this.musicId = input.music_id;

        return await this.parse($);
    }

    async parse($) {
        let musicLinks = this.getMusicLinks($);
        if (musicLinks.length) {
            let info = this.getInfo($);
            await this.saveMusicLinks(musicLinks);
            await this.saveInfo(info);
            await Database.table('crawl_link')
                .where('target_id', this.musicId)
                .where('target_type', 'music')
                .update({
                    status: 'DONE'
                });
        } else {
            console.log('error: ', this.crawlUrl);
        }
    }

    getInfo ($) {
        let retVal = {
            categories: this.getCategories($),
            authors: [],
            album: null,
            year: '',
            lyric: this.getLyric($),
            listen_count: 0,
            download_count: 0,
            contributor: null
        }

        let elements = $('#companion_cover + .card-body li');
        for (let ele of elements) {
            let texts = $(ele).text().split(':');
            if (texts[0].trim() == 'Sáng tác') {
                let authors = texts[1].trim().split('; ');
                for (let author of authors) {
                    retVal.authors.push({
                        name: author.trim(),
                        slug: util.slug(author.trim())
                    });
                }
            }

            if (texts[0].trim() == 'Album') {
                retVal.album = {
                    name: texts[1].trim(),
                    slug: util.slug(texts[1].trim())
                }
            }

            if (texts[0].trim() == 'Năm phát hành') {
                retVal.year = texts[1].trim()
            }
        }

        let icons = $('.music-listen-title > span');

        if (icons && icons.length) {
            let texts = $(icons).text().replace(/\u00a0+/g, " ").split(' ');
            if (texts.length == 4) {
                retVal.listen_count = texts[1].trim().replace(/,/g, '');
                retVal.download_count = texts[3].trim().replace(/,/g, '');
            }
        }

        let contributors = $('.title2 .author');
        if (contributors && contributors.length) {
            retVal.contributor = {
                name: $(contributors[0]).text().trim(),
                slug: util.slug($(contributors[0]).text())
            }
        }

        return retVal;
    }

    getLyric ($) {
        let ele = $('#fulllyric');

        return $(ele).text();
    }

    getCategories ($) {
        let retVal = [];
        let elements = $('.breadcrumb-item');
        for (let ele of elements) {
            let name = $(ele).text().trim().replace('...', '');
            retVal.push({
                name: name,
                slug: util.slug(name)
            });
        }
        return retVal;
    }

    getMusicLinks($) {
        let items = $('#pills-download .download_item');
        let musicLinks = [];
        let firstUrl = {
            url: '',
            quality: '',
            extension: ''
        }
        for (let item of items) {
            let selectors = {
                '.c1': {
                    quality: 128,
                    extension: 'mp3'
                }, 
                '.c2': {
                    quality: 320,
                    extension: 'mp3'
                }, 
                '.c3': {
                    quality: 'm4a',
                    extension: 'm4a'
                }, 
                '.c4': {
                    quality: 'flac',
                    extension: 'flac'
                }
            };
            for (let selector of Object.keys(selectors)) {
                if ($(item).find(selector).length) {
                    let info = $(item).find(selector).text().split(' ');
                    if (info.length == 2) {
                        musicLinks.push({
                            url: $(item).attr('href'),
                            extension: selectors[selector].extension,
                            quality: selectors[selector].quality
                        })
                        if ($(item).attr('href') && !firstUrl.url) {
                            firstUrl.url = $(item).attr('href');
                            firstUrl.quality = selectors[selector].quality;
                            firstUrl.extension = selectors[selector].extension;
                        }
                    }
                }
            }
        }
        if (firstUrl.url) {
            for (let item of musicLinks) {
                if (!item.url) {
                    item.url = firstUrl.url.replace(`/${firstUrl.quality}/`, `/${item.quality}/`);
                    item.url = item.url.replace(`.${firstUrl.extension}`, `.${item.extension}`);
                }
            }
        }
        Log.info('musicLinks: ', musicLinks);

        return musicLinks;
    }

    async saveMusicLinks(links) {
        let saveData = [];
        for (let link of links) {
            saveData.push({...link, music_id: this.musicId});
        }
        await Database.table('music_link').where('music_id', this.musicId).delete();
        await Database.table('music_link').insert(saveData);
    }
    
    async saveInfo(info) {
        if (info.authors && info.authors.length) {
            await this.saveAuthors(info.authors);
        }

        if (info.categories && info.categories.length) {
            await this.saveCategories(info.categories);
        }

        if (info.album) {
            await this.saveAlbum(info.album);
        }

        let meta = [];
        if (info.lyric) {
            meta.push({
                music_id: this.musicId,
                key: 'lyric',
                value: info.lyric
            })
        }

        if (info.year) {
            meta.push({
                music_id: this.musicId,
                key: 'year',
                value: info.year
            })
        }

        if (meta.length) {
            await this.saveMeta(meta);
        }

        if (info.contributor) {
            await this.saveContributor(info.contributor);
        }

        await Database.table('music').where('id', this.musicId).update({
            listen_count: info.listen_count,
            download_count: info.download_count
        })
    }

    async saveContributor (data) {
        let retVal = [];
        let contributor = await Contributor.query().where('slug', data.slug).first();
        if (contributor) {

        } else {
            contributor = new Contributor();
            contributor.name = data.name;
            contributor.slug = data.slug;
            await contributor.save();
        }
        retVal.push(contributor.id);

        await Database.table('music_n_contributor').where('music_id', this.musicId).delete();
        await Database.table('music_n_contributor').insert({
            music_id: this.musicId,
            contributor_id: contributor.id
        });

        return retVal;
    }

    async saveAuthors (data) {
        let retVal = [];
        for (let item of data) {
            let author = await Author.query().where('slug', item.slug).first();
            if (author) {
            } else {
                author = new Author();
                author.name = item.name;
                author.slug = item.slug;
                await author.save();
            }
            retVal.push(author.id);
        }

        let mns = [];
        for (let authorId of retVal) {
            mns.push({
                author_id: authorId,
                music_id: this.musicId
            });
        }
        await Database.table('music_n_author').where('music_id', this.musicId).delete();
        await Database.table('music_n_author').insert(mns);

        return retVal;
    }

    async saveCategories (data) {
        let retVal = [];
        for (let item of data) {
            let category = await Category.query().where('slug', item.slug).first();
            if (category) {
            } else {
                category = new Category();
                category.name = item.name;
                category.slug = item.slug;
                await category.save();
            }
            retVal.push(category.id);
        }

        let mns = [];
        for (let categoryId of retVal) {
            mns.push({
                category_id: categoryId,
                music_id: this.musicId
            });
        }
        await Database.table('music_n_category').where('music_id', this.musicId).delete();
        await Database.table('music_n_category').insert(mns);

        return retVal;
    }

    async saveAlbum (data) {
        let retVal = [];
        let album = await Album.query().where('slug', data.slug).first();
        if (album) {

        } else {
            album = new Album();
            album.name = data.name;
            album.slug = data.slug;
            await album.save();
        }
        retVal.push(album.id);

        await Database.table('music_n_album').where('music_id', this.musicId).delete();
        await Database.table('music_n_album').insert({
            music_id: this.musicId,
            album_id: album.id
        });

        return retVal;
    }

    async saveMeta (data) {
        let keys = [];
        for (let item of data) {
            keys.push(item.key);
        }

        await Database.table('music_meta')
            .where('music_id', this.musicId)
            .whereIn('key', keys)
            .delete();

        await Database.table('music_meta').insert(data);
    }
}

module.exports = MusicParser;