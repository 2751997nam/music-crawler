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

class ListSingerParser extends BaseParser {
    async init(html, input) {
        const $ = cheerio.load(html);
        this.crawlUrl = input.crawl_url;
        this.crawlId = input.crawl_id;
        console.log('ListSingerParser', this.crawlUrl);

        return await this.parse($);
    }

    async parse($) {
        let items = $('#nav-artist .search-line');
        let saveData = [];
        for (let item of items) {
            let img = $(item).find('img');
            let data = {
                image_url: '',
                name: '',
                slug: '',
                crawl_url: '',
            }
            if (img) {
                data.image_url  = $(img).attr('src');
            }
            let title = $(item).attr('title');
            data.name = title.trim();
            data.slug = util.slug(data.name);
            data.crawl_url = $(item).attr('href').includes('https') ? $(item).attr('href') : 'https://chiasenhac.vn' + $(item).attr('href');
            saveData.push(data);
        }
        await this.saveSingers(saveData);

        let paginationEle = $('#nav-artist .pagination li.active').not(':last-child');
        if (paginationEle) {
            let current = parseInt($(paginationEle).text().trim());
            console.log('current', current);
            if (!isNaN(current)) {
                let params = new URLSearchParams(this.crawlUrl.substring(this.crawlUrl.indexOf('?') + 1));
                if (params && params.get('page_artist') && params.get('page_artist') > current) {
                    return;
                }
                let nextUrl = this.crawlUrl.replace(`page_artist=${current}`, `page_artist=${current + 1}`);
                if (nextUrl != this.crawlUrl) {
                    return nextUrl;
                }
            }
        }
    }

    async saveSingers (data) {
        let retVal = [];
        for (let item of data) {
            console.log('singer', item);
            let singer = await Singer.query().where('slug', item.slug).where('crawl_url', item.crawl_url).first();
            if (singer) {
                // singer.crawl_url = item.crawl_url;
                // if (item.image_url && item.image_url != singer.image_url) {
                //     singer.image_url = item.image_url;
                // }
                // await singer.save();
            } else {
                singer = new Singer();
                singer.name = item.name;
                singer.slug = item.slug;
                singer.crawl_url = item.crawl_url.replace('/\s+/g', '%20');
                if (item.image_url) {
                    singer.image_url = item.image_url;
                }
                await singer.save();
                await Database.table('crawl_link').insert([{
                    crawl_url: item.crawl_url.replace('/\s+/g', '%20'),
                    target_type: item.crawl_url.includes('filter=ca-si') ? 'singer_search' : 'singer'
                }])
            }
            retVal.push(singer.id);
        }

        return retVal;
    }

    async afterParse(nextUrl) {
        if (nextUrl) {
            this.addJob('ListSingerListener', {
                crawl_id: this.crawlId,
                crawl_url: nextUrl,
                domain: this.getDomain(nextUrl),
            }, {priority: 1});
        }
    }

    
}

module.exports = ListSingerParser;