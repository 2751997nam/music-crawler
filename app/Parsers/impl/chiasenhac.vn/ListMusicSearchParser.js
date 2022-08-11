"use strict";
const cheerio = require("cheerio");
const Music = use("App/Models/Music");
const Singer = use("App/Models/Singer");
const util = use("App/Utils/util");
const Database = use("Database");
const Log = use('App/Utils/Log');
const md5 = require('md5');
const BaseParser = require("../../BaseParser");
const DateTime = require('date-and-time');

class ListMusicSearchParser extends BaseParser {
    async init(html, input) {
        const $ = cheerio.load(html);
        this.crawlUrl = input.crawl_url;
        this.crawlId = input.crawl_id;
        console.log('ListMusicSearchParser', this.crawlUrl);

        return await this.parse($);
    }

    async parse($) {
        let items = $('#nav-music .media');
        let saveData = [];

        for (let item of items) {
            let img = $(item).find('img');
            let data = {
                image_url: '',
                name: '',
                slug: '',
                crawl_url: '',
                singers: []
            }
            if (img) {
                data.image_url  = $(img).attr('src');
            }
            let title = $(item).find('.media-title');
            if (title) {
                data.name = $(title).text().trim();
                data.slug = util.slug(data.name);
                data.crawl_url = $(title).find('a').attr('href');
            }
            let singers = $(item).find('.author a');
            if (singers && singers.length) {
                for (let singer of singers) {
                    let singerData = {
                        name: $(singer).text().trim(),
                        slug: util.slug($(singer).text().trim()),
                        crawl_url: $(singer).attr('href').includes('https') ? $(singer).attr('href') : 'https://chiasenhac.vn' + $(singer).attr('href')
                    };
                    data.singers.push(singerData);
                }
            }
            let result = await this.saveMusic(data);
            if (result) {
                result.domain = this.getDomain(result.crawl_url);
                result.music_id = result.id;
                this.addJob('MusicListener', result);
            }
        }

        let paginationEle = $('#nav-music .pagination li.active').not(':last-child');
        if (paginationEle) {
            let current = parseInt($(paginationEle).text().trim());
            if (!isNaN(current)) {
                let params = new URLSearchParams(this.crawlUrl.substring(this.crawlUrl.indexOf('?') + 1));
                if (params && params.get('page') && params.get('page') > current) {
                    continue;
                }
                let nextUrl = this.crawlUrl.replace(`page_music=${current}`, `page_music=${parseInt(current) + 1}`);
                if (nextUrl != this.crawlUrl) {
                    return nextUrl;
                } else {
                    await this.updateTime();
                }
            } else {
                await this.updateTime();
            }
        } else {
            await this.updateTime();
        }
    }

    async updateTime() {
        if (this.crawlId) {
            await Database.table('crawl_link').where('id', this.crawlId).update({
                updated_at: DateTime.format(new Date(), 'YYYY-MM-DD HH:mm:ss')
            })
        }
    }

    async saveMusic (data) {
        let md5Url = md5(data.crawl_url);
        let music = await Music.query().where('md5_crawl_url', md5Url).first();
        if (music) {
            // let isUpdate = await this.updateMusic(music, data);
        } else {
            music = new Music();
            music.name = data.name;
            music.slug = data.slug;
            music.image_url = data.image_url;
            music.crawl_url = data.crawl_url;
            music.md5_crawl_url = md5Url;
            await music.save();
            await Database.table('crawl_link').insert([{
                crawl_url: data.crawl_url,
                target_id: music.id,
                target_type: 'music'
            }])
            if (data.singers && data.singers.length) {
                let singerIds = await this.saveSingers(data.singers);
                let mns = [];
                for (let singerId of singerIds) {
                    mns.push({
                        singer_id: singerId,
                        music_id: music.id
                    });
                }
                await Database.table('music_n_singer').insert(mns);
            }
        }
        return music;

    }

    async saveSingers (data) {
        let retVal = [];
        for (let item of data) {
            let singer = await Singer.query().where('slug', item.slug).where('crawl_url', item.crawl_url).first();
            if (singer) {
                singer.crawl_url = item.crawl_url;
                if (item.image_url && item.image_url != singer.image_url) {
                    singer.image_url = item.image_url;
                }
                await singer.save();
            } else {
                singer = new Singer();
                singer.name = item.name;
                singer.slug = item.slug;
                singer.crawl_url = item.crawl_url;
                if (item.image_url) {
                    singer.image_url = item.image_url;
                }
                await singer.save();
                await Database.table('crawl_link').insert([{
                    crawl_url: item.crawl_url,
                    target_type: item.crawl_url.includes('filter=ca-si') ? 'singer_search' : 'singer'
                }])
            }
            retVal.push(singer.id);
        }

        return retVal;
    }

    async afterParse(nextUrl) {
        if (nextUrl) {
            this.addJob('ListMusicSearchListener', {
                crawl_id: this.crawlId,
                crawl_url: nextUrl,
                domain: this.getDomain(nextUrl),
            }, {priority: 1});
        }
    }

    
}

module.exports = ListMusicSearchParser;