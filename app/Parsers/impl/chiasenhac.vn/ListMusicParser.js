"use strict";
const cheerio = require("cheerio");
const util = use("App/Utils/util");
const Database = use("Database");
const Log = use('App/Utils/Log');

class MangaParser {
    async init(html, input) {
        const $ = cheerio.load(html);
        this.crawlUrl = input.crawl_url;

        return await this.parse($);
    }

    async parse($) {
    }
}