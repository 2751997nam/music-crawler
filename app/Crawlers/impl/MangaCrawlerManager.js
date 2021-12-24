"use strict";

const BaseCrawler = require("../BaseCrawler");

const Database = use("Database");
const Config = use('Config');
const Log = use('App/Utils/Log');
const Helpers = use('Helpers');
const dir = Helpers.appRoot() + '/app';
const Util = use('App/Utils/util');

class MangaCrawlerManager extends BaseCrawler {
    async init(filter = null) {
        let crawlUrls = null;
        if (filter) {
            crawlUrls = filter.crawlUrls;
        }
        if (!filter) {
            crawlUrls = await this.getCrawlUrls();
        }
        else if (filter.all) {
            crawlUrls = await this.getCrawlUrls(filter.domain);
        }

        for (let item of crawlUrls) {
            this.addJob("MangaListener", {crawl_url: item, domain: this.getDomain(item)});
        }
    }

    async getCrawlUrls(domain = null) {
        let retVal = [];
        if (domain) {
        } else {
            let classes = this.loadClass(dir + '/Crawlers/impl/MangaCrawlers');
            for (let item of classes) {
                let urls = await item.getCrawlUrls();
                retVal = retVal.concat(urls);
            }
        }

        return retVal;
    }

    loadClass(dir) {
        let retVal = [];
        var classPaths = Util.browseFiles(dir);
        classPaths.forEach(function (classPath) {
            if (classPath.indexOf(".js") === (classPath.length - 3)) {
                var crawler = new (require(classPath))();
                retVal.push(crawler);
            }
        });

        return retVal;
    };
}

module.exports = MangaCrawlerManager;
